import { cookies } from "next/headers"
import { NextRequest } from "next/server"

// ─── Admin Role Hierarchy ──────────────────────────────────────────────────
// Owner: permanent, cannot be revoked
// Admin: revokable by owner
// Member: regular lab member

export type AdminRole = "owner" | "admin" | null

const OWNER_EMAILS = ["jakechen@gmail.com"]
const REVOKABLE_ADMIN_EMAILS = ["zsembay8@uab.edu", "jakechen@uab.edu"]

// Build full admin list from env or defaults
const ENV_ADMINS = process.env.ADMIN_EMAILS
const ALL_ADMIN_EMAILS = ENV_ADMINS
  ? ENV_ADMINS.split(",").map((e) => e.trim().toLowerCase())
  : [...OWNER_EMAILS, ...REVOKABLE_ADMIN_EMAILS].map((e) => e.toLowerCase())

// Default passcode for magic link flow
const DEFAULT_PASSCODE = process.env.ADMIN_ACTIVATION_CODE || "AIMED2026"

/**
 * Check if an email is any kind of admin (owner or revokable)
 */
export function isAdminEmail(email: string): boolean {
  return ALL_ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Get the admin role for an email
 */
export function getAdminRole(email: string): AdminRole {
  const e = email.toLowerCase()
  if (OWNER_EMAILS.map((o) => o.toLowerCase()).includes(e)) return "owner"
  if (REVOKABLE_ADMIN_EMAILS.map((a) => a.toLowerCase()).includes(e)) return "admin"
  if (ALL_ADMIN_EMAILS.includes(e)) return "admin"
  return null
}

/**
 * Check if an email is a recognized user (admin or lab member).
 * Lab members are checked against the database.
 */
export function isRecognizedAdmin(email: string): boolean {
  return isAdminEmail(email)
}

/**
 * Validate the shared passcode for magic link flow.
 * All users (admin and member) use this same passcode + email to request a magic code.
 */
export function validatePasscode(passcode: string): boolean {
  return passcode === DEFAULT_PASSCODE
}

/**
 * Generate a random 6-digit numeric magic code.
 */
export function generateMagicCode(): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const num = ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]) % 1000000
  return num.toString().padStart(6, "0")
}

/**
 * Generate a random 8-character alphanumeric activation code.
 */
export function generateActivationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let code = ""
  const bytes = new Uint8Array(8)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < 8; i++) {
    code += chars[bytes[i] % chars.length]
  }
  return code
}

/**
 * Verify the admin_token cookie.
 * Token format: base64("email:timestamp") — set by /api/auth POST.
 * Returns the decoded email if valid (within 24 h), otherwise null.
 */
export async function verifyAdminToken(
  _request?: NextRequest
): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("admin_token")?.value
    if (!token) return null

    const decoded = Buffer.from(token, "base64").toString("utf-8")
    const [email, timestampStr] = decoded.split(":")
    const timestamp = Number(timestampStr)

    if (!email || !timestamp || isNaN(timestamp)) return null

    // Token expires after 24 hours
    const age = Date.now() - timestamp
    if (age > 24 * 60 * 60 * 1000) return null

    // Must be an admin email
    if (!isAdminEmail(email)) return null

    return email
  } catch {
    return null
  }
}

/**
 * Returns true when the request carries a valid admin session cookie.
 */
export async function isAdmin(request?: NextRequest): Promise<boolean> {
  const email = await verifyAdminToken(request)
  return email !== null
}
