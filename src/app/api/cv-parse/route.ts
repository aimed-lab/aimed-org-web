import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { findDuplicates } from "@/lib/publication-utils"

export const dynamic = "force-dynamic"

async function parsePdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>
  const result = await pdfParse(buffer)
  return result.text
}

async function parseDocx(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require("mammoth") as { extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string }> }
  const result = await mammoth.extractRawText({ buffer })
  return result.value
}

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? ""
const GEMINI_MODEL = "gemini-2.5-flash"
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`

interface ParsedPublication {
  title: string
  authors: string
  year: number
  journal?: string
  doi?: string
  pubmedId?: string
  arxivId?: string
  articleType?: string
}

interface ParsedTalk {
  title: string
  venue?: string
  host?: string
  city?: string
  country?: string
  date?: string
  talkType?: string
}

interface ParsedHonor {
  awardName: string
  year?: number
  category?: string
  issuer?: string
  description?: string
}

interface ParsedSoftware {
  name: string
  description?: string
  url?: string
  githubUrl?: string
  category?: string
}

interface ParsedPatent {
  title: string
  year?: number
  inventors?: string
  filingInfo?: string
}

interface ParseResult {
  publications: ParsedPublication[]
  talks: ParsedTalk[]
  honors: ParsedHonor[]
  software: ParsedSoftware[]
  patents: ParsedPatent[]
}

/**
 * POST /api/cv-parse
 * Public (no auth required) — upload a CV PDF and extract all content types using Gemini.
 */
export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("cv") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Only PDF and Word (.docx) files are supported" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    let extractedText: string
    if (file.type === "application/pdf") {
      extractedText = await parsePdf(buffer)
    } else {
      extractedText = await parseDocx(buffer)
    }

    if (!extractedText || extractedText.trim().length < 100) {
      return NextResponse.json({
        error: "Could not extract enough text from the file. It may be a scanned image or empty document.",
      }, { status: 400 })
    }

    const pdfText = extractedText

    const truncatedText = pdfText.substring(0, 50000)

    const prompt = `You are a precise academic CV parser. Extract ALL structured content from this CV into categorized sections.

IMPORTANT RULES:
- Extract each item into its correct category.
- Parse author lists exactly as they appear.
- Extract DOI if present (format: 10.xxxx/...).
- For publication articleType, use: "Journal Article", "Conference", "Preprint", "Book Chapter", "Book", "Review"
- For talk talkType, use: "Invited Talk", "Keynote", "Panel", "Workshop", "Seminar", "Conference Talk"
- For software category, use: "Tool", "Database", "Pipeline", "Library", "Web Application"
- If year/date is not clear, use best estimate from context.
- Do NOT include items from Wenzhou Medical University or any China-based affiliations.

CV TEXT:
${truncatedText}

RESPOND WITH A JSON OBJECT with these sections:
{
  "publications": [
    {
      "title": "Full paper title",
      "authors": "Author1, Author2, Author3",
      "year": 2024,
      "journal": "Journal Name",
      "doi": "10.xxxx/yyyy or null",
      "pubmedId": "12345678 or null",
      "arxivId": "2401.12345 or null",
      "articleType": "Journal Article"
    }
  ],
  "talks": [
    {
      "title": "Talk title",
      "venue": "Conference/Institution name",
      "host": "Hosting organization",
      "city": "City",
      "country": "Country",
      "date": "2024-03-15 or null",
      "talkType": "Invited Talk"
    }
  ],
  "honors": [
    {
      "awardName": "Award name",
      "year": 2024,
      "category": "Research/Teaching/Service",
      "issuer": "Issuing organization",
      "description": "Brief description or null"
    }
  ],
  "software": [
    {
      "name": "Software name",
      "description": "Brief description",
      "url": "URL or null",
      "githubUrl": "GitHub URL or null",
      "category": "Tool"
    }
  ],
  "patents": [
    {
      "title": "Patent title",
      "year": 2024,
      "inventors": "Inventor1, Inventor2",
      "filingInfo": "Patent number or filing info"
    }
  ]
}

Return ONLY the JSON object. No markdown fences, no explanations.`

    const geminiBody = {
      system_instruction: {
        parts: [{ text: "You are a strict JSON-only responder. Return ONLY valid JSON, no markdown fences, no extra text." }],
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 16000,
      },
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error("Gemini API error:", geminiRes.status, errText)
      return NextResponse.json({ error: "AI parsing failed. Try again." }, { status: 502 })
    }

    const geminiData = await geminiRes.json()
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? ""

    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    let parsed: ParseResult
    try {
      parsed = JSON.parse(jsonText)
      if (typeof parsed !== "object" || parsed === null) throw new Error("Not an object")
    } catch {
      console.error("Failed to parse Gemini response:", jsonText.substring(0, 500))
      return NextResponse.json({
        error: "AI returned invalid data. Please try again.",
        rawText: jsonText.substring(0, 1000),
      }, { status: 502 })
    }

    parsed.publications = parsed.publications || []
    parsed.talks = parsed.talks || []
    parsed.honors = parsed.honors || []
    parsed.software = parsed.software || []
    parsed.patents = parsed.patents || []

    // Check publications for duplicates
    const pubResults = []
    for (const pub of parsed.publications) {
      try {
        const dupes = await findDuplicates({
          title: pub.title,
          doi: pub.doi,
          pubmedId: pub.pubmedId,
          year: pub.year,
        })
        pubResults.push({ ...pub, isDuplicate: dupes.length > 0, duplicateOf: dupes[0] || null })
      } catch {
        pubResults.push({ ...pub, isDuplicate: false, duplicateOf: null })
      }
    }

    // Check talks
    const existingTalks = await prisma.talk.findMany({ select: { id: true, title: true } })
    const talkResults = parsed.talks.map((t) => {
      const norm = t.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
      const dup = existingTalks.find((et) => et.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim() === norm)
      return { ...t, isDuplicate: !!dup, duplicateOf: dup || null }
    })

    // Check honors
    const existingHonors = await prisma.honor.findMany({ select: { id: true, awardName: true } })
    const honorResults = parsed.honors.map((h) => {
      const norm = h.awardName.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
      const dup = existingHonors.find((eh) => eh.awardName.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim() === norm)
      return { ...h, isDuplicate: !!dup, duplicateOf: dup || null }
    })

    // Check software
    const existingSoftware = await prisma.softwareResource.findMany({ select: { id: true, name: true } })
    const softwareResults = parsed.software.map((s) => {
      const norm = s.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
      const dup = existingSoftware.find((es) => es.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim() === norm)
      return { ...s, isDuplicate: !!dup, duplicateOf: dup || null }
    })

    // Check patents
    const existingPatents = await prisma.patent.findMany({ select: { id: true, title: true } })
    const patentResults = parsed.patents.map((p) => {
      const norm = p.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim()
      const dup = existingPatents.find((ep) => ep.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim() === norm)
      return { ...p, isDuplicate: !!dup, duplicateOf: dup || null }
    })

    return NextResponse.json({
      sourceFilename: file.name,
      publications: pubResults,
      talks: talkResults,
      honors: honorResults,
      software: softwareResults,
      patents: patentResults,
      summary: {
        publications: { total: pubResults.length, new: pubResults.filter((p) => !p.isDuplicate).length },
        talks: { total: talkResults.length, new: talkResults.filter((t) => !t.isDuplicate).length },
        honors: { total: honorResults.length, new: honorResults.filter((h) => !h.isDuplicate).length },
        software: { total: softwareResults.length, new: softwareResults.filter((s) => !s.isDuplicate).length },
        patents: { total: patentResults.length, new: patentResults.filter((p) => !p.isDuplicate).length },
      },
    })
  } catch (error) {
    console.error("CV parse error:", error)
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 })
  }
}

/**
 * PUT /api/cv-parse
 * Public (no auth required) — import selected items from a parse result into the database.
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { publications, talks, honors, software, patents, sourceFilename } = body
    const counts = { publications: 0, talks: 0, honors: 0, software: 0, patents: 0 }

    if (publications?.length) {
      for (const pub of publications as ParsedPublication[]) {
        const dupes = await findDuplicates({ title: pub.title, doi: pub.doi, pubmedId: pub.pubmedId, year: pub.year })
        if (dupes.length > 0) continue
        await prisma.publication.create({
          data: {
            title: pub.title, authors: pub.authors || "", year: pub.year || new Date().getFullYear(),
            journal: pub.journal || null, doi: pub.doi || null, pubmedId: pub.pubmedId || null,
            arxivId: pub.arxivId || null, articleType: pub.articleType || "Journal Article",
            curationStatus: "PROVISIONAL", sourceCV: sourceFilename || null,
          },
        })
        counts.publications++
      }
    }

    if (talks?.length) {
      for (const talk of talks as ParsedTalk[]) {
        await prisma.talk.create({
          data: {
            title: talk.title, venue: talk.venue || null, host: talk.host || null,
            city: talk.city || null, country: talk.country || null,
            date: talk.date ? new Date(talk.date) : null, talkType: talk.talkType || null,
          },
        })
        counts.talks++
      }
    }

    if (honors?.length) {
      for (const honor of honors as ParsedHonor[]) {
        await prisma.honor.create({
          data: {
            awardName: honor.awardName, year: honor.year || null, category: honor.category || null,
            issuer: honor.issuer || null, description: honor.description || null,
          },
        })
        counts.honors++
      }
    }

    if (software?.length) {
      for (const sw of software as ParsedSoftware[]) {
        await prisma.softwareResource.create({
          data: {
            name: sw.name, description: sw.description || null, url: sw.url || null,
            githubUrl: sw.githubUrl || null, category: sw.category || null, curationStatus: "PROVISIONAL",
          },
        })
        counts.software++
      }
    }

    if (patents?.length) {
      for (const patent of patents as ParsedPatent[]) {
        await prisma.patent.create({
          data: {
            title: patent.title, year: patent.year || null,
            inventors: patent.inventors || null, filingInfo: patent.filingInfo || null,
          },
        })
        counts.patents++
      }
    }

    return NextResponse.json({ imported: counts })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
