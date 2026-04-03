import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"

// --- PubMed ---

interface PubMedSearchResult {
  esearchresult?: { idlist?: string[] }
}

interface PubMedSummaryResult {
  result?: Record<string, {
    uid?: string
    title?: string
    authors?: Array<{ name?: string }>
    fulljournalname?: string
    source?: string
    pubdate?: string
  }>
}

async function checkPubMed(query: string) {
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=10&sort=date&term=${encodeURIComponent(query)}`
  const searchRes = await fetch(searchUrl)
  if (!searchRes.ok) throw new Error(`PubMed search failed: ${searchRes.status}`)

  const searchData: PubMedSearchResult = await searchRes.json()
  const ids = searchData.esearchresult?.idlist || []
  if (ids.length === 0) return []

  const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&retmode=json&id=${ids.join(",")}`
  const summaryRes = await fetch(summaryUrl)
  if (!summaryRes.ok) throw new Error(`PubMed summary failed: ${summaryRes.status}`)

  const summaryData: PubMedSummaryResult = await summaryRes.json()
  const result = summaryData.result || {}

  return ids.map((pmid) => {
    const article = result[pmid]
    return {
      pmid,
      title: article?.title || "",
      authors: (article?.authors || []).map((a) => a.name || "").join(", "),
      journal: article?.fulljournalname || article?.source || "",
      pubDate: article?.pubdate || "",
    }
  })
}

// --- arXiv ---

function parseArXivXml(xml: string) {
  const entries: Array<{
    arxivId: string
    title: string
    authors: string
    published: string
    summary: string
  }> = []

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
  let entryMatch
  while ((entryMatch = entryRegex.exec(xml)) !== null) {
    const block = entryMatch[1]

    const idMatch = block.match(/<id>([\s\S]*?)<\/id>/)
    const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/)
    const publishedMatch = block.match(/<published>([\s\S]*?)<\/published>/)
    const summaryMatch = block.match(/<summary>([\s\S]*?)<\/summary>/)

    const authorNames: string[] = []
    const authorRegex = /<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g
    let authorMatch
    while ((authorMatch = authorRegex.exec(block)) !== null) {
      authorNames.push(authorMatch[1].trim())
    }

    const rawId = idMatch?.[1]?.trim() || ""
    const arxivId = rawId.replace("http://arxiv.org/abs/", "").replace("https://arxiv.org/abs/", "")

    entries.push({
      arxivId,
      title: (titleMatch?.[1] || "").replace(/\s+/g, " ").trim(),
      authors: authorNames.join(", "),
      published: publishedMatch?.[1]?.trim() || "",
      summary: (summaryMatch?.[1] || "").replace(/\s+/g, " ").trim(),
    })
  }

  return entries
}

async function checkArXiv(query: string) {
  const url = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10&sortBy=submittedDate&sortOrder=descending`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`arXiv API failed: ${res.status}`)

  const xml = await res.text()
  return parseArXivXml(xml)
}

// --- GitHub ---

interface GitHubCommit {
  sha?: string
  commit?: { message?: string; author?: { date?: string } }
  html_url?: string
}

interface GitHubRepo {
  name?: string
  description?: string
  html_url?: string
  updated_at?: string
}

interface GitHubSearchResult {
  items?: GitHubRepo[]
}

async function checkGitHub(query: string) {
  const trimmed = query.trim()

  // Detect owner/repo patterns: "owner/repo" or full GitHub URLs
  const repoPattern = /^(?:https?:\/\/github\.com\/)?([^/\s]+\/[^/\s]+)\/?$/
  const repoMatch = trimmed.match(repoPattern)

  if (repoMatch) {
    const repoPath = repoMatch[1].replace(/\.git$/, "")
    const url = `https://api.github.com/repos/${repoPath}/commits?per_page=10`
    const res = await fetch(url, {
      headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "aimed-lab-watch" },
    })
    if (!res.ok) throw new Error(`GitHub API failed: ${res.status}`)

    const commits: GitHubCommit[] = await res.json()
    return commits.map((c) => ({
      name: (c.commit?.message || "").split("\n")[0].slice(0, 120),
      description: c.sha?.slice(0, 7) || "",
      url: c.html_url || "",
      updatedAt: c.commit?.author?.date || "",
    }))
  }

  // Search repositories
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(trimmed)}&sort=updated&per_page=10`
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json", "User-Agent": "aimed-lab-watch" },
  })
  if (!res.ok) throw new Error(`GitHub search failed: ${res.status}`)

  const data: GitHubSearchResult = await res.json()
  return (data.items || []).map((repo) => ({
    name: repo.name || "",
    description: repo.description || "",
    url: repo.html_url || "",
    updatedAt: repo.updated_at || "",
  }))
}

// --- Custom URL (RSS/Atom feed) ---

function parseRssFeed(xml: string) {
  const items: Array<{ title: string; link: string; published: string }> = []

  // Try RSS <item> elements
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let itemMatch
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const block = itemMatch[1]
    const title = block.match(/<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/)?.[1]?.trim() || ""
    const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim() || ""
    const pubDate =
      block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ||
      block.match(/<dc:date>([\s\S]*?)<\/dc:date>/)?.[1]?.trim() ||
      ""
    items.push({ title, link, published: pubDate })
  }

  // If no RSS items, try Atom <entry> elements
  if (items.length === 0) {
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g
    let entryMatch
    while ((entryMatch = entryRegex.exec(xml)) !== null) {
      const block = entryMatch[1]
      const title = block.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() || ""
      const link =
        block.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ||
        block.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() ||
        ""
      const published =
        block.match(/<published>([\s\S]*?)<\/published>/)?.[1]?.trim() ||
        block.match(/<updated>([\s\S]*?)<\/updated>/)?.[1]?.trim() ||
        ""
      items.push({ title, link, published })
    }
  }

  return items.slice(0, 10)
}

async function checkCustomUrl(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "aimed-lab-watch/1.0" },
  })
  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`)

  const text = await res.text()
  return parseRssFeed(text)
}

// --- Route handler ---

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  const { id } = await params
  const watchId = parseInt(id, 10)
  if (isNaN(watchId)) {
    return NextResponse.json({ error: "Invalid watch ID" }, { status: 400 })
  }

  try {
    const watch = await prisma.memberWatch.findUnique({ where: { id: watchId } })
    if (!watch || watch.memberId !== auth.memberId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    let results: unknown[]

    switch (watch.source) {
      case "PUBMED":
        results = await checkPubMed(watch.query)
        break

      case "ARXIV":
        results = await checkArXiv(watch.query)
        break

      case "GITHUB":
        results = await checkGitHub(watch.query)
        break

      case "SCHOLAR":
        return NextResponse.json(
          {
            error:
              "Google Scholar monitoring requires a premium API. Use PubMed or arXiv instead.",
          },
          { status: 501 }
        )

      case "CUSTOM_URL":
        results = await checkCustomUrl(watch.query)
        break

      default:
        return NextResponse.json(
          { error: `Unsupported source: ${watch.source}` },
          { status: 400 }
        )
    }

    // Update the watch record with check results
    await prisma.memberWatch.update({
      where: { id: watchId },
      data: {
        lastChecked: new Date(),
        resultCount: results.length,
      },
    })

    return NextResponse.json({
      watchId: watch.id,
      source: watch.source,
      query: watch.query,
      lastChecked: new Date().toISOString(),
      resultCount: results.length,
      results,
    })
  } catch (error) {
    console.error("Failed to check watch:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to check watch", details: message },
      { status: 500 }
    )
  }
}
