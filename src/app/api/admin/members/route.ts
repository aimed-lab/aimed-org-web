import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const members = await prisma.labMember.findMany({
      include: {
        _count: { select: { goals: true } },
        activationCode: { select: { id: true, code: true, used: true, expiresAt: true } },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(members)
  } catch (error) {
    console.error("Failed to fetch members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email, role, joinDate, notionPageUrl, githubUsername, headshot, bio } = body

    if (!name || !email || !role) {
      return NextResponse.json(
        { error: "Name, email, and role are required" },
        { status: 400 }
      )
    }

    const member = await prisma.labMember.create({
      data: {
        name,
        email,
        role,
        joinDate: joinDate ? new Date(joinDate) : new Date(),
        notionPageUrl: notionPageUrl || null,
        githubUsername: githubUsername || null,
        headshot: headshot || null,
        bio: bio || null,
      },
    })

    return NextResponse.json(member, { status: 201 })
  } catch (error: unknown) {
    console.error("Failed to create member:", error)
    const msg =
      error instanceof Error && error.message.includes("Unique")
        ? "A member with that email already exists"
        : "Failed to create member"
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
