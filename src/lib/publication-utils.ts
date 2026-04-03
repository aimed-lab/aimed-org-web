import { prisma } from "@/lib/db"

/**
 * Normalize a publication title for duplicate comparison.
 * Strips punctuation, extra whitespace, lowercases.
 */
export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

interface ParsedPub {
  title: string
  doi?: string | null
  pubmedId?: string | null
  year?: number | null
}

interface DuplicateResult {
  id: number
  title: string
  matchType: "doi" | "pubmed" | "title"
}

/**
 * Find potential duplicate publications in the database.
 * Checks by DOI (exact), PubMed ID (exact), then normalized title + year.
 */
export async function findDuplicates(pub: ParsedPub): Promise<DuplicateResult[]> {
  const results: DuplicateResult[] = []

  // 1. Check by DOI
  if (pub.doi) {
    const match = await prisma.publication.findFirst({
      where: { doi: pub.doi },
      select: { id: true, title: true },
    })
    if (match) {
      results.push({ id: match.id, title: match.title, matchType: "doi" })
      return results // DOI is definitive
    }
  }

  // 2. Check by PubMed ID
  if (pub.pubmedId) {
    const match = await prisma.publication.findFirst({
      where: { pubmedId: pub.pubmedId },
      select: { id: true, title: true },
    })
    if (match) {
      results.push({ id: match.id, title: match.title, matchType: "pubmed" })
      return results
    }
  }

  // 3. Check by normalized title (+ year if available)
  const normalized = normalizeTitle(pub.title)
  if (normalized.length < 10) return results // too short to reliably match

  // Get candidates from same year (or all if no year)
  const where: Record<string, unknown> = {}
  if (pub.year) where.year = pub.year

  const candidates = await prisma.publication.findMany({
    where,
    select: { id: true, title: true },
  })

  for (const c of candidates) {
    if (normalizeTitle(c.title) === normalized) {
      results.push({ id: c.id, title: c.title, matchType: "title" })
    }
  }

  return results
}
