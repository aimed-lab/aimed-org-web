import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const memberId = parseInt(id, 10)
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
  }

  try {
    const member = await prisma.labMember.findUnique({
      where: { id: memberId },
      include: {
        goals: { orderBy: { createdAt: "desc" } },
        projects: { orderBy: { updatedAt: "desc" } },
        activationCode: true,
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Failed to fetch member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const memberId = parseInt(id, 10)
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const {
      name, email, role, joinDate, status, resumeUrl,
      boxFolderId, boxFolderUrl, notionPageUrl, githubUsername,
      headshot, bio,
    } = body

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (role !== undefined) data.role = role
    if (joinDate !== undefined) data.joinDate = new Date(joinDate)
    if (status !== undefined) data.status = status
    if (resumeUrl !== undefined) data.resumeUrl = resumeUrl
    if (boxFolderId !== undefined) data.boxFolderId = boxFolderId
    if (boxFolderUrl !== undefined) data.boxFolderUrl = boxFolderUrl
    if (notionPageUrl !== undefined) data.notionPageUrl = notionPageUrl
    if (githubUsername !== undefined) data.githubUsername = githubUsername
    if (headshot !== undefined) data.headshot = headshot
    if (bio !== undefined) data.bio = bio

    const member = await prisma.labMember.update({
      where: { id: memberId },
      data,
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Failed to update member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const memberId = parseInt(id, 10)
  if (isNaN(memberId)) {
    return NextResponse.json({ error: "Invalid member ID" }, { status: 400 })
  }

  try {
    // Delete related records first
    await prisma.quarterlyGoal.deleteMany({ where: { memberId } })
    await prisma.activationCode.deleteMany({ where: { memberId } })
    await prisma.labMember.delete({ where: { id: memberId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
