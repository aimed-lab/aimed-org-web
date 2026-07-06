// Shared AI scoring for recruitment inquiries (used by the manual "Score with AI"
// endpoint and by auto-scoring on inquiry arrival).

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ""
const GEMINI_MODEL = "gemini-2.5-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

export interface InquiryLike {
  name: string
  email: string
  role?: string | null
  interestArea?: string | null
  message?: string | null
}

export interface InquiryScore {
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

/** Score a candidate inquiry with Gemini. Returns null if unavailable/unparseable. */
export async function scoreInquiry(inquiry: InquiryLike): Promise<InquiryScore | null> {
  if (!GEMINI_API_KEY) return null

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
5. Domain Knowledge — understanding of biomedical informatics, biology, pharmacology
6. Practical Experience — research projects, publications, internships, real-world applications

RESPOND IN THIS EXACT JSON FORMAT:
{
  "scores": { "communication": <1-10>, "resilience": <1-10>, "aiFluency": <1-10>, "technicalPrep": <1-10>, "domainKnowledge": <1-10>, "practicalExp": <1-10> },
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
    generationConfig: { temperature: 0.3, maxOutputTokens: 2048, responseMimeType: "application/json" },
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      console.error("scoreInquiry Gemini error:", res.status, await res.text())
      return null
    }
    const data = await res.json()
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""
    let jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim()
    const first = jsonText.indexOf("{")
    const last = jsonText.lastIndexOf("}")
    if (first >= 0 && last > first) jsonText = jsonText.slice(first, last + 1)
    return JSON.parse(jsonText) as InquiryScore
  } catch (e) {
    console.error("scoreInquiry failed:", e)
    return null
  }
}
