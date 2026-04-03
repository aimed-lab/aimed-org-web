import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const member = await prisma.labMember.findUnique({
      where: { id: auth.memberId },
      select: { name: true },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const nameParts = member.name.split(" ")
    const lastName = nameParts[nameParts.length - 1]
    const fullName = member.name.toLowerCase()
    const firstInitial = nameParts[0]?.[0]?.toLowerCase() || ""

    // Only return VERIFIED publications where the member is a co-author
    const allVerifiedPubs = await prisma.publication.findMany({
      where: {
        curationStatus: "VERIFIED",
        authors: { contains: lastName },
      },
      orderBy: { year: "desc" },
      take: 100,
    })

    // Tag each publication with co-author confidence
    const publications = allVerifiedPubs.map((pub) => {
      const authorsLower = pub.authors.toLowerCase()
      let matchConfidence: "exact" | "high" | "partial" = "partial"

      if (authorsLower.includes(fullName)) {
        matchConfidence = "exact"
      } else if (authorsLower.includes(`${lastName.toLowerCase()}, ${firstInitial}`)) {
        matchConfidence = "high"
      }

      return { ...pub, matchConfidence, coAuthorName: member.name }
    })

    // Only return VERIFIED software
    const software = await prisma.softwareResource.findMany({
      where: { curationStatus: "VERIFIED" },
      orderBy: { name: "asc" },
    })

    // Search for patents where member is an inventor
    const patents = await prisma.patent.findMany({
      where: {
        inventors: { contains: lastName },
      },
      orderBy: { year: "desc" },
    })

    return NextResponse.json({ publications, patents, software })
  } catch (error) {
    console.error("Failed to fetch achievements:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}
