import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const software = await prisma.softwareResource.findMany({
      orderBy: { id: "desc" },
      select: {
        id: true, name: true, description: true, url: true, githubUrl: true,
        screenshotUrl: true, relatedPapers: true, category: true, featured: true,
        createdAt: true, updatedAt: true,
      },
    })
    return NextResponse.json({ software, total: software.length })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Failed to fetch software:", msg)
    return NextResponse.json(
      { error: "Failed to fetch software", detail: msg },
      { status: 500 }
    )
  }
}
