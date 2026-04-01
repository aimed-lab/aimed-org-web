import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"
import { verifyAdminToken } from "@/lib/auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const member = await prisma.labMember.findUnique({
      where: { id: auth.memberId },
      include: {
        goals: { orderBy: { quarter: "desc" } },
        projects: { orderBy: { updatedAt: "desc" } },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const adminEmail = await verifyAdminToken()
    const isAdmin = adminEmail !== null

    return NextResponse.json({ ...member, isAdmin })
  } catch (error) {
    console.error("Failed to fetch profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { bio, orcidId, githubUsername, notionPageUrl, boxFolderUrl } = body

    const updated = await prisma.labMember.update({
      where: { id: auth.memberId },
      data: {
        ...(bio !== undefined && { bio: bio?.trim() || null }),
        ...(orcidId !== undefined && { orcidId: orcidId?.trim() || null }),
        ...(githubUsername !== undefined && { githubUsername: githubUsername?.trim() || null }),
        ...(notionPageUrl !== undefined && { notionPageUrl: notionPageUrl?.trim() || null }),
        ...(boxFolderUrl !== undefined && { boxFolderUrl: boxFolderUrl?.trim() || null }),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
