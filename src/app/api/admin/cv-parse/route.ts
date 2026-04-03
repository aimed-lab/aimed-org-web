import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken } from "@/lib/auth"
import { findDuplicates } from "@/lib/publication-utils"
import { readFile } from "fs/promises"
import path from "path"

// Force dynamic rendering — pdf-parse needs canvas which isn't available at build time
export const dynamic = "force-dynamic"

// Lazy-load pdf-parse to avoid canvas dependency at build time
async function parsePdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>
  const result = await pdfParse(buffer)
  return result.text
}

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
  abstract?: string
}

/**
 * POST /api/admin/cv-parse
 * Two modes:
 *   1. Upload a new PDF: multipart form with "cv" file
 *   2. Parse an already-uploaded file: JSON body with { filename }
 *
 * Extracts publication text from PDF, sends to Gemini for structured extraction,
 * checks for duplicates, and optionally inserts as PROVISIONAL.
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
  }

  try {
    let pdfText = ""
    let sourceFilename = ""

    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      // Mode 1: Direct PDF upload
      const formData = await request.formData()
      const file = formData.get("cv") as File | null
      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
      }
      if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are supported for parsing" }, { status: 400 })
      }
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      pdfText = await parsePdf(buffer)
      sourceFilename = file.name
    } else {
      // Mode 2: Parse already-uploaded file
      const body = await request.json()
      const { filename } = body
      if (!filename) {
        return NextResponse.json({ error: "filename required" }, { status: 400 })
      }
      const filePath = path.join(process.cwd(), "uploads", "cv", filename)
      const buffer = await readFile(filePath)
      pdfText = await parsePdf(buffer)
      sourceFilename = filename
    }

    if (!pdfText || pdfText.trim().length < 100) {
      return NextResponse.json({
        error: "Could not extract enough text from the PDF. It may be a scanned image.",
      }, { status: 400 })
    }

    // Truncate to ~30k chars to stay within Gemini context limits
    const truncatedText = pdfText.substring(0, 30000)

    // Call Gemini to extract publications
    const prompt = `You are a precise academic CV parser. Extract ALL publications from this CV text.

IMPORTANT RULES:
- Only extract actual publications (journal articles, conference papers, preprints, book chapters, books).
- Do NOT include talks, presentations, invited lectures, grants, patents, or software.
- Parse author lists exactly as they appear.
- Extract DOI if present (format: 10.xxxx/...).
- Extract PubMed IDs (PMID) if present.
- For articleType, use one of: "Journal Article", "Conference", "Preprint", "Book Chapter", "Book", "Review"
- If year is not clear, use your best estimate from context.

CV TEXT:
${truncatedText}

RESPOND WITH A JSON ARRAY of publications in this exact format:
[
  {
    "title": "Full paper title",
    "authors": "Author1, Author2, Author3",
    "year": 2024,
    "journal": "Journal Name or Conference Name",
    "doi": "10.xxxx/yyyy or null",
    "pubmedId": "12345678 or null",
    "arxivId": "2401.12345 or null",
    "articleType": "Journal Article",
    "abstract": null
  }
]

Return ONLY the JSON array. No markdown fences, no explanations.`

    const geminiBody = {
      system_instruction: {
        parts: [{ text: "You are a strict JSON-only responder. Return ONLY valid JSON array, no markdown fences, no extra text." }],
      },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8000,
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

    // Strip markdown fences if present
    const jsonText = rawText
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    let parsed: ParsedPublication[]
    try {
      parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) throw new Error("Not an array")
    } catch {
      console.error("Failed to parse Gemini response:", jsonText.substring(0, 500))
      return NextResponse.json({
        error: "AI returned invalid data. Raw response saved for debugging.",
        rawText: jsonText.substring(0, 1000),
      }, { status: 502 })
    }

    // Check each parsed publication for duplicates
    const results: {
      publication: ParsedPublication
      status: "new" | "duplicate" | "error"
      duplicateOf?: { id: number; title: string; matchType: string }
    }[] = []

    for (const pub of parsed) {
      try {
        const dupes = await findDuplicates({
          title: pub.title,
          doi: pub.doi,
          pubmedId: pub.pubmedId,
          year: pub.year,
        })

        if (dupes.length > 0) {
          results.push({
            publication: pub,
            status: "duplicate",
            duplicateOf: dupes[0],
          })
        } else {
          results.push({ publication: pub, status: "new" })
        }
      } catch {
        results.push({ publication: pub, status: "error" })
      }
    }

    return NextResponse.json({
      sourceFilename,
      totalParsed: parsed.length,
      newCount: results.filter((r) => r.status === "new").length,
      duplicateCount: results.filter((r) => r.status === "duplicate").length,
      results,
    })
  } catch (error) {
    console.error("CV parse error:", error)
    return NextResponse.json({ error: "Failed to parse CV" }, { status: 500 })
  }
}

/**
 * PUT /api/admin/cv-parse
 * Import selected publications from a parse result.
 * Body: { publications: ParsedPublication[], sourceFilename: string }
 */
export async function PUT(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { publications, sourceFilename } = await request.json()

    if (!publications || !Array.isArray(publications) || publications.length === 0) {
      return NextResponse.json({ error: "No publications to import" }, { status: 400 })
    }

    let imported = 0
    let skipped = 0

    for (const pub of publications as ParsedPublication[]) {
      // Final duplicate check before inserting
      const dupes = await findDuplicates({
        title: pub.title,
        doi: pub.doi,
        pubmedId: pub.pubmedId,
        year: pub.year,
      })

      if (dupes.length > 0) {
        skipped++
        continue
      }

      await prisma.publication.create({
        data: {
          title: pub.title,
          authors: pub.authors || "",
          year: pub.year || new Date().getFullYear(),
          journal: pub.journal || null,
          abstract: pub.abstract || null,
          doi: pub.doi || null,
          pubmedId: pub.pubmedId || null,
          arxivId: pub.arxivId || null,
          articleType: pub.articleType || "Journal Article",
          curationStatus: "PROVISIONAL",
          sourceCV: sourceFilename || null,
        },
      })
      imported++
    }

    return NextResponse.json({ imported, skipped })
  } catch (error) {
    console.error("Import publications error:", error)
    return NextResponse.json({ error: "Import failed" }, { status: 500 })
  }
}
