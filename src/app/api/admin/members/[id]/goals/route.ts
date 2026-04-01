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
    const goals = await prisma.quarterlyGoal.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(goals)
  } catch (error) {
    console.error("Failed to fetch goals:", error)
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 })
  }
}

export async function POST(
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
    const { quarter, title, description } = body

    if (!quarter || !title) {
      return NextResponse.json(
        { error: "Quarter and title are required" },
        { status: 400 }
      )
    }

    const goal = await prisma.quarterlyGoal.create({
      data: {
        memberId,
        quarter,
        title,
        description: description || null,
        status: "IN_PROGRESS",
      },
    })

    return NextResponse.json(goal, { status: 201 })
  } catch (error) {
    console.error("Failed to create goal:", error)
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 })
  }
}
