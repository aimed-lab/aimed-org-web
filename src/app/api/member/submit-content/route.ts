import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

const VALID_CONTENT_TYPES = ["PUBLICATION", "HONOR", "SOFTWARE", "PATENT", "NEWS"]

export async function POST(request: NextRequest) {
  const member = await verifyMemberToken()
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { contentType, title, data } = body

    if (!contentType || !VALID_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json({ error: "Invalid contentType" }, { status: 400 })
    }
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const submission = await prisma.contentSubmission.create({
      data: {
        memberId: member.memberId,
        contentType,
        title: title.trim(),
        data: typeof data === "string" ? data : JSON.stringify(data),
        status: "PENDING",
      },
    })

    return NextResponse.json(submission, { status: 201 })
  } catch (error) {
    console.error("Submit content error:", error)
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 })
  }
}

export async function GET() {
  const member = await verifyMemberToken()
  if (!member) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const submissions = await prisma.contentSubmission.findMany({
      where: { memberId: member.memberId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Fetch submissions error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
