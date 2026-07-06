import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { prisma } from "@/lib/db"
import { sendAdminNotification } from "@/lib/email"
import { scoreInquiry } from "@/lib/score-inquiry"

// Email admins only for high-quality inquiries at/above this AI score (0-100).
const ALERT_THRESHOLD = 80

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

    // Auto-score the inquiry and alert admins ONLY for strong candidates (>= threshold).
    // Runs after the response so the submitter isn't blocked on the AI call.
    after(async () => {
      try {
        const score = await scoreInquiry({ name, email, role, interestArea, message })
        if (!score) return
        await prisma.inquirySubmission.update({
          where: { id: inquiry.id },
          data: {
            aiScore: Math.round(score.overall),
            aiScoreBreakdown: JSON.stringify(score.scores),
            aiAnalysis: JSON.stringify({ pros: score.pros, cons: score.cons, clarifications: score.clarifications, summary: score.summary }),
            aiScoredAt: new Date(),
          },
        })
        if (Math.round(score.overall) >= ALERT_THRESHOLD) {
          await sendAdminNotification(
            `⭐ Strong inquiry (${Math.round(score.overall)}/100) from ${esc(name)}`,
            `<p><strong>AI score:</strong> ${Math.round(score.overall)}/100</p>
             <p><strong>Name:</strong> ${esc(name)} &middot; <strong>Email:</strong> ${esc(email)}</p>
             <p><strong>Role:</strong> ${esc(role || "Other")} &middot; <strong>Interest:</strong> ${esc(interestArea || "Other")}</p>
             <p><strong>Summary:</strong> ${esc(score.summary)}</p>
             <p><strong>Message:</strong></p><p>${esc(message || "")}</p>
             <p style="margin-top:16px"><a href="https://aimed-lab.org/admin/recruits">Review in Recruits →</a></p>`
          )
        }
      } catch (e) {
        console.error("Inquiry auto-score/alert failed:", e)
      }
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
