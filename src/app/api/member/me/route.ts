import { NextResponse } from "next/server"
import { verifyMemberToken } from "@/lib/member-auth"
import { verifyAdminToken } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const memberAuth = await verifyMemberToken()
    if (!memberAuth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const member = await prisma.labMember.findUnique({
      where: { id: memberAuth.memberId },
      include: {
        goals: { orderBy: { quarter: "desc" } },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Check if user is also an admin
    const adminEmail = await verifyAdminToken()
    const isAdmin = adminEmail !== null

    return NextResponse.json({ ...member, isAdmin })
  } catch (error) {
    console.error("Failed to fetch member profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
