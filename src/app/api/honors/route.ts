import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    const where: Record<string, unknown> = {}

    if (category) where.category = category

    const [honors, total] = await Promise.all([
      prisma.honor.findMany({
        where,
        orderBy: { year: "desc" },
      }),
      prisma.honor.count({ where }),
    ])

    return NextResponse.json({ honors, total })
  } catch (error) {
    console.error("Failed to fetch honors:", error)
    return NextResponse.json(
      { error: "Failed to fetch honors" },
      { status: 500 }
    )
  }
}
