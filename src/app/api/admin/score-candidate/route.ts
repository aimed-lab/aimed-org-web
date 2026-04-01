import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ""
const GEMINI_MODEL = "gemini-2.5-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

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

    const inquiry = await prisma.inquirySubmission.findUnique({
      where: { id: inquiryId },
    })
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    const prompt = `You are an academic lab recruitment evaluator for the AI.MED Lab at UAB, led by Prof. Jake Y. Chen. The lab focuses on AI-driven drug discovery, bioinformatics, systems pharmacology, and precision medicine.

Evaluate this candidate inquiry and provide scores and analysis.

CANDIDATE INFORMATION:
Name: ${inquiry.name}
Email: ${inquiry.email}
Role Applied: ${inquiry.role || "Not specified"}
Interest Area: ${inquiry.interestArea || "Not specified"}
Message: ${inquiry.message || "No message provided"}

SCORING CRITERIA (score each 1-10):
1. Communication Skill — clarity, professionalism, and quality of written communication
2. Resilience — evidence of bouncing back from challenges, growth mindset
3. AI Fluency — familiarity with AI/ML concepts, tools, and applications
4. Technical Preparation — programming skills, relevant coursework, technical depth
5. Domain Knowledge — understanding of biomedical informatics, biology, pharmacology (assess from transcript/background if available)
6. Practical Experience — research projects, publications, internships, real-world applications

RESPOND IN THIS EXACT JSON FORMAT:
{
  "scores": {
    "communication": <1-10>,
    "resilience": <1-10>,
    "aiFluency": <1-10>,
    "technicalPrep": <1-10>,
    "domainKnowledge": <1-10>,
    "practicalExp": <1-10>
  },
  "overall": <1-100>,
  "pros": ["strength 1", "strength 2"],
  "cons": ["weakness 1", "weakness 2"],
  "clarifications": ["question 1", "question 2"],
  "summary": "2-3 sentence summary recommendation"
}`

    const body = {
      system_instruction: {
        parts: [{ text: "You are a strict JSON-only responder. Return ONLY valid JSON, no markdown fences, no extra text." }],
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1500,
      },
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error("Gemini API error:", geminiRes.status, errText)
      return NextResponse.json({ error: "AI scoring failed" }, { status: 502 })
    }

    const geminiData = await geminiRes.json()
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    // Strip markdown fences if present
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    let parsed: {
      scores: {
        communication: number
        resilience: number
        aiFluency: number
        technicalPrep: number
        domainKnowledge: number
        practicalExp: number
      }
      overall: number
      pros: string[]
      cons: string[]
      clarifications: string[]
      summary: string
    }

    try {
      parsed = JSON.parse(jsonText)
    } catch {
      console.error("Failed to parse Gemini JSON:", jsonText)
      return NextResponse.json({ error: "AI returned invalid response" }, { status: 502 })
    }

    // Build analysis text
    const analysis = JSON.stringify({
      pros: parsed.pros,
      cons: parsed.cons,
      clarifications: parsed.clarifications,
      summary: parsed.summary,
    })

    // Update the inquiry
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
