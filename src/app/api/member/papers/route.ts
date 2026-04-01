import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const papers = await prisma.memberPaper.findMany({
      where: { memberId: auth.memberId },
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(papers)
  } catch (error) {
    console.error("Failed to fetch papers:", error)
    return NextResponse.json({ error: "Failed to fetch papers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, authors, year, journal, url, doi, pubmedId, scholarUrl, pdfPath, citation, notes, tags, source } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const paper = await prisma.memberPaper.create({
      data: {
        memberId: auth.memberId,
        title: title.trim(),
        authors: authors?.trim() || null,
        year: year ? parseInt(year, 10) : null,
        journal: journal?.trim() || null,
        url: url?.trim() || null,
        doi: doi?.trim() || null,
        pubmedId: pubmedId?.trim() || null,
        scholarUrl: scholarUrl?.trim() || null,
        pdfPath: pdfPath?.trim() || null,
        citation: citation?.trim() || null,
        notes: notes?.trim() || null,
        tags: tags?.trim() || null,
        source: source || "MANUAL",
      },
    })

    return NextResponse.json(paper, { status: 201 })
  } catch (error) {
    console.error("Failed to create paper:", error)
    return NextResponse.json({ error: "Failed to create paper" }, { status: 500 })
  }
}
