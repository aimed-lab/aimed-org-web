import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/db"
import { isAdminEmail } from "@/lib/auth"

/**
 * POST /api/member/register
 * Two-step registration for invited members:
 *   action: "verify"   — { email, code } → verify invitation, return memberId
 *   action: "complete" — { memberId, email, code, name, role, bio, ... } → update profile, set cookie, activate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    // ── Step 1: Verify invitation code ──────────────────────────
    if (action === "verify") {
      const { email, code } = body
      if (!email || !code) {
        return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

      const member = await prisma.labMember.findUnique({
        where: { email: normalizedEmail },
        include: { activationCode: true },
      })

      if (!member || !member.activationCode) {
        return NextResponse.json({ error: "Invalid email or activation code" }, { status: 401 })
      }

      const ac = member.activationCode
      if (ac.code !== code) {
        return NextResponse.json({ error: "Invalid activation code" }, { status: 401 })
      }
      if (ac.used) {
        return NextResponse.json({ error: "This code has already been used. Please contact your admin." }, { status: 401 })
      }
      if (new Date() > new Date(ac.expiresAt)) {
        return NextResponse.json({ error: "This invitation has expired. Please contact your admin." }, { status: 401 })
      }

      return NextResponse.json({ memberId: member.id, email: member.email })
    }

    // ── Step 2: Complete registration ───────────────────────────
    if (action === "complete") {
      const { memberId, email, code, name, role, bio, githubUsername, orcidId } = body

      if (!memberId || !email || !code || !name) {
        return NextResponse.json({ error: "Name is required" }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Re-verify the code (security)
      const member = await prisma.labMember.findUnique({
        where: { id: memberId, email: normalizedEmail },
        include: { activationCode: true },
      })

      if (!member || !member.activationCode || member.activationCode.code !== code) {
        return NextResponse.json({ error: "Invalid registration session" }, { status: 401 })
      }

      if (member.activationCode.used) {
        return NextResponse.json({ error: "This code has already been used" }, { status: 401 })
      }

      // Update the member profile with provided info
      await prisma.labMember.update({
        where: { id: memberId },
        data: {
          name: name.trim(),
          role: role || "Other",
          bio: bio || null,
          githubUsername: githubUsername || null,
          orcidId: orcidId || null,
          status: "ACTIVE",
          joinDate: new Date(),
        },
      })

      // Mark activation code as used
      await prisma.activationCode.update({
        where: { id: member.activationCode.id },
        data: { used: true, usedAt: new Date() },
      })

      // Set member cookie (log them in)
      const cookieStore = await cookies()
      const memberToken = Buffer.from(
        JSON.stringify({ memberId: member.id, email: normalizedEmail, ts: Date.now() })
      ).toString("base64")
      cookieStore.set("member_token", memberToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })

      // If admin email, also set admin cookie
      if (isAdminEmail(normalizedEmail)) {
        const adminToken = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString("base64")
        cookieStore.set("admin_token", adminToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
