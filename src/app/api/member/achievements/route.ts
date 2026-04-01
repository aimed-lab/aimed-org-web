import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    // Get the member's name for matching in publications/patents
    const member = await prisma.labMember.findUnique({
      where: { id: auth.memberId },
      select: { name: true },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Search for publications where the member's name appears in authors
    // Use a simple substring match — the member's last name should appear
    const nameParts = member.name.split(" ")
    const lastName = nameParts[nameParts.length - 1]

    const publications = await prisma.publication.findMany({
      where: {
        authors: { contains: lastName },
      },
      orderBy: { year: "desc" },
      take: 50,
    })

    // Search for patents where member is an inventor
    const patents = await prisma.patent.findMany({
      where: {
        inventors: { contains: lastName },
      },
      orderBy: { year: "desc" },
    })

    // Get all software (members can tag themselves later)
    const software = await prisma.softwareResource.findMany({
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ publications, patents, software })
  } catch (error) {
    console.error("Failed to fetch achievements:", error)
    return NextResponse.json({ error: "Failed to fetch achievements" }, { status: 500 })
  }
}
