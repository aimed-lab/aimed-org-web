import { cookies } from "next/headers"
import { NextRequest } from "next/server"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aimed-lab.org"

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

    // Must match the configured admin email
    if (email !== ADMIN_EMAIL) return null

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
