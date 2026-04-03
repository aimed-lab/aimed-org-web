import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

/**
 * GET /api/team
 * Public API: returns lab members for the public team page.
 * - ACTIVE members (excluding Pending) shown as current team
 * - ALUMNI members shown as past team
 * - INACTIVE members are NOT shown
 * Only exposes name, role, headshot, bio — no emails or private info.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeAlumni = searchParams.get("alumni") === "true"

    // Define a custom sort order for roles so PI comes first
    const rolePriority: Record<string, number> = {
      "Principal Investigator": 0,
      "Postdoc": 1,
      "PhD Student": 2,
      "Research Staff": 3,
      "Visiting Scholar": 4,
      "Intern": 5,
      "Undergraduate Researcher": 6,
      "Systems Administrator": 7,
      "Other": 8,
    }

    const selectFields = {
      id: true,
      name: true,
      role: true,
      headshot: true,
      bio: true,
      githubUsername: true,
      orcidId: true,
      joinDate: true,
      status: true,
    }

    // Fetch active members
    const activeMembers = await prisma.labMember.findMany({
      where: {
        status: "ACTIVE",
        role: { not: "Pending" },
      },
      select: selectFields,
      orderBy: { joinDate: "asc" },
    })

    // Sort by role priority
    activeMembers.sort((a, b) => {
      const pa = rolePriority[a.role] ?? 99
      const pb = rolePriority[b.role] ?? 99
      if (pa !== pb) return pa - pb
      return new Date(a.joinDate).getTime() - new Date(b.joinDate).getTime()
    })

    // Optionally fetch alumni
    let alumniMembers: typeof activeMembers = []
    if (includeAlumni) {
      alumniMembers = await prisma.labMember.findMany({
        where: {
          status: "ALUMNI",
          role: { not: "Pending" },
        },
        select: selectFields,
        orderBy: { joinDate: "desc" },
      })
    }

    return NextResponse.json({
      current: activeMembers,
      alumni: alumniMembers,
    })
  } catch (error) {
    console.error("Failed to fetch team:", error)
    return NextResponse.json({ error: "Failed to fetch team" }, { status: 500 })
  }
}
