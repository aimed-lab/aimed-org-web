import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params
  const toolId = parseInt(id, 10)
  if (isNaN(toolId)) {
    return NextResponse.json({ error: "Invalid tool ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberTool.findUnique({ where: { id: toolId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, toolType, url, githubRepo, dockerImage, apiEndpoint, mcpServer, status, tags } = body

    const updated = await prisma.memberTool.update({
      where: { id: toolId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(toolType !== undefined && { toolType }),
        ...(url !== undefined && { url: url?.trim() || null }),
        ...(githubRepo !== undefined && { githubRepo: githubRepo?.trim() || null }),
        ...(dockerImage !== undefined && { dockerImage: dockerImage?.trim() || null }),
        ...(apiEndpoint !== undefined && { apiEndpoint: apiEndpoint?.trim() || null }),
        ...(mcpServer !== undefined && { mcpServer: mcpServer?.trim() || null }),
        ...(status !== undefined && { status }),
        ...(tags !== undefined && { tags: tags?.trim() || null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update tool:", error)
    return NextResponse.json({ error: "Failed to update tool" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params
  const toolId = parseInt(id, 10)
  if (isNaN(toolId)) {
    return NextResponse.json({ error: "Invalid tool ID" }, { status: 400 })
  }

  try {
    const existing = await prisma.memberTool.findUnique({ where: { id: toolId } })
    if (!existing || existing.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.memberTool.delete({ where: { id: toolId } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete tool:", error)
    return NextResponse.json({ error: "Failed to delete tool" }, { status: 500 })
  }
}
