import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const datasets = await prisma.memberDataset.findMany({
      where: { memberId: auth.memberId },
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(datasets)
  } catch (error) {
    console.error("Failed to fetch datasets:", error)
    return NextResponse.json({ error: "Failed to fetch datasets" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, source, doi, url, filePath, mcpServer, format, size, tags } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const dataset = await prisma.memberDataset.create({
      data: {
        memberId: auth.memberId,
        name: name.trim(),
        description: description?.trim() || null,
        source: source || "LOCAL",
        doi: doi?.trim() || null,
        url: url?.trim() || null,
        filePath: filePath?.trim() || null,
        mcpServer: mcpServer?.trim() || null,
        format: format?.trim() || null,
        size: size?.trim() || null,
        tags: tags?.trim() || null,
      },
    })

    return NextResponse.json(dataset, { status: 201 })
  } catch (error) {
    console.error("Failed to create dataset:", error)
    return NextResponse.json({ error: "Failed to create dataset" }, { status: 500 })
  }
}
