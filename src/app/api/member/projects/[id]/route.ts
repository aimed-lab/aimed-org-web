import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params
  const projectId = parseInt(id, 10)
  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
  }

  try {
    // Verify ownership
    const existing = await prisma.projectTask.findUnique({ where: { id: projectId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, description, status, priority, dueDate, category } = body

    const updated = await prisma.projectTask.update({
      where: { id: projectId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(category !== undefined && { category: category?.trim() || null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params
  const projectId = parseInt(id, 10)
  if (isNaN(projectId)) {
    return NextResponse.json({ error: "Invalid project ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.projectTask.findUnique({ where: { id: projectId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.projectTask.delete({ where: { id: projectId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
