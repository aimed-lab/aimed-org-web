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
  const docId = parseInt(id, 10)
  if (isNaN(docId)) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberCompliance.findUnique({ where: { id: docId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { docType, title, description, issuer, fileUrl, expiresAt, status, protocolNum, notes } = body

    const updated = await prisma.memberCompliance.update({
      where: { id: docId },
      data: {
        ...(docType !== undefined && { docType }),
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(issuer !== undefined && { issuer: issuer?.trim() || null }),
        ...(fileUrl !== undefined && { fileUrl: fileUrl?.trim() || null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
        ...(status !== undefined && { status }),
        ...(protocolNum !== undefined && { protocolNum: protocolNum?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update compliance doc:", error)
    return NextResponse.json({ error: "Failed to update compliance document" }, { status: 500 })
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
  const docId = parseInt(id, 10)
  if (isNaN(docId)) {
    return NextResponse.json({ error: "Invalid document ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberCompliance.findUnique({ where: { id: docId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.memberCompliance.delete({ where: { id: docId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete compliance doc:", error)
    return NextResponse.json({ error: "Failed to delete compliance document" }, { status: 500 })
  }
}
