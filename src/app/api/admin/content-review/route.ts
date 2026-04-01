import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get("status")

    const where = statusFilter && statusFilter !== "ALL"
      ? { status: statusFilter }
      : {}

    const submissions = await prisma.contentSubmission.findMany({
      where,
      include: {
        member: {
          select: { id: true, name: true, email: true, headshot: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("Fetch content submissions error:", error)
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, action, reviewNotes, editedData } = body

    if (!id || !action) {
      return NextResponse.json({ error: "id and action required" }, { status: 400 })
    }

    const submission = await prisma.contentSubmission.findUnique({
      where: { id },
      include: { member: true },
    })

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    if (action === "APPROVE") {
      // Parse the data to create a public record
      const data = editedData
        ? (typeof editedData === "string" ? JSON.parse(editedData) : editedData)
        : JSON.parse(submission.data)

      // Create the appropriate public record
      await createPublicRecord(submission.contentType, data)

      // Update submission status
      const updated = await prisma.contentSubmission.update({
        where: { id },
        data: {
          status: "APPROVED",
          reviewNotes: reviewNotes || null,
          reviewedBy: admin,
          reviewedAt: new Date(),
          publishedAt: new Date(),
          data: editedData ? (typeof editedData === "string" ? editedData : JSON.stringify(editedData)) : submission.data,
        },
      })

      return NextResponse.json(updated)
    }

    if (action === "REJECT" || action === "REVISION_REQUESTED") {
      const updated = await prisma.contentSubmission.update({
        where: { id },
        data: {
          status: action === "REJECT" ? "REJECTED" : "REVISION_REQUESTED",
          reviewNotes: reviewNotes || null,
          reviewedBy: admin,
          reviewedAt: new Date(),
        },
      })

      return NextResponse.json(updated)
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Review content error:", error)
    return NextResponse.json({ error: "Review failed" }, { status: 500 })
  }
}

async function createPublicRecord(contentType: string, data: Record<string, unknown>) {
  switch (contentType) {
    case "PUBLICATION":
      await prisma.publication.create({
        data: {
          title: (data.title as string) || "Untitled",
          authors: (data.authors as string) || "",
          year: (data.year as number) || new Date().getFullYear(),
          journal: (data.journal as string) || null,
          abstract: (data.abstract as string) || null,
          doi: (data.doi as string) || null,
          pubmedId: (data.pubmedId as string) || null,
          tags: (data.tags as string) || null,
          researchLineage: (data.researchLineage as string) || null,
          articleType: (data.articleType as string) || null,
        },
      })
      break
    case "HONOR":
      await prisma.honor.create({
        data: {
          awardName: (data.awardName as string) || (data.title as string) || "Untitled",
          year: (data.year as number) || null,
          category: (data.category as string) || null,
          issuer: (data.issuer as string) || null,
          description: (data.description as string) || null,
        },
      })
      break
    case "SOFTWARE":
      await prisma.softwareResource.create({
        data: {
          name: (data.name as string) || (data.title as string) || "Untitled",
          description: (data.description as string) || null,
          url: (data.url as string) || null,
          githubUrl: (data.githubUrl as string) || null,
          category: (data.category as string) || null,
        },
      })
      break
    case "PATENT":
      await prisma.patent.create({
        data: {
          title: (data.title as string) || "Untitled",
          year: (data.year as number) || null,
          inventors: (data.inventors as string) || null,
          filingInfo: (data.filingInfo as string) || null,
          relatedResearch: (data.relatedResearch as string) || null,
        },
      })
      break
    case "NEWS":
      await prisma.newsItem.create({
        data: {
          headline: (data.headline as string) || (data.title as string) || "Untitled",
          summary: (data.summary as string) || null,
          imageUrl: (data.imageUrl as string) || null,
          link: (data.link as string) || null,
          date: data.date ? new Date(data.date as string) : new Date(),
          published: true,
        },
      })
      break
  }
}
