import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const news = await prisma.newsItem.findMany({
      where: { published: true },
      orderBy: { date: "desc" },
      take: 20,
    })
    return NextResponse.json(news)
  } catch (error) {
    console.error("Failed to fetch news:", error)
    return NextResponse.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { headline, summary, link, imageUrl, pinned } = body

    if (!headline || !summary) {
      return NextResponse.json(
        { error: "Headline and summary are required" },
        { status: 400 }
      )
    }

    const news = await prisma.newsItem.create({
      data: {
        headline,
        summary,
        link: link || null,
        imageUrl: imageUrl || null,
        pinned: pinned || false,
        published: true,
        date: new Date(),
      },
    })

    return NextResponse.json(news, { status: 201 })
  } catch (error) {
    console.error("Failed to create news item:", error)
    return NextResponse.json(
      { error: "Failed to create news item" },
      { status: 500 }
    )
  }
}
