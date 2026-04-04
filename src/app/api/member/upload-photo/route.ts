import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export const dynamic = "force-dynamic"

/**
 * POST /api/member/upload-photo
 * Members can upload their own headshot photo.
 * Accepts multipart/form-data with field: photo (file)
 * Stores as base64 data URL in the database (works on Vercel).
 */
export async function POST(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("photo") as File | null

    if (!file) {
      return NextResponse.json({ error: "Photo file is required" }, { status: 400 })
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

    const member = await prisma.labMember.findUnique({ where: { id: auth.memberId } })
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Convert to base64 data URL — works on Vercel's read-only filesystem
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString("base64")
    const dataUrl = `data:${file.type};base64,${base64}`

    await prisma.labMember.update({
      where: { id: auth.memberId },
      data: { headshot: dataUrl },
    })

    return NextResponse.json({ success: true, headshot: dataUrl })
  } catch (error) {
    console.error("Failed to upload photo:", error)
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 })
  }
}
