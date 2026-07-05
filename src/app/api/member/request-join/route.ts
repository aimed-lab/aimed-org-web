import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

// POST /api/member/request-join — PUBLIC. A prospective member requests to join.
// Creates a LabMember in PENDING status with no access role; an approver later
// approves it (assigning a role below their own) via /api/member/join-requests.
export async function POST(request: NextRequest) {
  let body: { name?: string; email?: string; note?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const name = (body.name || "").trim()
  const email = (body.email || "").trim().toLowerCase()
  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "A valid name and email are required." }, { status: 400 })
  }

  const existing = await prisma.labMember.findUnique({ where: { email } })
  if (existing) {
    if (existing.status === "PENDING") {
      return NextResponse.json({ ok: true, message: "Your request is already pending review." })
    }
    // Don't reveal membership details; generic response avoids account enumeration.
    return NextResponse.json({ ok: true, message: "If eligible, your request has been recorded." })
  }

  await prisma.labMember.create({
    data: {
      name,
      email,
      role: "Applicant",
      status: "PENDING",
      accessRole: null, // assigned on approval
      bio: (body.note || "").trim() || null,
      updatedAt: new Date(),
    },
  })

  return NextResponse.json({ ok: true, message: "Request submitted. An admin will review it shortly." })
}
