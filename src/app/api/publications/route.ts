import { NextRequest, NextResponse } from "next/server"
import { prisma, getDbDiagnostics } from "@/lib/db"
import { statSync, readdirSync } from "fs"
import { resolve, join } from "path"

export async function GET(request: NextRequest) {
  // Debug: try a raw query first
  const { searchParams: sp } = new URL(request.url)
  if (sp.get("debug") === "1") {
    try {
      const raw = await prisma.$queryRawUnsafe("SELECT COUNT(*) as cnt FROM Publication") as Array<{cnt: number}>
      const cols = await prisma.$queryRawUnsafe("PRAGMA table_info(Publication)") as Array<Record<string, unknown>>
      return NextResponse.json({ rawCount: raw, columns: cols })
    } catch (e) {
      return NextResponse.json({ debugError: e instanceof Error ? e.message : String(e) })
    }
  }

  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const year = searchParams.get("year")
    const topic = searchParams.get("topic")
    const type = searchParams.get("type")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")

    const where: Record<string, unknown> = {
      curationStatus: "VERIFIED",
    }

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
    // Debug: check what db files exist on disk
    const dbPath = getDbDiagnostics().activePath
    let fileSize = 0
    try { fileSize = statSync(dbPath).size } catch {}
    let cwdFiles: string[] = []
    try { cwdFiles = readdirSync(process.cwd()).filter(f => f.includes('.db') || f.includes('aimed')) } catch {}

    return NextResponse.json(
      { error: "Failed to fetch publications", detail: msg, db: { ...getDbDiagnostics(), fileSize, cwdFiles } },
      { status: 500 }
    )
  }
}
