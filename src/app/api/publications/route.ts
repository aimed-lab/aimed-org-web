import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const year = searchParams.get("year")
    const topic = searchParams.get("topic")
    const type = searchParams.get("type")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { authors: { contains: search } },
        { abstract: { contains: search } },
      ]
    }
    if (year) where.year = parseInt(year)
    if (topic) where.tags = { contains: topic }
    if (type) where.articleType = type

    const [publications, total] = await Promise.all([
      prisma.publication.findMany({
        where,
        orderBy: { year: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, title: true, authors: true, year: true, journal: true,
          abstract: true, doi: true, pubmedId: true, arxivId: true, pdfUrl: true,
          tags: true, researchLineage: true, articleType: true, featured: true,
          createdAt: true, updatedAt: true,
        },
      }),
      prisma.publication.count({ where }),
    ])

    return NextResponse.json({
      publications,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Failed to fetch publications:", msg)
    return NextResponse.json(
      { error: "Failed to fetch publications", detail: msg },
      { status: 500 }
    )
  }
}
