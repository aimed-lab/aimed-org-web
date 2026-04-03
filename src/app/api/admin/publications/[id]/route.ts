import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

/**
 * PUT /api/admin/publications/[id]
 * Update a publication (edit fields or change curation status).
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    const pubId = parseInt(id)
    const body = await request.json()

    // Handle "verify" action shortcut
    if (body.action === "verify") {
      const updated = await prisma.publication.update({
        where: { id: pubId },
        data: { curationStatus: "VERIFIED" },
      })
      return NextResponse.json(updated)
    }

    // Handle "unverify" action
    if (body.action === "unverify") {
      const updated = await prisma.publication.update({
        where: { id: pubId },
        data: { curationStatus: "PROVISIONAL" },
      })
      return NextResponse.json(updated)
    }

    // General update
    const data: Record<string, unknown> = {}
    const fields = [
      "title", "authors", "year", "journal", "abstract", "doi", "pubmedId",
      "arxivId", "pdfUrl", "tags", "researchLineage", "articleType", "featured",
      "curationStatus",
    ]
    for (const f of fields) {
      if (body[f] !== undefined) data[f] = body[f]
    }

    const updated = await prisma.publication.update({
      where: { id: pubId },
      data,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Update publication error:", error)
    return NextResponse.json({ error: "Failed to update" }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/publications/[id]
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await params
    await prisma.publication.delete({ where: { id: parseInt(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete publication error:", error)
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 })
  }
}
