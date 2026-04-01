import { cookies } from "next/headers"

/**
 * Verify the member_token cookie and return the payload if valid.
 * Returns null if not authenticated.
 */
export async function verifyMemberToken(): Promise<{
  memberId: number
  email: string
} | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("member_token")?.value

    if (!token) return null

    const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
    if (!payload.memberId || !payload.email) return null

    // Check token age (30 days)
    if (payload.ts && Date.now() - payload.ts > 30 * 24 * 60 * 60 * 1000) {
      return null
    }

    return { memberId: payload.memberId, email: payload.email }
  } catch {
    return null
  }
}
