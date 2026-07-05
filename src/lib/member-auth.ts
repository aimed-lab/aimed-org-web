import { cookies } from "next/headers"
import { verifyAdminToken, verifySignedToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { resolveAccessRole, type AccessRole } from "@/lib/rbac"

export type MemberAuth = {
  memberId: number
  email: string
  accessRole: AccessRole
}

/**
 * Verify the member_token cookie and return the payload if valid.
 * Also accepts admin_token — admins can access member pages without activation code.
 * If admin, looks up or auto-creates a LabMember record for the admin email.
 * The returned `accessRole` is the resolved RBAC role (OWNER from the PI email,
 * otherwise the stored LabMember.accessRole, with an ADMIN fallback for bootstrap
 * admin emails). Returns null if not authenticated.
 */
export async function verifyMemberToken(): Promise<MemberAuth | null> {
  // First, try member_token
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("member_token")?.value

    const decoded = token ? verifySignedToken(token) : null
    if (decoded) {
      const payload = JSON.parse(decoded)
      if (payload.memberId && payload.email) {
        // Check token age (30 days)
        if (!payload.ts || Date.now() - payload.ts <= 30 * 24 * 60 * 60 * 1000) {
          const member = await prisma.labMember.findUnique({
            where: { id: payload.memberId },
            select: { accessRole: true },
          })
          return {
            memberId: payload.memberId,
            email: payload.email,
            accessRole: resolveAccessRole(payload.email, member?.accessRole),
          }
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
            accessRole: "ADMIN",
            updatedAt: new Date(),
          },
        })
      }
      return {
        memberId: member.id,
        email: adminEmail,
        accessRole: resolveAccessRole(adminEmail, member.accessRole),
      }
    }
  } catch {
    // Fall through
  }

  return null
}
