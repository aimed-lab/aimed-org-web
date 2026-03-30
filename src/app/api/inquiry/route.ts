import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, role, interestArea, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      )
    }

    const inquiry = await prisma.inquirySubmission.create({
      data: {
        name,
        email,
        role: role || "Other",
        interestArea: interestArea || "Other",
        message,
        status: "NEW",
      },
    })

    return NextResponse.json({ success: true, id: inquiry.id }, { status: 201 })
  } catch (error) {
    console.error("Failed to create inquiry:", error)
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const inquiries = await prisma.inquirySubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json(inquiries)
  } catch (error) {
    console.error("Failed to fetch inquiries:", error)
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 }
    )
  }
}
