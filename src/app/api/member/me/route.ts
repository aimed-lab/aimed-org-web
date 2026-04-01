import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("member_token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    let payload: { memberId: number; email: string; ts: number }
    try {
      payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const member = await prisma.labMember.findUnique({
      where: { id: payload.memberId },
      include: {
        goals: { orderBy: { quarter: "desc" } },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Failed to fetch member profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
