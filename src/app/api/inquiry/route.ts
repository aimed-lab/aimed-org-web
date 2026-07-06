import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { sendAdminNotification } from "@/lib/email"

function esc(s: string) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string))
}

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

    // Alert all admins (best-effort — never fails the submission).
    try {
      await sendAdminNotification(
        `New inquiry from ${esc(name)}`,
        `<p><strong>Name:</strong> ${esc(name)}</p>
         <p><strong>Email:</strong> ${esc(email)}</p>
         <p><strong>Role:</strong> ${esc(role || "Other")} &middot; <strong>Interest:</strong> ${esc(interestArea || "Other")}</p>
         <p><strong>Message:</strong></p><p>${esc(message)}</p>
         <p style="margin-top:16px"><a href="https://aimed-lab.org/admin/recruits">Review in Recruits →</a></p>`
      )
    } catch (e) {
      console.error("Admin notification (inquiry) failed:", e)
    }

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
