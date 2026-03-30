import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// Public-only lab knowledge — never reveal unpublished work
const LAB_INFO: Record<string, string> = {
  about: `AI.MED Lab is led by Prof. Jake Y. Chen, Triton Endowed Professor of Biomedical Informatics and Data Science at the UAB School of Medicine. The lab advances AI-driven biomedical informatics, network/systems biology, and computational drug discovery.`,
  director: `Prof. Jake Y. Chen is the founding director of the Systems Pharmacology AI Research Center (SPARC). He has 200+ publications, 200+ invited talks, and >$100M in grants. He is a Fellow of ACMI, AIMBE, and AMIA, an ACM Distinguished Member, and was named among the "Top 100 AI Leaders in Drug Discovery" (2019).`,
  research: `The lab's research spans: AI-driven drug discovery, systems pharmacology, multi-omics AI frameworks, precision medicine, knowledge networks (PAGER, BEERE), network biology, digital twin simulations, and biomedical data science. Key tools include PAGER, BEERE, WINNER, HAPPI, DEMA, and GeneTerrain.`,
  contact: `Email: jakechen@uab.edu. Visit the Join page at aimed-lab.org/join to submit an inquiry or collaboration request.`,
  location: `The AI.MED Lab is at the University of Alabama at Birmingham (UAB), Department of Biomedical Informatics and Data Science.`,
  join: `To join or collaborate, visit aimed-lab.org/join and fill out the inquiry form. We welcome postdocs, PhD students, and research staff.`,
  software: `Key tools: PAGER (pathway/gene-set enrichment), BEERE (biomedical entity exploration), WINNER (network biology), HAPPI (protein interactions), DEMA (network visualization), GeneTerrain (gene expression visualization). Visit aimed-lab.org/software.`,
};

async function searchPublications(query: string) {
  const pubs = await prisma.publication.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { authors: { contains: query } },
        { journal: { contains: query } },
        { tags: { contains: query } },
      ],
    },
    take: 5,
    orderBy: { year: "desc" },
  });
  return pubs;
}

function detectIntent(message: string): {
  type: string;
  query: string;
} {
  const lower = message.toLowerCase();

  // Publication/paper search
  if (
    /paper|publication|article|research on|published|pubmed|doi|cite/i.test(lower)
  ) {
    const cleaned = lower
      .replace(
        /\b(find|search|show|list|any|papers?|publications?|articles?|about|on|related to|by|regarding)\b/g,
        ""
      )
      .trim();
    return { type: "publication", query: cleaned || lower };
  }

  // Software/tools
  if (/software|tool|database|pager|beere|winner|happi|dema|geneterrain/i.test(lower))
    return { type: "info", query: "software" };

  // Contact/join
  if (/contact|email|reach|join|collaborate|apply|postdoc|phd|position/i.test(lower))
    return { type: "info", query: lower.includes("join") || lower.includes("apply") || lower.includes("position") ? "join" : "contact" };

  // About the lab
  if (/\blab\b|ai\.?med|about|what do you|what does|overview/i.test(lower))
    return { type: "info", query: "about" };

  // Director/PI
  if (/jake|chen|director|pi|professor|who leads|who runs/i.test(lower))
    return { type: "info", query: "director" };

  // Research areas
  if (/research|area|focus|drug discovery|pharmacol|precision medicine|network biology/i.test(lower))
    return { type: "info", query: "research" };

  // Location
  if (/where|location|address|uab|birmingham/i.test(lower))
    return { type: "info", query: "location" };

  // Drug discovery specific
  if (/drug|compound|target|admet|toxicity|repurpos/i.test(lower))
    return { type: "publication", query: lower };

  // Cancer, Alzheimer, etc
  if (/cancer|alzheimer|glioblastoma|leukemia|parkinson|disease/i.test(lower))
    return { type: "publication", query: lower };

  // Default: try publication search
  return { type: "general", query: lower };
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== "user") {
      return NextResponse.json({ reply: "I didn't receive a message. How can I help you?" });
    }

    const userText = lastMessage.content.trim();
    if (!userText) {
      return NextResponse.json({ reply: "Please type your question about the AI.MED Lab." });
    }

    const intent = detectIntent(userText);

    // Info queries
    if (intent.type === "info") {
      const info = LAB_INFO[intent.query] ?? LAB_INFO.about;
      return NextResponse.json({ reply: info });
    }

    // Publication search
    if (intent.type === "publication") {
      const keywords = intent.query
        .split(/\s+/)
        .filter((w) => w.length > 2)
        .slice(0, 3);

      let pubs: Awaited<ReturnType<typeof searchPublications>> = [];
      for (const kw of keywords) {
        const results = await searchPublications(kw);
        pubs.push(...results);
      }

      // Deduplicate
      const seen = new Set<number>();
      pubs = pubs.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      if (pubs.length === 0) {
        return NextResponse.json({
          reply: `I couldn't find publications matching "${intent.query}". Try broader terms like "drug discovery", "cancer", "AI", "network biology", or visit our Publications page at aimed-lab.org/publications for the full list.`,
        });
      }

      const lines = pubs.slice(0, 5).map((p) => {
        const links: string[] = [];
        if (p.doi) links.push(`[DOI](https://doi.org/${p.doi})`);
        if (p.pubmedId) links.push(`[PubMed](https://pubmed.ncbi.nlm.nih.gov/${p.pubmedId})`);
        if (p.arxivId) links.push(`[arXiv](https://arxiv.org/abs/${p.arxivId})`);
        links.push(
          `[Scholar](https://scholar.google.com/scholar?q=${encodeURIComponent(p.title)})`
        );
        return `• **${p.title}** (${p.year}, ${p.journal ?? ""})\n  ${p.authors}\n  ${links.join(" · ")}`;
      });

      return NextResponse.json({
        reply: `Found ${pubs.length} publication(s):\n\n${lines.join("\n\n")}\n\nVisit [Publications](/publications) for the complete list.`,
      });
    }

    // General/fallback
    return NextResponse.json({
      reply: `I can help with questions about the AI.MED Lab. Try asking about:\n\n• **Publications** — "Find papers on drug discovery"\n• **Research areas** — "What research does the lab do?"\n• **Software/tools** — "What tools has the lab built?"\n• **Contact/Join** — "How to join the lab?"\n• **About** — "Tell me about AI.MED Lab"\n\nFor detailed research inquiries, visit [Join](/join) to contact us directly.`,
    });
  } catch {
    return NextResponse.json(
      { reply: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
