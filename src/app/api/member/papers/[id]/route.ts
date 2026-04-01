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
  const paperId = parseInt(id, 10)
  if (isNaN(paperId)) {
    return NextResponse.json({ error: "Invalid paper ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberPaper.findUnique({ where: { id: paperId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, authors, year, journal, url, doi, pubmedId, scholarUrl, pdfPath, citation, notes, tags, source } = body

    const updated = await prisma.memberPaper.update({
      where: { id: paperId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(authors !== undefined && { authors: authors?.trim() || null }),
        ...(year !== undefined && { year: year ? parseInt(year, 10) : null }),
        ...(journal !== undefined && { journal: journal?.trim() || null }),
        ...(url !== undefined && { url: url?.trim() || null }),
        ...(doi !== undefined && { doi: doi?.trim() || null }),
        ...(pubmedId !== undefined && { pubmedId: pubmedId?.trim() || null }),
        ...(scholarUrl !== undefined && { scholarUrl: scholarUrl?.trim() || null }),
        ...(pdfPath !== undefined && { pdfPath: pdfPath?.trim() || null }),
        ...(citation !== undefined && { citation: citation?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(tags !== undefined && { tags: tags?.trim() || null }),
        ...(source !== undefined && { source }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update paper:", error)
    return NextResponse.json({ error: "Failed to update paper" }, { status: 500 })
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
  const paperId = parseInt(id, 10)
  if (isNaN(paperId)) {
    return NextResponse.json({ error: "Invalid paper ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberPaper.findUnique({ where: { id: paperId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.memberPaper.delete({ where: { id: paperId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete paper:", error)
    return NextResponse.json({ error: "Failed to delete paper" }, { status: 500 })
  }
}
