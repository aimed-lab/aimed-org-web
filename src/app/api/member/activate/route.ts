import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and activation code are required" },
        { status: 400 }
      )
    }

    // Find the member by email
    const member = await prisma.labMember.findUnique({
      where: { email },
      include: { activationCode: true },
    })

    if (!member || !member.activationCode) {
      return NextResponse.json(
        { error: "Invalid email or activation code" },
        { status: 401 }
      )
    }

    const ac = member.activationCode

    // Validate the code
    if (ac.code !== code) {
      return NextResponse.json(
        { error: "Invalid email or activation code" },
        { status: 401 }
      )
    }

    if (ac.used) {
      return NextResponse.json(
        { error: "This activation code has already been used" },
        { status: 401 }
      )
    }

    if (new Date() > ac.expiresAt) {
      return NextResponse.json(
        { error: "This activation code has expired. Please contact your admin." },
        { status: 401 }
      )
    }

    // Mark code as used
    await prisma.activationCode.update({
      where: { id: ac.id },
      data: { used: true, usedAt: new Date() },
    })

    // Create member session cookie
    const token = Buffer.from(
      JSON.stringify({ memberId: member.id, email: member.email, ts: Date.now() })
    ).toString("base64")

    const cookieStore = await cookies()
    cookieStore.set("member_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    })

    return NextResponse.json({ success: true, name: member.name })
  } catch (error) {
    console.error("Activation error:", error)
    return NextResponse.json({ error: "Activation failed" }, { status: 500 })
  }
}
