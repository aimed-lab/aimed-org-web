import { NextResponse } from "next/server";

export const revalidate = 3600; // Cache for 1 hour

interface PubMedSummary {
  uid: string;
  title: string;
  pubdate: string;
  source: string;
  authors: Array<{ name: string }>;
  doi?: string;
  articleids?: Array<{ idtype: string; value: string }>;
}

interface ResearchNewsItem {
  pmid: string;
  title: string;
  pubdate: string;
  journal: string;
  authors: string;
  link: string;
  doi: string | null;
  topic: string;
}

const SEARCHES = [
  {
    topic: "AI Drug Discovery",
    term: "artificial+intelligence+drug+discovery",
    retmax: 6,
  },
  {
    topic: "Biomedical Informatics AI",
    term: "machine+learning+biomedical+informatics+precision+medicine",
    retmax: 5,
  },
  {
    topic: "Systems Pharmacology",
    term: "systems+pharmacology+network+biology+drug+target",
    retmax: 4,
  },
];

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

async function searchPubMed(term: string, retmax: number): Promise<string[]> {
  const url = `${BASE}/esearch.fcgi?db=pubmed&term=${term}&retmax=${retmax}&retmode=json&sort=pub+date`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return data?.esearchresult?.idlist ?? [];
}

async function fetchSummaries(ids: string[]): Promise<PubMedSummary[]> {
  if (ids.length === 0) return [];
  const url = `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
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
          allItems.push({
            pmid: s.uid,
            title: s.title?.replace(/\.$/, "") ?? "(Untitled)",
            pubdate: s.pubdate ?? "",
            journal: s.source ?? "",
            authors,
            link: `https://pubmed.ncbi.nlm.nih.gov/${s.uid}/`,
            doi,
            topic,
          });
        }
      } catch {
        // Skip failed searches silently
      }
    })
  );

  // Sort by pubdate descending (newest first)
  allItems.sort((a, b) => {
    const da = a.pubdate ? new Date(a.pubdate).getTime() : 0;
    const db = b.pubdate ? new Date(b.pubdate).getTime() : 0;
    return db - da;
  });

  return NextResponse.json(allItems.slice(0, 15));
}
