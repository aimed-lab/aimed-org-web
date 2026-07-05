import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"
import { can, canAssignRole, assignableRoles, ACCESS_ROLES, type AccessRole } from "@/lib/rbac"

// GET /api/member/join-requests — pending requests the actor may act on.
export async function GET() {
  const actor = await verifyMemberToken()
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!can(actor.accessRole, "manage_roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const pending = await prisma.labMember.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, bio: true, createdAt: true },
  })
  return NextResponse.json({
    actorRole: actor.accessRole,
    // Roles this actor may grant (strictly below their own).
    assignable: assignableRoles(actor.accessRole),
    requests: pending,
  })
}

// POST /api/member/join-requests — approve or reject a pending request.
// Body: { memberId, action: "approve"|"reject", accessRole? }
export async function POST(request: NextRequest) {
  const actor = await verifyMemberToken()
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!can(actor.accessRole, "manage_roles")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let body: { memberId?: number; action?: string; accessRole?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }
  const { memberId, action } = body
  if (!memberId || !action) {
    return NextResponse.json({ error: "memberId and action are required" }, { status: 400 })
  }

  const target = await prisma.labMember.findUnique({ where: { id: memberId } })
  if (!target || target.status !== "PENDING") {
    return NextResponse.json({ error: "No pending request for that member." }, { status: 404 })
  }

  if (action === "reject") {
    await prisma.labMember.update({
      where: { id: memberId },
      data: { status: "INACTIVE", updatedAt: new Date() },
    })
    return NextResponse.json({ ok: true, action: "rejected" })
  }

  if (action === "approve") {
    const newRole = String(body.accessRole || "").toUpperCase() as AccessRole
    if (!(ACCESS_ROLES as readonly string[]).includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    // Cascade: an approver may only grant a role strictly below their own.
    if (!canAssignRole(actor.accessRole, newRole)) {
      return NextResponse.json({ error: "You can only approve people into roles below your own." }, { status: 403 })
    }
    const updated = await prisma.labMember.update({
      where: { id: memberId },
      data: { status: "ACTIVE", accessRole: newRole, updatedAt: new Date() },
      select: { id: true, name: true, email: true, accessRole: true },
    })
    return NextResponse.json({ ok: true, action: "approved", member: updated })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
