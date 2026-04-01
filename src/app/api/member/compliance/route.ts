import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const docs = await prisma.memberCompliance.findMany({
      where: { memberId: auth.memberId },
      orderBy: { updatedAt: "desc" },
    })
    return NextResponse.json(docs)
  } catch (error) {
    console.error("Failed to fetch compliance docs:", error)
    return NextResponse.json({ error: "Failed to fetch compliance documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { docType, title, description, issuer, fileUrl, expiresAt, status, protocolNum, notes } = body

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!docType) {
      return NextResponse.json({ error: "Document type is required" }, { status: 400 })
    }

    const doc = await prisma.memberCompliance.create({
      data: {
        memberId: auth.memberId,
        docType,
        title: title.trim(),
        description: description?.trim() || null,
        issuer: issuer?.trim() || null,
        fileUrl: fileUrl?.trim() || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        status: status || "ACTIVE",
        protocolNum: protocolNum?.trim() || null,
        notes: notes?.trim() || null,
      },
    })

    return NextResponse.json(doc, { status: 201 })
  } catch (error) {
    console.error("Failed to create compliance doc:", error)
    return NextResponse.json({ error: "Failed to create compliance document" }, { status: 500 })
  }
}
