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
  const watchId = parseInt(id, 10)
  if (isNaN(watchId)) {
    return NextResponse.json({ error: "Invalid watch ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberWatch.findUnique({ where: { id: watchId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, watchType, query, source, frequency, notes, enabled } = body

    const updated = await prisma.memberWatch.update({
      where: { id: watchId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(watchType !== undefined && { watchType }),
        ...(query !== undefined && { query: query.trim() }),
        ...(source !== undefined && { source }),
        ...(frequency !== undefined && { frequency }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(enabled !== undefined && { enabled }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update watch:", error)
    return NextResponse.json({ error: "Failed to update watch" }, { status: 500 })
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
  const watchId = parseInt(id, 10)
  if (isNaN(watchId)) {
    return NextResponse.json({ error: "Invalid watch ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberWatch.findUnique({ where: { id: watchId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.memberWatch.delete({ where: { id: watchId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete watch:", error)
    return NextResponse.json({ error: "Failed to delete watch" }, { status: 500 })
  }
}
