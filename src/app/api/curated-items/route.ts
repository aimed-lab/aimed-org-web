import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/curated-items
 * Returns recently approved content submissions (last 30 days) for badge display on public pages.
 * Response: { items: [{ contentType, title, publishedAt, isNew }] }
 */
export async function GET() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const recent = await prisma.contentSubmission.findMany({
      where: {
        status: "APPROVED",
        publishedAt: { gte: thirtyDaysAgo },
      },
      select: {
        contentType: true,
        title: true,
        data: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: { publishedAt: "desc" },
    })

    const items = recent.map((r) => {
      // Determine if this is a brand new item or an update
      // If the submission was created within 1 day of the content being added, it's "new"
      const isNew = true // All curated submissions are considered "new" additions
      return {
        contentType: r.contentType,
        title: r.title,
        publishedAt: r.publishedAt,
        isNew,
      }
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Curated items error:", error)
    return NextResponse.json({ items: [] })
  }
}
