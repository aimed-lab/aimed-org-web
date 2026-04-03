import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

/**
 * GET /api/admin/publications
 * List all publications (including PROVISIONAL) for admin management.
 */
export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // PROVISIONAL, VERIFIED, or ALL
    const search = searchParams.get("search") || ""

    const where: Record<string, unknown> = {}

    if (status && status !== "ALL") {
      where.curationStatus = status
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { contains: search } },
        { journal: { contains: search } },
      ]
    }

    const publications = await prisma.publication.findMany({
      where,
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(publications)
  } catch (error) {
    console.error("Fetch publications error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

/**
 * POST /api/admin/publications
 * Manually create a new publication (defaults to VERIFIED for manual admin entries).
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const publication = await prisma.publication.create({
      data: {
        title: body.title || "Untitled",
        authors: body.authors || "",
        year: body.year || new Date().getFullYear(),
        journal: body.journal || null,
        abstract: body.abstract || null,
        doi: body.doi || null,
        pubmedId: body.pubmedId || null,
        arxivId: body.arxivId || null,
        pdfUrl: body.pdfUrl || null,
        tags: body.tags || null,
        researchLineage: body.researchLineage || null,
        articleType: body.articleType || "Journal Article",
        featured: body.featured || false,
        curationStatus: body.curationStatus || "VERIFIED",
      },
    })

    return NextResponse.json(publication)
  } catch (error) {
    console.error("Create publication error:", error)
    return NextResponse.json({ error: "Failed to create" }, { status: 500 })
  }
}
