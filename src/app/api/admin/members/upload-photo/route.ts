import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/members/upload-photo
 * Uploads a headshot photo for a member.
 * Accepts multipart/form-data with fields: memberId, photo (file)
 * Saves to public/members/ and updates the LabMember.headshot field.
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const memberId = parseInt(formData.get("memberId") as string, 10)
    const file = formData.get("photo") as File | null

    if (isNaN(memberId) || !file) {
      return NextResponse.json({ error: "memberId and photo file are required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 })
    }

    // Get member to use their name for the filename
    const member = await prisma.labMember.findUnique({ where: { id: memberId } })
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Generate a clean filename from member's name
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg"
    const slug = member.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
    const filename = `${slug}.${ext}`

    // Save to public/members/
    const publicDir = path.join(process.cwd(), "public", "members")
    await mkdir(publicDir, { recursive: true })
    const filePath = path.join(publicDir, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Update DB with the public URL path
    const headshotUrl = `/members/${filename}`
    await prisma.labMember.update({
      where: { id: memberId },
      data: { headshot: headshotUrl },
    })

    return NextResponse.json({ success: true, headshot: headshotUrl })
  } catch (error) {
    console.error("Failed to upload photo:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
