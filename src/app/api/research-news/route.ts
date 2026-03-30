import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Always fetch fresh from PubMed

interface PubMedSummary {
  uid: string;
  title: string;
  pubdate: string;
  source: string;
  authors: Array<{ name: string }>;
  doi?: string;
  articleids?: Array<{ idtype: string; value: string }>;
}

export interface ResearchNewsItem {
  pmid: string;
  title: string;
  pubdate: string;
  journal: string;
  authors: string;
  link: string;
  doi: string | null;
  topic: string;
  score: number; // 0–100 relevance to AI.MED lab focus
}

// ── Relevance scoring ──────────────────────────────────────────────────────
// Weighted keyword groups aligned to AI.MED lab research areas
const SCORE_RULES: Array<{ weight: number; terms: RegExp }> = [
  // Core focus — highest weight
  { weight: 30, terms: /\b(drug.?discovery|drug.?repurpos|drug.?target|lead.?compound)\b/i },
  { weight: 25, terms: /\b(ai|artificial.?intelligence|machine.?learning|deep.?learning|llm|large.?language|neural.?network|transformer)\b/i },
  { weight: 20, terms: /\b(systems.?pharmacol|network.?pharmacol|systems.?biology|network.?biology|multi.?omics)\b/i },
  // Strong secondary
  { weight: 15, terms: /\b(biomedical.?informatics|computational.?biology|bioinformatics)\b/i },
  { weight: 15, terms: /\b(precision.?medicine|personalized.?medicine|digital.?twin|clinical.?AI)\b/i },
  { weight: 12, terms: /\b(knowledge.?graph|knowledge.?network|ontology|pathway.?analysis)\b/i },
  { weight: 12, terms: /\b(protein.?interaction|interactome|proteomics|genomics|multi-omics)\b/i },
  // Disease areas the lab works on
  { weight: 10, terms: /\b(alzheimer|neurodegenerat|parkinson|cancer|tumor|glioblastoma|leukemia)\b/i },
  { weight: 10, terms: /\b(cardiotoxicity|herg|ADMET|toxicity.?predict|QSAR|SMILES)\b/i },
  { weight: 8,  terms: /\b(generative.?AI|diffusion.?model|foundation.?model|graph.?neural)\b/i },
  // Weak signals — broad but relevant
  { weight: 5,  terms: /\b(biomarker|omics|transcriptom|single.?cell|RNA.?seq)\b/i },
  { weight: 5,  terms: /\b(clinical.?trial|electronic.?health|EHR|real.?world.?data)\b/i },
];

function scoreRelevance(title: string, journal: string): number {
  const text = `${title} ${journal}`;
  let total = 0;
  for (const { weight, terms } of SCORE_RULES) {
    if (terms.test(text)) total += weight;
  }
  return Math.min(100, total);
}

// ── PubMed search queries ───────────────────────────────────────────────────
const SEARCHES = [
  {
    topic: "AI Drug Discovery",
    term: "artificial+intelligence+drug+discovery",
    retmax: 8,
  },
  {
    topic: "Biomedical Informatics AI",
    term: "machine+learning+biomedical+informatics+precision+medicine",
    retmax: 6,
  },
  {
    topic: "Systems Pharmacology",
    term: "systems+pharmacology+network+biology+drug+target",
    retmax: 6,
  },
  {
    topic: "Computational Drug Discovery",
    term: "computational+drug+discovery+deep+learning+molecular",
    retmax: 5,
  },
];

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

async function searchPubMed(term: string, retmax: number): Promise<string[]> {
  const url = `${BASE}/esearch.fcgi?db=pubmed&term=${term}&retmax=${retmax}&retmode=json&sort=pub+date`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.esearchresult?.idlist ?? [];
}

async function fetchSummaries(ids: string[]): Promise<PubMedSummary[]> {
  if (ids.length === 0) return [];
  const url = `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const result = data?.result ?? {};
  const uids: string[] = result.uids ?? [];
  return uids.map((uid) => ({ uid, ...result[uid] }));
}

export async function GET() {
  const allItems: ResearchNewsItem[] = [];
  const seenPmids = new Set<string>();

  await Promise.all(
    SEARCHES.map(async ({ topic, term, retmax }) => {
      try {
        const ids = await searchPubMed(term, retmax);
        const summaries = await fetchSummaries(ids);
        for (const s of summaries) {
          if (seenPmids.has(s.uid)) continue;
          seenPmids.add(s.uid);
          const doi =
            s.articleids?.find((a) => a.idtype === "doi")?.value ?? null;
          const authors =
            s.authors
              ?.slice(0, 3)
              .map((a) => a.name)
              .join(", ") + (s.authors?.length > 3 ? ", et al." : "");
          const title = s.title?.replace(/\.$/, "") ?? "(Untitled)";
          const journal = s.source ?? "";
          allItems.push({
            pmid: s.uid,
            title,
            pubdate: s.pubdate ?? "",
            journal,
            authors,
            link: `https://pubmed.ncbi.nlm.nih.gov/${s.uid}/`,
            doi,
            topic,
            score: scoreRelevance(title, journal),
          });
        }
      } catch {
        // Skip failed searches silently
      }
    })
  );

  // Sort by score descending, then by date
  allItems.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const da = a.pubdate ? new Date(a.pubdate).getTime() : 0;
    const db = b.pubdate ? new Date(b.pubdate).getTime() : 0;
    return db - da;
  });

  const filtered = allItems.filter((item) => item.score >= 30);
  return NextResponse.json(filtered.slice(0, 20));
}
