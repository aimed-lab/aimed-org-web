import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const tools = await prisma.memberTool.findMany({
      where: { memberId: auth.memberId },
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(tools)
  } catch (error) {
    console.error("Failed to fetch tools:", error)
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, description, toolType, url, githubRepo, dockerImage, apiEndpoint, mcpServer, status, tags } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const tool = await prisma.memberTool.create({
      data: {
        memberId: auth.memberId,
        name: name.trim(),
        description: description?.trim() || null,
        toolType: toolType || "GITHUB",
        url: url?.trim() || null,
        githubRepo: githubRepo?.trim() || null,
        dockerImage: dockerImage?.trim() || null,
        apiEndpoint: apiEndpoint?.trim() || null,
        mcpServer: mcpServer?.trim() || null,
        status: status || "ACTIVE",
        tags: tags?.trim() || null,
      },
    })

    return NextResponse.json(tool, { status: 201 })
  } catch (error) {
    console.error("Failed to create tool:", error)
    return NextResponse.json({ error: "Failed to create tool" }, { status: 500 })
  }
}
