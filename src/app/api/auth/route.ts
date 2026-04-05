import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createHmac } from "crypto"
import {
  isAdminEmail,
  getAdminRole,
  generateMagicCode,
  hashPassword,
  verifyPassword,
} from "@/lib/auth"
import { sendVerificationCode } from "@/lib/email"
import { prisma } from "@/lib/db"

const HMAC_SECRET = process.env.HMAC_SECRET || process.env.RESEND_API_KEY || "dev-secret-change-me"

function signCode(email: string, code: string, expiresAt: number): string {
  return createHmac("sha256", HMAC_SECRET).update(`${email}:${code}:${expiresAt}`).digest("hex")
}

async function setAuthCookies(email: string) {
  const cookieStore = await cookies()
  const isAdmin = isAdminEmail(email)

  if (isAdmin) {
    const token = Buffer.from(`${email}:${Date.now()}`).toString("base64")
    cookieStore.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    })
  }

  // Also set member token for portal access
  try {
    let member = await prisma.labMember.findUnique({ where: { email } })
    if (!member && isAdmin) {
      member = await prisma.labMember.create({
        data: {
          name: email.split("@")[0],
          email,
          role: "PI / Admin",
          status: "ACTIVE",
          emailVerified: true,
          updatedAt: new Date(),
        },
      })
    }
    if (member) {
      const memberToken = Buffer.from(
        JSON.stringify({ memberId: member.id, email, ts: Date.now() })
      ).toString("base64")
      cookieStore.set("member_token", memberToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      })
    }
  } catch {
    // DB may not be available — admin still gets admin_token
  }

  const role = isAdmin ? (getAdminRole(email) || "admin") : "member"
  const redirect = isAdmin ? "/admin/dashboard" : "/member/dashboard"
  return { role, redirect }
}

/**
 * POST /api/auth
 * Actions: signup, verify-email, set-password, login, forgot-password, reset-password
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || "login"

    // ── Sign Up ────────────────────────────────────────────────
    // Step 1: User enters email + optional invitation code → send confirmation code
    if (action === "signup") {
      const email = (body.email || "").toLowerCase().trim()
      const invitationCode = (body.invitationCode || "").trim()

      if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 })

      // Check if already registered with password
      const existing = await prisma.labMember.findUnique({ where: { email } }).catch(() => null)
      if (existing?.passwordHash) {
        return NextResponse.json({ error: "This email is already registered. Please sign in." }, { status: 409 })
      }

      // If invitation code provided, validate it
      if (invitationCode) {
        const ac = await prisma.activationCode.findUnique({
          where: { code: invitationCode },
          include: { member: true },
        }).catch(() => null)

        if (!ac) return NextResponse.json({ error: "Invalid invitation code." }, { status: 401 })
        if (ac.used) return NextResponse.json({ error: "This invitation code has already been used." }, { status: 401 })
        if (new Date() > new Date(ac.expiresAt)) return NextResponse.json({ error: "This invitation code has expired." }, { status: 401 })

        // Code is valid — member exists via the code's relation
      } else {
        // No invitation code — check if email is admin or pre-registered member
        const isAdmin = isAdminEmail(email)
        if (!isAdmin && !existing) {
          return NextResponse.json({
            error: "This email is not pre-registered. Please provide an invitation code or contact the lab admin.",
          }, { status: 401 })
        }
      }

      // Send confirmation code
      const code = generateMagicCode()
      const expiresAt = Date.now() + 10 * 60 * 1000
      const sig = signCode(email, code, expiresAt)

      const result = await sendVerificationCode(email, code, "signup")
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Failed to send email" }, { status: 500 })
      }

      const cookieStore = await cookies()
      cookieStore.set("auth_pending", JSON.stringify({
        email, expiresAt, sig, action: "signup", invitationCode: invitationCode || null,
      }), {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", maxAge: 600, path: "/",
      })

      return NextResponse.json({ success: true, message: "Confirmation code sent to your email." })
    }

    // ── Verify Email ───────────────────────────────────────────
    // Step 2: User enters 6-digit code to confirm email
    if (action === "verify-email") {
      const email = (body.email || "").toLowerCase().trim()
      const code = (body.code || "").trim()

      const cookieStore = await cookies()
      const pendingRaw = cookieStore.get("auth_pending")?.value
      if (!pendingRaw) return NextResponse.json({ error: "No pending verification. Please start over." }, { status: 401 })

      let pending: { email: string; expiresAt: number; sig: string; action: string; invitationCode?: string }
      try { pending = JSON.parse(pendingRaw) } catch {
        return NextResponse.json({ error: "Invalid session." }, { status: 401 })
      }

      if (pending.email !== email) return NextResponse.json({ error: "Email mismatch." }, { status: 401 })
      if (Date.now() > pending.expiresAt) {
        cookieStore.delete("auth_pending")
        return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 401 })
      }

      const expectedSig = signCode(email, code, pending.expiresAt)
      if (expectedSig !== pending.sig) return NextResponse.json({ error: "Invalid code." }, { status: 401 })

      // Mark email as verified
      try {
        await prisma.labMember.updateMany({ where: { email }, data: { emailVerified: true } })
      } catch { /* may not exist yet for admin */ }

      // If invitation code was used, mark it
      if (pending.invitationCode) {
        try {
          await prisma.activationCode.updateMany({
            where: { code: pending.invitationCode },
            data: { used: true, usedAt: new Date() },
          })
        } catch { /* ignore */ }
      }

      // Update cookie to allow password setting
      cookieStore.set("auth_pending", JSON.stringify({
        ...pending, verified: true,
      }), {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", maxAge: 600, path: "/",
      })

      return NextResponse.json({ success: true, message: "Email verified. Please set your password." })
    }

    // ── Set Password ───────────────────────────────────────────
    // Step 3: User sets password (enter twice) after email verification
    if (action === "set-password") {
      const email = (body.email || "").toLowerCase().trim()
      const password = body.password || ""
      const confirmPassword = body.confirmPassword || ""

      if (!password || password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
      }
      if (password !== confirmPassword) {
        return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })
      }

      const cookieStore = await cookies()
      const pendingRaw = cookieStore.get("auth_pending")?.value
      if (!pendingRaw) return NextResponse.json({ error: "Session expired. Please start over." }, { status: 401 })

      let pending: { email: string; verified?: boolean }
      try { pending = JSON.parse(pendingRaw) } catch {
        return NextResponse.json({ error: "Invalid session." }, { status: 401 })
      }

      if (pending.email !== email || !pending.verified) {
        return NextResponse.json({ error: "Email not verified." }, { status: 401 })
      }

      const hashed = hashPassword(password)

      // Update or create the member record
      let member = await prisma.labMember.findUnique({ where: { email } }).catch(() => null)
      if (member) {
        await prisma.labMember.update({
          where: { email },
          data: { passwordHash: hashed, emailVerified: true },
        })
      } else if (isAdminEmail(email)) {
        member = await prisma.labMember.create({
          data: {
            name: email.split("@")[0],
            email,
            role: "PI / Admin",
            status: "ACTIVE",
            passwordHash: hashed,
            emailVerified: true,
            updatedAt: new Date(),
          },
        })
      } else {
        return NextResponse.json({ error: "Account not found." }, { status: 404 })
      }

      // Clear pending cookie and auto-login
      cookieStore.delete("auth_pending")
      const { role, redirect } = await setAuthCookies(email)

      return NextResponse.json({ success: true, role, redirect })
    }

    // ── Login ──────────────────────────────────────────────────
    if (action === "login") {
      const email = (body.email || "").toLowerCase().trim()
      const password = body.password || ""

      if (!email || !password) {
        return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
      }

      // Check LabMember password
      const member = await prisma.labMember.findUnique({ where: { email } }).catch(() => null)
      if (member?.passwordHash && verifyPassword(password, member.passwordHash)) {
        const { role, redirect } = await setAuthCookies(email)
        return NextResponse.json({ success: true, role, redirect })
      }

      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
    }

    // ── Forgot Password ────────────────────────────────────────
    if (action === "forgot-password") {
      const email = (body.email || "").toLowerCase().trim()
      if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 })

      // Check if account exists
      const member = await prisma.labMember.findUnique({ where: { email } }).catch(() => null)
      const isAdmin = isAdminEmail(email)
      if (!member && !isAdmin) {
        // Don't reveal whether email exists — still send success
        return NextResponse.json({ success: true, message: "If this email is registered, a reset code has been sent." })
      }

      const code = generateMagicCode()
      const expiresAt = Date.now() + 10 * 60 * 1000
      const sig = signCode(email, code, expiresAt)

      await sendVerificationCode(email, code, "reset")

      const cookieStore = await cookies()
      cookieStore.set("auth_pending", JSON.stringify({
        email, expiresAt, sig, action: "reset",
      }), {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", maxAge: 600, path: "/",
      })

      return NextResponse.json({ success: true, message: "If this email is registered, a reset code has been sent." })
    }

    // ── Reset Password ─────────────────────────────────────────
    // Verify code + set new password in one step
    if (action === "reset-password") {
      const email = (body.email || "").toLowerCase().trim()
      const code = (body.code || "").trim()
      const password = body.password || ""
      const confirmPassword = body.confirmPassword || ""

      if (!code) return NextResponse.json({ error: "Verification code is required." }, { status: 400 })
      if (!password || password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 })
      if (password !== confirmPassword) return NextResponse.json({ error: "Passwords do not match." }, { status: 400 })

      const cookieStore = await cookies()
      const pendingRaw = cookieStore.get("auth_pending")?.value
      if (!pendingRaw) return NextResponse.json({ error: "Session expired. Please start over." }, { status: 401 })

      let pending: { email: string; expiresAt: number; sig: string; action: string }
      try { pending = JSON.parse(pendingRaw) } catch {
        return NextResponse.json({ error: "Invalid session." }, { status: 401 })
      }

      if (pending.email !== email || pending.action !== "reset") return NextResponse.json({ error: "Invalid session." }, { status: 401 })
      if (Date.now() > pending.expiresAt) {
        cookieStore.delete("auth_pending")
        return NextResponse.json({ error: "Code expired." }, { status: 401 })
      }

      const expectedSig = signCode(email, code, pending.expiresAt)
      if (expectedSig !== pending.sig) return NextResponse.json({ error: "Invalid code." }, { status: 401 })

      // Update password
      const hashed = hashPassword(password)
      try {
        await prisma.labMember.update({ where: { email }, data: { passwordHash: hashed } })
      } catch {
        if (isAdminEmail(email)) {
          await prisma.labMember.create({
            data: { name: email.split("@")[0], email, role: "PI / Admin", status: "ACTIVE", passwordHash: hashed, emailVerified: true, updatedAt: new Date() },
          })
        } else {
          return NextResponse.json({ error: "Account not found." }, { status: 404 })
        }
      }

      cookieStore.delete("auth_pending")
      const { role, redirect } = await setAuthCookies(email)
      return NextResponse.json({ success: true, role, redirect })
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
  cookieStore.delete("auth_pending")
  return NextResponse.json({ success: true })
}
