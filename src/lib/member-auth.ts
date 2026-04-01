import { cookies } from "next/headers"
import { verifyAdminToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

/**
 * Verify the member_token cookie and return the payload if valid.
 * Also accepts admin_token — admins can access member pages without activation code.
 * If admin, looks up or auto-creates a LabMember record for the admin email.
 * Returns null if not authenticated.
 */
export async function verifyMemberToken(): Promise<{
  memberId: number
  email: string
} | null> {
  // First, try member_token
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("member_token")?.value

    if (token) {
      const payload = JSON.parse(Buffer.from(token, "base64").toString("utf-8"))
      if (payload.memberId && payload.email) {
        // Check token age (30 days)
        if (!payload.ts || Date.now() - payload.ts <= 30 * 24 * 60 * 60 * 1000) {
          return { memberId: payload.memberId, email: payload.email }
        }
      }
    }
  } catch {
    // Fall through to admin check
  }

  // Second, try admin_token — admins have elevated access to member features
  try {
    const adminEmail = await verifyAdminToken()
    if (adminEmail) {
      // Find or create a LabMember record for the admin
      let member = await prisma.labMember.findUnique({
        where: { email: adminEmail },
      })
      if (!member) {
        member = await prisma.labMember.create({
          data: {
            name: adminEmail.split("@")[0],
            email: adminEmail,
            role: "PI / Admin",
            status: "ACTIVE",
            updatedAt: new Date(),
          },
        })
      }
      return { memberId: member.id, email: adminEmail }
    }
  } catch {
    // Fall through
  }

  return null
}
