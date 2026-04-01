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
  const datasetId = parseInt(id, 10)
  if (isNaN(datasetId)) {
    return NextResponse.json({ error: "Invalid dataset ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberDataset.findUnique({ where: { id: datasetId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, source, doi, url, filePath, mcpServer, format, size, tags } = body

    const updated = await prisma.memberDataset.update({
      where: { id: datasetId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(source !== undefined && { source }),
        ...(doi !== undefined && { doi: doi?.trim() || null }),
        ...(url !== undefined && { url: url?.trim() || null }),
        ...(filePath !== undefined && { filePath: filePath?.trim() || null }),
        ...(mcpServer !== undefined && { mcpServer: mcpServer?.trim() || null }),
        ...(format !== undefined && { format: format?.trim() || null }),
        ...(size !== undefined && { size: size?.trim() || null }),
        ...(tags !== undefined && { tags: tags?.trim() || null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update dataset:", error)
    return NextResponse.json({ error: "Failed to update dataset" }, { status: 500 })
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
  const datasetId = parseInt(id, 10)
  if (isNaN(datasetId)) {
    return NextResponse.json({ error: "Invalid dataset ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberDataset.findUnique({ where: { id: datasetId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.memberDataset.delete({ where: { id: datasetId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete dataset:", error)
    return NextResponse.json({ error: "Failed to delete dataset" }, { status: 500 })
  }
}
