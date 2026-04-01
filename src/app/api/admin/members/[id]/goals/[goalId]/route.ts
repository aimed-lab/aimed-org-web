import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const gid = parseInt(goalId, 10)
  if (isNaN(gid)) {
    return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const { status, notes, title, description, quarter } = body

    const data: Record<string, unknown> = {}
    if (status !== undefined) data.status = status
    if (notes !== undefined) data.notes = notes
    if (title !== undefined) data.title = title
    if (description !== undefined) data.description = description
    if (quarter !== undefined) data.quarter = quarter

    const goal = await prisma.quarterlyGoal.update({
      where: { id: gid },
      data,
    })

    return NextResponse.json(goal)
  } catch (error) {
    console.error("Failed to update goal:", error)
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; goalId: string }> }
) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { goalId } = await params
  const gid = parseInt(goalId, 10)
  if (isNaN(gid)) {
    return NextResponse.json({ error: "Invalid goal ID" }, { status: 400 })
  }

  try {
    await prisma.quarterlyGoal.delete({ where: { id: gid } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete goal:", error)
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 })
  }
}
