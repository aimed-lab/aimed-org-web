import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { isAdminEmail, isOwnerEmail, verifyPassword, makeAdminToken, makeMemberToken } from "@/lib/auth"

const SHARED_ACTIVATION_CODE = process.env.MEMBER_ACTIVATION_CODE || process.env.ADMIN_ACTIVATION_CODE || "AIMED2026"

async function setMemberCookie(memberId: number, email: string) {
  const token = makeMemberToken(memberId, email)

  const cookieStore = await cookies()
  cookieStore.set("member_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  })
}

export async function POST(request: NextRequest) {
  try {
    const { email, code, password } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Admin/owner path: skip the activation code, but STILL require the password.
    // (Previously this granted an admin session on email alone — a full auth bypass.)
    if (isAdminEmail(normalizedEmail) || isOwnerEmail(normalizedEmail)) {
      const member = await prisma.labMember.findUnique({
        where: { email: normalizedEmail },
      })
      if (!member?.passwordHash || !password || !verifyPassword(password, member.passwordHash)) {
        return NextResponse.json(
          { error: "Invalid credentials. Please sign in at /admin." },
          { status: 401 }
        )
      }

      await setMemberCookie(member.id, normalizedEmail)

      // Also set a signed admin token for full access
      const adminToken = makeAdminToken(normalizedEmail)
      const cookieStore = await cookies()
      cookieStore.set("admin_token", adminToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      })

      return NextResponse.json({
        success: true,
        name: member.name,
        isAdmin: true,
      })
    }

    // Regular member: require activation code
    if (!code) {
      return NextResponse.json(
        { error: "Activation code is required" },
        { status: 400 }
      )
    }

    // Check if the member exists in the database
    const member = await prisma.labMember.findUnique({
      where: { email: normalizedEmail },
      include: { activationCode: true },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Email not found. Please contact your admin to be added to the lab." },
        { status: 401 }
      )
    }

    // Accept either the shared group code OR the per-member activation code
    const trimmedCode = code.trim()
    let authenticated = false

    // Check shared group activation code
    if (trimmedCode === SHARED_ACTIVATION_CODE) {
      authenticated = true
    }

    // Check per-member activation code (legacy support)
    if (!authenticated && member.activationCode) {
      const ac = member.activationCode
      if (ac.code === trimmedCode && !ac.used && new Date() <= ac.expiresAt) {
        authenticated = true
        // Mark per-member code as used
        await prisma.activationCode.update({
          where: { id: ac.id },
          data: { used: true, usedAt: new Date() },
        })
      }
    }

    if (!authenticated) {
      return NextResponse.json(
        { error: "Invalid activation code" },
        { status: 401 }
      )
    }

    await setMemberCookie(member.id, normalizedEmail)

    return NextResponse.json({ success: true, name: member.name })
  } catch (error) {
    console.error("Activation error:", error)
    return NextResponse.json({ error: "Activation failed" }, { status: 500 })
  }
}
