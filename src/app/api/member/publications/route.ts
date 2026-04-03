import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"

async function getMemberId(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("member_token")?.value
  if (!token) return null
  try {
    const decoded = JSON.parse(Buffer.from(token, "base64").toString())
    return decoded.memberId || null
  } catch {
    return null
  }
}

/**
 * GET /api/member/publications
 * Returns verified publications where the member appears as co-author.
 * Matches by member name (full name and last name).
 */
export async function GET(request: NextRequest) {
  const memberId = await getMemberId()
  if (!memberId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const member = await prisma.labMember.findUnique({
      where: { id: memberId },
      select: { name: true, email: true },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Build name variants for matching
    const fullName = member.name.trim()
    const nameParts = fullName.split(/\s+/)
    const lastName = nameParts[nameParts.length - 1]
    const firstInitial = nameParts[0]?.[0] || ""

    // Fetch all verified publications and filter in-app
    // (SQLite LIKE is case-insensitive for ASCII)
    const allPubs = await prisma.publication.findMany({
      where: { curationStatus: "VERIFIED" },
      orderBy: { year: "desc" },
    })

    // Match by author string
    const matched = allPubs
      .map((pub) => {
        const authors = pub.authors.toLowerCase()
        const fullLower = fullName.toLowerCase()
        const lastLower = lastName.toLowerCase()

        if (authors.includes(fullLower)) {
          return { ...pub, matchConfidence: "exact" as const }
        }
        // Check "LastName, F." pattern
        if (authors.includes(lastLower) && firstInitial && authors.includes(`${lastLower}, ${firstInitial.toLowerCase()}`)) {
          return { ...pub, matchConfidence: "high" as const }
        }
        // Last name only match (could be false positive for common names)
        if (authors.includes(lastLower) && lastName.length > 3) {
          return { ...pub, matchConfidence: "partial" as const }
        }
        return null
      })
      .filter(Boolean)

    return NextResponse.json(matched)
  } catch (error) {
    console.error("Fetch member publications error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}
