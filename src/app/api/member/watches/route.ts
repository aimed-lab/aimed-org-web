import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const watches = await prisma.memberWatch.findMany({
      where: { memberId: auth.memberId },
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(watches)
  } catch (error) {
    console.error("Failed to fetch watches:", error)
    return NextResponse.json({ error: "Failed to fetch watches" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, watchType, query, source, frequency, notes, enabled } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }
    if (!watchType) {
      return NextResponse.json({ error: "Watch type is required" }, { status: 400 })
    }
    if (!query?.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const watch = await prisma.memberWatch.create({
      data: {
        memberId: auth.memberId,
        name: name.trim(),
        watchType,
        query: query.trim(),
        source: source || "PUBMED",
        frequency: frequency || "WEEKLY",
        notes: notes?.trim() || null,
        enabled: enabled !== undefined ? enabled : true,
      },
    })

    return NextResponse.json(watch, { status: 201 })
  } catch (error) {
    console.error("Failed to create watch:", error)
    return NextResponse.json({ error: "Failed to create watch" }, { status: 500 })
  }
}
