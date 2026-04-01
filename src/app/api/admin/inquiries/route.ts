import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const inquiries = await prisma.inquirySubmission.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(inquiries)
  } catch (error) {
    console.error("Failed to fetch inquiries:", error)
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, status, manualScore, manualNotes, priority, notes } = body

    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (status !== undefined) data.status = status
    if (manualScore !== undefined) data.manualScore = manualScore
    if (manualNotes !== undefined) data.manualNotes = manualNotes
    if (priority !== undefined) data.priority = priority
    if (notes !== undefined) data.notes = notes

    const updated = await prisma.inquirySubmission.update({
      where: { id },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update inquiry:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}
