import { cookies } from "next/headers"
import { NextRequest } from "next/server"
import { scryptSync, randomBytes } from "crypto"

// ─── Admin Role Hierarchy ──────────────────────────────────────────────────
export type AdminRole = "owner" | "admin" | null

const OWNER_EMAILS = ["jakechen@gmail.com"]
const REVOKABLE_ADMIN_EMAILS = ["zsembay8@uab.edu", "jakechen@uab.edu"]

const ENV_ADMINS = process.env.ADMIN_EMAILS
const ALL_ADMIN_EMAILS = ENV_ADMINS
  ? ENV_ADMINS.split(",").map((e) => e.trim().toLowerCase())
  : [...OWNER_EMAILS, ...REVOKABLE_ADMIN_EMAILS].map((e) => e.toLowerCase())

const DEFAULT_PASSCODE = process.env.ADMIN_ACTIVATION_CODE || "AIMED2026"

export function isAdminEmail(email: string): boolean {
  return ALL_ADMIN_EMAILS.includes(email.toLowerCase())
}

export function getAdminRole(email: string): AdminRole {
  const e = email.toLowerCase()
  if (OWNER_EMAILS.map((o) => o.toLowerCase()).includes(e)) return "owner"
  if (ALL_ADMIN_EMAILS.includes(e)) return "admin"
  return null
}

export function validatePasscode(passcode: string): boolean {
  return passcode === DEFAULT_PASSCODE
}

// ─── Password Hashing (scrypt, no external deps) ──────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":")
    if (!salt || !hash) return false
    const test = scryptSync(password, salt, 64).toString("hex")
    return hash === test
  } catch {
    return false
  }
}

// ─── Code Generation ───────────────────────────────────────────────────────

export function generateMagicCode(): string {
  const bytes = new Uint8Array(4)
  crypto.getRandomValues(bytes)
  const num = ((bytes[0] << 16) | (bytes[1] << 8) | bytes[2]) % 1000000
  return num.toString().padStart(6, "0")
}

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

// ─── Token Verification ────────────────────────────────────────────────────

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
    if (Date.now() - timestamp > 24 * 60 * 60 * 1000) return null
    if (!isAdminEmail(email)) return null

    return email
  } catch {
    return null
  }
}

export async function isAdmin(request?: NextRequest): Promise<boolean> {
  const email = await verifyAdminToken(request)
  return email !== null
}
