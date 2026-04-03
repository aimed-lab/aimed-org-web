import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHmac } from "crypto"
import {
  isAdminEmail,
  getAdminRole,
  validatePasscode,
  generateMagicCode,
} from "@/lib/auth"
import { sendMagicCode } from "@/lib/email"
import { prisma } from "@/lib/db"

// Secret for signing magic codes — uses RESEND_API_KEY as entropy + fallback
const HMAC_SECRET = process.env.HMAC_SECRET || process.env.RESEND_API_KEY || "dev-secret-change-me"

function signCode(email: string, code: string, expiresAt: number): string {
  const payload = `${email}:${code}:${expiresAt}`
  return createHmac("sha256", HMAC_SECRET).update(payload).digest("hex")
}

/**
 * POST /api/auth
 * Body: { action, ... }
 *
 * Actions:
 *   "send-magic-code"  — { email, passcode } → validate passcode, send 6-digit code by email
 *   "verify-magic-code" — { email, code }     → verify 6-digit code → set cookie & login
 *   "login-code"        — { email, code }     → legacy activation code login (lab members)
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
        try {
          const member = await prisma.labMember.findUnique({
            where: { email: normalizedEmail },
          })
          isMember = !!member
        } catch {
          // DB may not be available in production — admin emails still work
        }
      }

      if (!isRecognized && !isMember) {
        return NextResponse.json(
          { error: "This email is not registered. Please contact the lab admin." },
          { status: 401 }
        )
      }

      // Generate 6-digit code with 10-minute expiry
      const code = generateMagicCode()
      const expiresAt = Date.now() + 10 * 60 * 1000

      // Sign the code (HMAC) so we can verify it without database storage
      const signature = signCode(normalizedEmail, code, expiresAt)

      // Send via email
      const result = await sendMagicCode(normalizedEmail, code)
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to send email" },
          { status: 500 }
        )
      }

      // Store the signed code in a httpOnly cookie for verification
      const cookieStore = await cookies()
      cookieStore.set("magic_pending", JSON.stringify({
        email: normalizedEmail,
        expiresAt,
        sig: signature,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 600, // 10 minutes
        path: "/",
      })

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
      const cookieStore = await cookies()

      // Read the pending magic code from cookie
      const pendingRaw = cookieStore.get("magic_pending")?.value
      if (!pendingRaw) {
        return NextResponse.json({ error: "No pending code. Please request a new one." }, { status: 401 })
      }

      let pending: { email: string; expiresAt: number; sig: string }
      try {
        pending = JSON.parse(pendingRaw)
      } catch {
        return NextResponse.json({ error: "Invalid session. Please request a new code." }, { status: 401 })
      }

      // Check email matches
      if (pending.email !== normalizedEmail) {
        return NextResponse.json({ error: "Email mismatch. Please request a new code." }, { status: 401 })
      }

      // Check expiry
      if (Date.now() > pending.expiresAt) {
        cookieStore.delete("magic_pending")
        return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 401 })
      }

      // Verify HMAC signature
      const expectedSig = signCode(normalizedEmail, code.trim(), pending.expiresAt)
      if (expectedSig !== pending.sig) {
        return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 401 })
      }

      // Code is valid — clear the pending cookie
      cookieStore.delete("magic_pending")

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
      try {
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
      } catch {
        return NextResponse.json({ error: "Database unavailable" }, { status: 500 })
      }
    }

    // ── Legacy: Login via Activation Code (for backward compat) ─────────────
    if (action === "login-code") {
      const { email, code } = body
      if (!email || !code) {
        return NextResponse.json({ error: "Email and activation code required" }, { status: 400 })
      }

      const normalizedEmail = email.toLowerCase().trim()

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
  cookieStore.delete("magic_pending")
  return NextResponse.json({ success: true })
}
