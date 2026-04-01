import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken, generateActivationCode } from "@/lib/auth"

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
    // Verify member exists
    const member = await prisma.labMember.findUnique({ where: { id: memberId } })
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Delete any existing activation code for this member
    await prisma.activationCode.deleteMany({ where: { memberId } })

    const code = generateActivationCode()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    const activationCode = await prisma.activationCode.create({
      data: {
        code,
        memberId,
        expiresAt,
        createdBy: admin,
      },
    })

    return NextResponse.json(activationCode, { status: 201 })
  } catch (error) {
    console.error("Failed to generate activation code:", error)
    return NextResponse.json(
      { error: "Failed to generate activation code" },
      { status: 500 }
    )
  }
}
