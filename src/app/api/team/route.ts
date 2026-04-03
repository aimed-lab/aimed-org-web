import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/team
 * Public API: returns active lab members for the public team page.
 * Only exposes name, role, headshot, bio, and join date — no emails or private info.
 */
export async function GET() {
  try {
    const members = await prisma.labMember.findMany({
      where: {
        status: "ACTIVE",
        role: { not: "Pending" }, // Exclude pending invitations
      },
      select: {
        id: true,
        name: true,
        role: true,
        headshot: true,
        bio: true,
        githubUsername: true,
        orcidId: true,
        joinDate: true,
      },
      orderBy: [
        { role: "asc" },
        { joinDate: "asc" },
      ],
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Failed to fetch team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}
