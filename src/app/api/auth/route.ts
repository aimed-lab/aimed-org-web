import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  validateAdminCredentials,
  changeAdminPassword,
  resetAdminPassword,
  isAdminEmail,
  verifyAdminToken,
} from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * POST /api/auth
 * Body: { action, ... }
 *
 * Actions:
 *   "login"          — { email, password } → admin login
 *   "login-code"     — { email, code }     → login via activation code (lab members)
 *   "change-password" — { email, oldPassword, newPassword } → change password
 *   "reset-password"  — { email } → reset to default (admin only, must be logged in)
 *   (no action)       — legacy: { email, password } → same as "login"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action || "login"

    // ── Admin Login (email + password) ─────────────────────────
    if (action === "login") {
      const { email, password } = body
      if (!email || !password) {
        return NextResponse.json({ error: "Email and password required" }, { status: 400 })
      }

      const result = validateAdminCredentials(email, password)
      if (!result.valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Set auth cookie
      const token = Buffer.from(`${email.toLowerCase()}:${Date.now()}`).toString("base64")
      const cookieStore = await cookies()
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        path: "/",
      })

      return NextResponse.json({
        success: true,
        mustChangePassword: result.mustChangePassword,
        email: email.toLowerCase(),
      })
    }

    // ── Login via Activation Code (lab members) ────────────────
    if (action === "login-code") {
      const { email, code } = body
      if (!email || !code) {
        return NextResponse.json({ error: "Email and activation code required" }, { status: 400 })
      }

      // Default admin activation code — allows admin emails to log in without a DB code
      const DEFAULT_ADMIN_CODE = process.env.ADMIN_ACTIVATION_CODE || "SPARC2026"
      if (isAdminEmail(email) && code === DEFAULT_ADMIN_CODE) {
        const token = Buffer.from(`${email.toLowerCase()}:${Date.now()}`).toString("base64")
        const cookieStore = await cookies()
        cookieStore.set("admin_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        })
        return NextResponse.json({ success: true, redirect: "/admin/dashboard", role: "admin" })
      }

      // Check if this is a lab member using their personal activation code
      const member = await prisma.labMember.findUnique({
        where: { email: email.toLowerCase() },
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
        return NextResponse.json({ error: "This code has already been used. Please contact the admin for a new code." }, { status: 401 })
      }
      if (new Date() > new Date(ac.expiresAt)) {
        return NextResponse.json({ error: "This code has expired. Please contact the admin for a new code." }, { status: 401 })
      }

      // Mark code as used (one-time use)
      await prisma.activationCode.update({
        where: { id: ac.id },
        data: { used: true, usedAt: new Date() },
      })

      // If admin email, set admin cookie
      if (isAdminEmail(email)) {
        const token = Buffer.from(`${email.toLowerCase()}:${Date.now()}`).toString("base64")
        const cookieStore = await cookies()
        cookieStore.set("admin_token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24,
          path: "/",
        })
        return NextResponse.json({ success: true, redirect: "/admin/dashboard", role: "admin" })
      }

      // Set member cookie
      const memberToken = Buffer.from(
        JSON.stringify({ memberId: member.id, email: member.email, ts: Date.now() })
      ).toString("base64")
      const cookieStore = await cookies()
      cookieStore.set("member_token", memberToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })

      return NextResponse.json({ success: true, redirect: "/member/dashboard", role: "member" })
    }

    // ── Change Password ────────────────────────────────────────
    if (action === "change-password") {
      const { email, oldPassword, newPassword, confirmPassword } = body
      if (!email || !oldPassword || !newPassword) {
        return NextResponse.json({ error: "All fields required" }, { status: 400 })
      }
      if (newPassword !== confirmPassword) {
        return NextResponse.json({ error: "New passwords do not match" }, { status: 400 })
      }

      const result = changeAdminPassword(email, oldPassword, newPassword)
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    // ── Reset Password (admin only) ────────────────────────────
    if (action === "reset-password") {
      const adminEmail = await verifyAdminToken()
      if (!adminEmail) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const { email } = body
      if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 })
      }

      const success = resetAdminPassword(email)
      if (!success) {
        return NextResponse.json({ error: "Not an admin email" }, { status: 400 })
      }

      return NextResponse.json({ success: true, message: "Password reset to default. User must change on next login." })
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
