import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// ── Rate limiting ──────────────────────────────────────────────────────────
const RATE_WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // max 10 messages per minute per IP
const BLOCK_DURATION_MS = 5 * 60_000; // block for 5 minutes if exceeded

const ipRequests = new Map<string, { count: number; windowStart: number }>();
const blockedIps = new Map<string, number>(); // IP → unblock time

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Check if blocked
  const unblockAt = blockedIps.get(ip);
  if (unblockAt) {
    if (now < unblockAt) {
      return { allowed: false, retryAfter: Math.ceil((unblockAt - now) / 1000) };
    }
    blockedIps.delete(ip);
  }

  // Check rate window
  const entry = ipRequests.get(ip);
  if (!entry || now - entry.windowStart > RATE_WINDOW_MS) {
    ipRequests.set(ip, { count: 1, windowStart: now });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > MAX_REQUESTS_PER_WINDOW) {
    blockedIps.set(ip, now + BLOCK_DURATION_MS);
    ipRequests.delete(ip);
    return { allowed: false, retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000) };
  }

  return { allowed: true };
}

const SYSTEM_PROMPT = `You are the AI.MED Lab website assistant at the University of Alabama at Birmingham (UAB).

ABOUT THE LAB:
- Led by Prof. Jake Y. Chen, Triton Endowed Professor of Biomedical Informatics and Data Science
- Prof. Chen is the founding director of the Systems Pharmacology AI Research Center (SPARC)
- Previously served as Chief Bioinformatics Officer and Associate Director of the UAB Informatics Institute
- Fellow of ACMI, AIMBE, AMIA; ACM Distinguished Member; "Top 100 AI Leaders in Drug Discovery" (2019)
- 200+ publications, 200+ invited talks, >$100M in grants over 25+ years
- Contact MPI for CONNECT, an NIH U54 national AI-infrastructure initiative (2024-2029)

CURRENT LAB MEMBERS:
- Huu Phong Nguyen, PhD — Postdoctoral Fellow
- Fuad Al Abir — PhD Student, Biomedical Informatics & Data Science
- Delower Hossain — PhD Student, Computer Science
- John Haoyuan Cheng — Research Staff
- Nikhil Kurmachalam — Research Staff
- Geetanjali Oishe — PhD Student

RESEARCH AREAS:
AI-driven drug discovery, systems pharmacology, multi-omics AI, precision medicine, knowledge networks (PAGER, BEERE), network biology, digital twin simulations, biomedical data science, computational drug repurposing

SOFTWARE TOOLS:
PAGER (pathway/gene-set enrichment), BEERE (biomedical entity exploration), WINNER (network biology), HAPPI (protein interactions), DEMA (network visualization), GeneTerrain (gene expression visualization)

CONTACT: jakechen@uab.edu | Website: aimed-lab.org | Join page: aimed-lab.org/join

RULES:
1. Only share PUBLIC information. Never reveal unpublished work, internal plans, or confidential data.
2. When publications are provided in context, cite them accurately with DOI/PubMed links.
3. Keep answers concise and helpful. Use bullet points for lists.
4. If you don't know something, say so and suggest visiting the website or contacting the lab.
5. For publication queries, use the search results provided in context.
6. Format links as markdown: [text](url)`;

// Search publications with flexible matching
async function searchPublications(query: string) {
  const words = query
    .toLowerCase()
    .replace(/['']/g, "") // strip possessives
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  if (words.length === 0) return [];

  // Try AND match first
  const andConditions = words.map((word) => ({
    OR: [
      { title: { contains: word } },
      { authors: { contains: word } },
      { journal: { contains: word } },
    ],
  }));

  let pubs = await prisma.publication.findMany({
    where: { AND: andConditions },
    take: 8,
    orderBy: { year: "desc" },
  });

  // Fall back to first significant keyword
  if (pubs.length === 0 && words.length > 0) {
    pubs = await prisma.publication.findMany({
      where: {
        OR: [
          { title: { contains: words[0] } },
          { authors: { contains: words[0] } },
        ],
      },
      take: 8,
      orderBy: { year: "desc" },
    });
  }

  return pubs;
}

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "so", "than", "too", "very", "just",
  "because", "but", "and", "or", "if", "while", "about", "what", "which",
  "who", "whom", "this", "that", "these", "those", "am", "its", "his",
  "her", "their", "our", "my", "your", "me", "him", "them", "us", "you",
  "she", "he", "it", "we", "they",
  "find", "search", "show", "list", "tell", "give", "paper", "papers",
  "publication", "publications", "article", "articles", "published",
  "written", "authored", "any", "recent", "latest", "new",
]);

// Extract search-worthy terms from any message
function extractSearchTerms(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    .join(" ");
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ?? "unknown";
  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { reply: `Too many requests. Please try again in ${rateCheck.retryAfter} seconds.` },
      { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter ?? 300) } }
    );
  }

  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ reply: "How can I help you today?" });
    }

    const userText = lastMessage.content.trim();

    // Search for relevant publications to include as context
    const searchTerms = extractSearchTerms(userText);
    const pubs = searchTerms ? await searchPublications(searchTerms) : [];

    let pubContext = "";
    if (pubs.length > 0) {
      pubContext = "\n\nRELEVANT PUBLICATIONS FROM DATABASE:\n" +
        pubs.map((p) => {
          const links: string[] = [];
          if (p.doi) links.push(`DOI: https://doi.org/${p.doi}`);
          if (p.pubmedId) links.push(`PubMed: https://pubmed.ncbi.nlm.nih.gov/${p.pubmedId}`);
          if (p.arxivId) links.push(`arXiv: https://arxiv.org/abs/${p.arxivId}`);
          return `- "${p.title}" (${p.year}, ${p.journal ?? "N/A"}) by ${p.authors}. ${links.join(", ")}`;
        }).join("\n");
    }

    // If no Gemini API key, use a simple fallback
    if (!GEMINI_API_KEY) {
      return handleFallback(userText, pubs);
    }

    // Build Gemini request
    const geminiMessages = [
      ...messages.slice(-6).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
    ];

    // Inject system prompt + publication context into the first user message
    if (geminiMessages.length > 0 && geminiMessages[geminiMessages.length - 1].role === "user") {
      const lastParts = geminiMessages[geminiMessages.length - 1].parts;
      lastParts[0].text = lastParts[0].text + pubContext;
    }

    const body = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800,
      },
    };

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!geminiRes.ok) {
      console.error("Gemini API error:", geminiRes.status, await geminiRes.text());
      return handleFallback(userText, pubs);
    }

    const geminiData = await geminiRes.json();
    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ??
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { reply: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// Fallback when no Gemini API key is configured
function handleFallback(
  userText: string,
  pubs: Awaited<ReturnType<typeof searchPublications>>
) {
  if (pubs.length > 0) {
    const lines = pubs.slice(0, 5).map((p) => {
      const links: string[] = [];
      if (p.doi) links.push(`[DOI](https://doi.org/${p.doi})`);
      if (p.pubmedId) links.push(`[PubMed](https://pubmed.ncbi.nlm.nih.gov/${p.pubmedId})`);
      if (p.arxivId) links.push(`[arXiv](https://arxiv.org/abs/${p.arxivId})`);
      links.push(`[Scholar](https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)})`);
      return `• **${p.title}** (${p.year}, ${p.journal ?? ""})\n  ${p.authors}\n  ${links.join(" · ")}`;
    });
    return NextResponse.json({
      reply: `Found ${pubs.length} publication(s):\n\n${lines.join("\n\n")}\n\nVisit [Publications](/publications) for the complete list.`,
    });
  }

  const lower = userText.toLowerCase();
  if (/about|lab|ai\.?med/i.test(lower)) {
    return NextResponse.json({
      reply: "AI.MED Lab is led by Prof. Jake Y. Chen at UAB. The lab advances AI-driven biomedical informatics, network/systems biology, and computational drug discovery. Visit [aimed-lab.org](/) for more details.",
    });
  }
  if (/contact|email|join|apply/i.test(lower)) {
    return NextResponse.json({
      reply: "Contact Prof. Chen at jakechen@uab.edu or visit the [Join page](/join) to submit an inquiry.",
    });
  }
  if (/software|tool/i.test(lower)) {
    return NextResponse.json({
      reply: "Key tools: PAGER, BEERE, WINNER, HAPPI, DEMA, GeneTerrain. Visit [Software](/software) for details.",
    });
  }

  return NextResponse.json({
    reply: `I can help with questions about the AI.MED Lab. Try asking about:\n• **Publications** — "Find papers by Delower"\n• **Research** — "What does the lab study?"\n• **Software** — "What tools does the lab build?"\n• **Contact** — "How to join the lab?"`,
  });
}
