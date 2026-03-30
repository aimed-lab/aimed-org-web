import { NextResponse } from "next/server";

// Re-use the same scoring + search logic as the JSON endpoint
const SCORE_RULES: Array<{ weight: number; terms: RegExp }> = [
  { weight: 30, terms: /\b(drug.?discovery|drug.?repurpos|drug.?target|lead.?compound)\b/i },
  { weight: 25, terms: /\b(ai|artificial.?intelligence|machine.?learning|deep.?learning|llm|large.?language|neural.?network|transformer)\b/i },
  { weight: 20, terms: /\b(systems.?pharmacol|network.?pharmacol|systems.?biology|network.?biology|multi.?omics)\b/i },
  { weight: 15, terms: /\b(biomedical.?informatics|computational.?biology|bioinformatics)\b/i },
  { weight: 15, terms: /\b(precision.?medicine|personalized.?medicine|digital.?twin|clinical.?AI)\b/i },
  { weight: 12, terms: /\b(knowledge.?graph|knowledge.?network|ontology|pathway.?analysis)\b/i },
  { weight: 12, terms: /\b(protein.?interaction|interactome|proteomics|genomics|multi-omics)\b/i },
  { weight: 10, terms: /\b(alzheimer|neurodegenerat|parkinson|cancer|tumor|glioblastoma|leukemia)\b/i },
  { weight: 10, terms: /\b(cardiotoxicity|herg|ADMET|toxicity.?predict|QSAR|SMILES)\b/i },
  { weight: 8,  terms: /\b(generative.?AI|diffusion.?model|foundation.?model|graph.?neural)\b/i },
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

const SEARCHES = [
  { topic: "AI Drug Discovery", term: "artificial+intelligence+drug+discovery", retmax: 8 },
  { topic: "Biomedical Informatics AI", term: "machine+learning+biomedical+informatics+precision+medicine", retmax: 6 },
  { topic: "Systems Pharmacology", term: "systems+pharmacology+network+biology+drug+target", retmax: 6 },
  { topic: "Computational Drug Discovery", term: "computational+drug+discovery+deep+learning+molecular", retmax: 5 },
];

const BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const revalidate = 3600;

export async function GET() {
  const allItems: Array<{
    pmid: string; title: string; pubdate: string; journal: string;
    authors: string; link: string; doi: string | null; topic: string; score: number;
  }> = [];
  const seenPmids = new Set<string>();

  await Promise.all(
    SEARCHES.map(async ({ topic, term, retmax }) => {
      try {
        const searchRes = await fetch(
          `${BASE}/esearch.fcgi?db=pubmed&term=${term}&retmax=${retmax}&retmode=json&sort=pub+date`,
          { next: { revalidate: 3600 } }
        );
        if (!searchRes.ok) return;
        const searchData = await searchRes.json();
        const ids: string[] = searchData?.esearchresult?.idlist ?? [];
        if (!ids.length) return;

        const sumRes = await fetch(
          `${BASE}/esummary.fcgi?db=pubmed&id=${ids.join(",")}&retmode=json`,
          { next: { revalidate: 3600 } }
        );
        if (!sumRes.ok) return;
        const sumData = await sumRes.json();
        const result = sumData?.result ?? {};
        const uids: string[] = result.uids ?? [];

        for (const uid of uids) {
          if (seenPmids.has(uid)) continue;
          seenPmids.add(uid);
          const s = result[uid];
          const doi = s.articleids?.find((a: { idtype: string; value: string }) => a.idtype === "doi")?.value ?? null;
          const authors = s.authors?.slice(0, 3).map((a: { name: string }) => a.name).join(", ") +
            (s.authors?.length > 3 ? ", et al." : "");
          const title = s.title?.replace(/\.$/, "") ?? "(Untitled)";
          const journal = s.source ?? "";
          allItems.push({ pmid: uid, title, pubdate: s.pubdate ?? "", journal, authors,
            link: `https://pubmed.ncbi.nlm.nih.gov/${uid}/`, doi, topic,
            score: scoreRelevance(title, journal) });
        }
      } catch { /* skip */ }
    })
  );

  allItems.sort((a, b) => b.score !== a.score ? b.score - a.score :
    new Date(b.pubdate).getTime() - new Date(a.pubdate).getTime());

  const top = allItems.filter((item) => item.score >= 30).slice(0, 20);
  const now = new Date().toUTCString();

  const items = top.map((item) => `
  <item>
    <title>${escapeXml(item.title)}</title>
    <link>${escapeXml(item.link)}</link>
    <guid isPermaLink="true">${escapeXml(item.link)}</guid>
    <pubDate>${item.pubdate ? new Date(item.pubdate).toUTCString() : now}</pubDate>
    <category>${escapeXml(item.topic)}</category>
    <description>${escapeXml(
      `[Relevance: ${item.score}/100] ${item.authors} — ${item.journal}${item.doi ? ` — DOI: ${item.doi}` : ""}`
    )}</description>
    ${item.doi ? `<link>https://doi.org/${escapeXml(item.doi)}</link>` : ""}
  </item>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI.MED Lab — Research News Feed</title>
    <link>https://aimed-lab.org/news</link>
    <description>Latest publications in AI-driven drug discovery and biomedical informatics, ranked by relevance to the AI.MED Lab at UAB.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://aimed-lab.org/api/research-news/feed" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
