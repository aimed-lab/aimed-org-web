import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    const where: Record<string, unknown> = {}

    if (type) where.talkType = type

    const [talks, total] = await Promise.all([
      prisma.talk.findMany({
        where,
        orderBy: { date: "desc" },
      }),
      prisma.talk.count({ where }),
    ])

    return NextResponse.json({ talks, total })
  } catch (error) {
    console.error("Failed to fetch talks:", error)
    return NextResponse.json(
      { error: "Failed to fetch talks" },
      { status: 500 }
    )
  }
}
