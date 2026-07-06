import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

// GET /api/admin/inquiries/unread — number of unread (NEW) inquiries.
export async function GET() {
  const admin = await verifyAdminToken()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const count = await prisma.inquirySubmission.count({ where: { status: "NEW" } })
  return NextResponse.json({ count })
}

// POST /api/admin/inquiries/unread — clear: mark all NEW inquiries as REVIEWED.
export async function POST() {
  const admin = await verifyAdminToken()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const res = await prisma.inquirySubmission.updateMany({
    where: { status: "NEW" },
    data: { status: "REVIEWED" },
  })
  return NextResponse.json({ ok: true, cleared: res.count })
}
