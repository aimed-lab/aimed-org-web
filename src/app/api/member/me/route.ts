import { NextResponse } from "next/server"
import { verifyMemberToken } from "@/lib/member-auth"
import { verifyAdminToken } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { can, type Permission } from "@/lib/rbac"

export async function GET() {
  try {
    const memberAuth = await verifyMemberToken()
    if (!memberAuth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const member = await prisma.labMember.findUnique({
      where: { id: memberAuth.memberId },
      include: {
        goals: { orderBy: { quarter: "desc" } },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check if user is also an admin
    const adminEmail = await verifyAdminToken()
    const isAdmin = adminEmail !== null

    // Effective RBAC role (resolved from email + stored role) and a permission map
    // the client can use to show/hide UI without duplicating the matrix.
    const accessRole = memberAuth.accessRole
    const PERMS: Permission[] = [
      "view_portal", "full_features", "share_content",
      "manage_connectors", "manage_content", "manage_members", "manage_roles", "manage_admins",
    ]
    const permissions = Object.fromEntries(PERMS.map((p) => [p, can(accessRole, p)]))

    return NextResponse.json({ ...member, accessRole, isAdmin, permissions })
  } catch (error) {
    console.error("Failed to fetch member profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
