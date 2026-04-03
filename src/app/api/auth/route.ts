import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  isAdminEmail,
  getAdminRole,
  validatePasscode,
  generateMagicCode,
  verifyAdminToken,
} from "@/lib/auth"
import { sendMagicCode } from "@/lib/email"
import { prisma } from "@/lib/db"

/**
 * POST /api/auth
 * Body: { action, ... }
 *
 * Actions:
 *   "send-magic-code"  — { email, passcode } → validate passcode, send 6-digit code by email
 *   "verify-magic-code" — { email, code }     → verify 6-digit code → set cookie & login
 *   "login-code"        — { email, code }     → legacy activation code login (lab members)
 *   "logout"            — clear cookies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || "send-magic-code"

    // ── Step 1: Send Magic Code (email + passcode → 6-digit code by email) ──
    if (action === "send-magic-code") {
      const { email, passcode } = body
      if (!email || !passcode) {
        return NextResponse.json({ error: "Email and passcode are required" }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Validate the shared passcode
      if (!validatePasscode(passcode)) {
        return NextResponse.json({ error: "Invalid passcode" }, { status: 401 })
      }

      // Check if this is a recognized user (admin or lab member)
      const isRecognized = isAdminEmail(normalizedEmail)
      let isMember = false
      if (!isRecognized) {
        const member = await prisma.labMember.findUnique({
          where: { email: normalizedEmail },
        })
        isMember = !!member
      }

      if (!isRecognized && !isMember) {
        return NextResponse.json(
          { error: "This email is not registered. Please contact the lab admin." },
          { status: 401 }
        )
      }

      // Generate 6-digit code
      const code = generateMagicCode()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Invalidate any existing codes for this email
      await prisma.magicCode.updateMany({
        where: { email: normalizedEmail, used: false },
        data: { used: true },
      })

      // Store the code
      await prisma.magicCode.create({
        data: { email: normalizedEmail, code, expiresAt },
      })

      // Send via email
      const result = await sendMagicCode(normalizedEmail, code)
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to send email" },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: "A 6-digit code has been sent to your email.",
      })
    }

    // ── Step 2: Verify Magic Code (6-digit code → login) ────────────────────
    if (action === "verify-magic-code") {
      const { email, code } = body
      if (!email || !code) {
        return NextResponse.json({ error: "Email and code are required" }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Find the most recent unused code for this email
      const magicCode = await prisma.magicCode.findFirst({
        where: {
          email: normalizedEmail,
          code: code.trim(),
          used: false,
        },
        orderBy: { createdAt: "desc" },
      })

      if (!magicCode) {
        return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 401 })
      }

      if (new Date() > magicCode.expiresAt) {
        return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 401 })
      }

      // Mark code as used
      await prisma.magicCode.update({
        where: { id: magicCode.id },
        data: { used: true },
      })

      const cookieStore = await cookies()

      // Determine role and set appropriate cookie
      if (isAdminEmail(normalizedEmail)) {
        const token = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString("base64")
        cookieStore.set("admin_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        })
        const role = getAdminRole(normalizedEmail)
        return NextResponse.json({
          success: true,
          redirect: "/admin/dashboard",
          role: role || "admin",
        })
      }

      // Regular lab member
      const member = await prisma.labMember.findUnique({
        where: { email: normalizedEmail },
      })

      if (!member) {
        return NextResponse.json({ error: "Member not found" }, { status: 401 })
      }

      const memberToken = Buffer.from(
        JSON.stringify({ memberId: member.id, email: member.email, ts: Date.now() })
      ).toString("base64")
      cookieStore.set("member_token", memberToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })

      return NextResponse.json({
        success: true,
        redirect: "/member/dashboard",
        role: "member",
      })
    }

    // ── Legacy: Login via Activation Code (for backward compat) ─────────────
    if (action === "login-code") {
      const { email, code } = body
      if (!email || !code) {
        return NextResponse.json({ error: "Email and activation code required" }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Check if this is a lab member with an activation code
      const member = await prisma.labMember.findUnique({
        where: { email: normalizedEmail },
        include: { activationCode: true },
      })

      if (!member || !member.activationCode) {
        return NextResponse.json({ error: "Invalid email or code" }, { status: 401 })
      }

      const ac = member.activationCode
      if (ac.code !== code) {
        return NextResponse.json({ error: "Invalid activation code" }, { status: 401 })
      }
      if (ac.used) {
        return NextResponse.json({ error: "This code has already been used. Please use the magic link login instead." }, { status: 401 })
      }
      if (new Date() > new Date(ac.expiresAt)) {
        return NextResponse.json({ error: "This code has expired. Please use the magic link login instead." }, { status: 401 })
      }

      // Mark code as used
      await prisma.activationCode.update({
        where: { id: ac.id },
        data: { used: true, usedAt: new Date() },
      })

      const cookieStore = await cookies()

      if (isAdminEmail(normalizedEmail)) {
        const token = Buffer.from(`${normalizedEmail}:${Date.now()}`).toString("base64")
        cookieStore.set("admin_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        })
        return NextResponse.json({ success: true, redirect: "/admin/dashboard", role: "admin" })
      }

      const memberToken = Buffer.from(
        JSON.stringify({ memberId: member.id, email: member.email, ts: Date.now() })
      ).toString("base64")
      cookieStore.set("member_token", memberToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })

      return NextResponse.json({ success: true, redirect: "/member/dashboard", role: "member" })
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 })
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  cookieStore.delete("member_token")
  return NextResponse.json({ success: true })
}
