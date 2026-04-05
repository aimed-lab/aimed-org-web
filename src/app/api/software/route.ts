import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const software = await prisma.softwareResource.findMany({
      orderBy: { id: "desc" },
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
