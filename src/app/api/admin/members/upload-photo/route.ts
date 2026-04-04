import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/admin/members/upload-photo
 * Uploads a headshot photo for a member.
 * Accepts multipart/form-data with fields: memberId, photo (file)
 * Stores the image as a base64 data URL in the LabMember.headshot field.
 * This works on Vercel's read-only filesystem.
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

    // Verify member exists
    const member = await prisma.labMember.findUnique({ where: { id: memberId } })
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Convert to base64 data URL — works on Vercel's read-only filesystem
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    // Update DB with the data URL
    await prisma.labMember.update({
      where: { id: memberId },
      data: { headshot: dataUrl },
    })

    return NextResponse.json({ success: true, headshot: dataUrl })
  } catch (error) {
    console.error("Failed to upload photo:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
