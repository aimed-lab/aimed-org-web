import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"
import { isOwnerEmail } from "@/lib/auth"
import {
  can,
  canAssignRole,
  resolveAccessRole,
  ACCESS_ROLES,
  type AccessRole,
} from "@/lib/rbac"

// GET /api/admin/roles — list members with their resolved access role.
export async function GET() {
  const actor = await verifyMemberToken()
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!can(actor.accessRole, "manage_roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const members = await prisma.labMember.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, accessRole: true, status: true },
  })

  return NextResponse.json({
    actorRole: actor.accessRole,
    members: members.map((m) => ({
      ...m,
      resolvedRole: resolveAccessRole(m.email, m.accessRole),
      isOwner: isOwnerEmail(m.email),
    })),
  })
}

// PATCH /api/admin/roles — set a member's access role. Body: { memberId, accessRole }.
export async function PATCH(request: NextRequest) {
  const actor = await verifyMemberToken()
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!can(actor.accessRole, "manage_roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { memberId?: number; accessRole?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const { memberId, accessRole } = body
  if (!memberId || !accessRole) {
    return NextResponse.json({ error: "memberId and accessRole are required" }, { status: 400 })
  }
  const newRole = String(accessRole).toUpperCase() as AccessRole
  if (!(ACCESS_ROLES as readonly string[]).includes(newRole)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const target = await prisma.labMember.findUnique({ where: { id: memberId } })
  if (!target) return NextResponse.json({ error: "Member not found" }, { status: 404 })

  // The OWNER (PI) is permanent and cannot be reassigned.
  if (isOwnerEmail(target.email)) {
    return NextResponse.json({ error: "The owner role is permanent and cannot be changed." }, { status: 403 })
  }
  // Only the OWNER may grant OR revoke ADMIN.
  const targetCurrent = resolveAccessRole(target.email, target.accessRole)
  if ((newRole === "ADMIN" || targetCurrent === "ADMIN") && actor.accessRole !== "OWNER") {
    return NextResponse.json({ error: "Only the owner can assign or revoke the admin role." }, { status: 403 })
  }
  if (!canAssignRole(actor.accessRole, newRole)) {
    return NextResponse.json({ error: "You cannot assign that role." }, { status: 403 })
  }

  const updated = await prisma.labMember.update({
    where: { id: memberId },
    data: { accessRole: newRole, updatedAt: new Date() },
    select: { id: true, name: true, email: true, accessRole: true },
  })

  return NextResponse.json({ ok: true, member: { ...updated, resolvedRole: resolveAccessRole(updated.email, updated.accessRole) } })
}
