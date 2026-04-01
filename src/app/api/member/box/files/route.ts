import { NextRequest, NextResponse } from "next/server"
import { verifyMemberToken } from "@/lib/member-auth"
import { prisma } from "@/lib/db"
import { getBoxClient } from "@/lib/box"

export async function GET(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const member = await prisma.labMember.findUnique({
      where: { id: auth.memberId },
      select: { boxFolderId: true },
    })

    if (!member?.boxFolderId) {
      return NextResponse.json({ error: "No Box folder linked" }, { status: 404 })
    }

    const folderId = request.nextUrl.searchParams.get("folderId") || member.boxFolderId
    const client = getBoxClient()

    const folder = await client.folders.getFolderById(folderId)
    const items = await client.folders.getFolderItems(folderId)

    const files = (items.entries || []).map((item) => ({
      id: item.id,
      type: item.type,
      name: item.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      size: (item as any).size || null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      modifiedAt: (item as any).modifiedAt || (item as any).modified_at || null,
    }))

    return NextResponse.json({
      folderName: folder.name,
      folderId: folder.id,
      rootFolderId: member.boxFolderId,
      files,
    })
  } catch (error) {
    console.error("Box API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch Box files" },
      { status: 500 }
    )
  }
}
