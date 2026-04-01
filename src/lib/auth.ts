import { cookies } from "next/headers"
import { NextRequest } from "next/server"

// Multiple default admin emails — override with ADMIN_EMAILS env var (comma-separated)
const DEFAULT_ADMINS = ["jakechen@gmail.com", "jakechen@uab.edu"]
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || DEFAULT_ADMINS.join(","))
  .split(",")
  .map((e) => e.trim().toLowerCase())

// Default password — users must change on first login
const DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "changeME!"

// In-memory password store — in production, use database
// Maps email → { password, mustChange }
const passwordStore = new Map<string, { password: string; mustChange: boolean }>()

// Initialize default admins
for (const email of ADMIN_EMAILS) {
  if (!passwordStore.has(email)) {
    passwordStore.set(email, { password: DEFAULT_PASSWORD, mustChange: true })
  }
}

/**
 * Check if an email is an admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Validate admin credentials. Returns { valid, mustChangePassword }
 */
export function validateAdminCredentials(
  email: string,
  password: string
): { valid: boolean; mustChangePassword: boolean } {
  const normalizedEmail = email.toLowerCase()
  if (!isAdminEmail(normalizedEmail)) return { valid: false, mustChangePassword: false }

  const stored = passwordStore.get(normalizedEmail)
  if (!stored) {
    // First-time login with default password
    if (password === DEFAULT_PASSWORD) {
      passwordStore.set(normalizedEmail, { password: DEFAULT_PASSWORD, mustChange: true })
      return { valid: true, mustChangePassword: true }
    }
    return { valid: false, mustChangePassword: false }
  }

  if (stored.password === password) {
    return { valid: true, mustChangePassword: stored.mustChange }
  }

  return { valid: false, mustChangePassword: false }
}

/**
 * Change admin password. Returns true on success.
 */
export function changeAdminPassword(
  email: string,
  oldPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const normalizedEmail = email.toLowerCase()
  if (!isAdminEmail(normalizedEmail)) return { success: false, error: "Not an admin" }

  const stored = passwordStore.get(normalizedEmail)
  if (!stored || stored.password !== oldPassword) {
    return { success: false, error: "Current password is incorrect" }
  }

  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters" }
  }

  if (newPassword === DEFAULT_PASSWORD) {
    return { success: false, error: "Please choose a different password" }
  }

  passwordStore.set(normalizedEmail, { password: newPassword, mustChange: false })
  return { success: true }
}

/**
 * Reset admin password to default (must change on next login)
 */
export function resetAdminPassword(email: string): boolean {
  const normalizedEmail = email.toLowerCase()
  if (!isAdminEmail(normalizedEmail)) return false
  passwordStore.set(normalizedEmail, { password: DEFAULT_PASSWORD, mustChange: true })
  return true
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
