import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"
import { scoreInquiry } from "@/lib/score-inquiry"

// POST /api/admin/score-candidate — manually (re)score an inquiry with AI.
export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { inquiryId } = await request.json()
    if (!inquiryId) {
      return NextResponse.json({ error: "inquiryId required" }, { status: 400 })
    }

    const inquiry = await prisma.inquirySubmission.findUnique({ where: { id: inquiryId } })
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const parsed = await scoreInquiry(inquiry)
    if (!parsed) {
      return NextResponse.json({ error: "AI scoring failed" }, { status: 502 })
    }

    const analysis = JSON.stringify({
      pros: parsed.pros,
      cons: parsed.cons,
      clarifications: parsed.clarifications,
      summary: parsed.summary,
    })

    const updated = await prisma.inquirySubmission.update({
      where: { id: inquiryId },
      data: {
        aiScore: Math.round(parsed.overall),
        aiScoreBreakdown: JSON.stringify(parsed.scores),
        aiAnalysis: analysis,
        aiScoredAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      inquiry: updated,
      scores: parsed.scores,
      overall: parsed.overall,
      pros: parsed.pros,
      cons: parsed.cons,
      clarifications: parsed.clarifications,
      summary: parsed.summary,
    })
  } catch (error) {
    console.error("Score candidate error:", error)
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 })
  }
}
