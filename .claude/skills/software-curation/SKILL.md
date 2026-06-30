---
name: software-curation
description: >-
  Validate and repair the Software & Resources page links for aimed-org-web: check
  each tool's website/GitHub, map tools to PUBLIC github.com/aimed-lab repos, attach
  the correct paper (DOI/PubMed), and hide tools with no working link. All curation
  is stored in data/SoftwareResource.tsv so it survives CV re-imports. Use when the
  user reports broken links on /software, asks to fix tool links, or to re-validate
  after repos change visibility. Triggers: "software links are broken", "fix the
  software page", "map the aimed-lab repos", "validate the tool links".
---

# Software curation — fix /software links, repos, and papers

The legacy host `discovery.informatics.uab.edu` (and `bio.informatics.uab.edu`) is
**down**, so most tools' original "Website" links are dead. Curation maps each tool to
a working link (a PUBLIC `aimed-lab` repo or a live site) and the correct paper, and
hides tools that have neither. **This data is the curated source of truth — `cv-sync`
must never overwrite `data/SoftwareResource.tsv`.**

## Rules
1. A tool is **visible only if** it has a working website OR a **public** GitHub repo.
   A PRIVATE repo 404s for visitors → does NOT count; hide the tool (or ask the user to
   make the repo public).
2. The `/software` page filters to tools with a non-empty `url` or `githubUrl`
   (`src/app/software/page.tsx`, the `linked` filter) and the hero count derives from
   that set. So "hiding" = clearing both `url` and `githubUrl` in the TSV.
3. Paper links: store `relatedPapers` as a JSON array `[{doi,title,pubmedId?}]`. Pull
   the correct DOI from `data/Publication.tsv` (authoritative) or PubMed — do NOT trust
   pre-existing DOIs, several were wrong.
4. Persist everything in `data/SoftwareResource.tsv` (raw tab-joined, NOT csv-quoted —
   the rebuild parser is naive; quoting JSON breaks it). Commit to `dev`.

## Steps
1. **Validate current links** — for each row in SoftwareResource, curl the `url` and
   `githubUrl` (`curl -sL -o /dev/null -w "%{http_code}" --max-time 8 <url>`; 2xx/3xx
   = ok, `000` = unreachable). `scripts/validate-links.mjs` exists for this too.
2. **List org repos + visibility**:
   `gh repo list aimed-lab --limit 200 --json name,visibility,url`
   Map tools to repos by name (e.g. PAGER→PAGER-Web-APP, PGC→Polar-Gini-Curve,
   GeneTerrain→GeneTerrain-Web-APP). Use **PUBLIC** repos only.
3. **Find correct papers** — grep `data/Publication.tsv` for the tool's paper title to
   get its DOI; for tools whose paper has no DOI in the TSV, look it up on PubMed
   (search_articles → get_article_metadata) and cite it.
4. **Write the TSV** with a Python script: read rows with `csv.reader(delimiter='\t')`,
   set `url`/`githubUrl`/`relatedPapers` per tool, clear both for hidden tools, then
   write back with `'\n'.join('\t'.join(r) for r in rows)` (raw, no quoting). Assert no
   field contains a tab/newline.
5. **Rebuild + restart + verify**: `node scripts/rebuild-db.mjs`; restart the dev
   server (Prisma holds the old DB handle); check `/api/software` returns the expected
   visible count and zero `informatics.uab.edu` links remain.
6. **Commit to `dev`** (data + page filter only).

## Current mapping (as of July 2026) — 10 visible, 9 hidden
Visible (public repo or live site): GeneTerrain (GeneTerrain-Web-APP), HIP2, PAGER
(PAGER-Web-APP), PGC (Polar-Gini-Curve), ProteoLens, SEAS, WINNER, WIPER, Mondrian Map
(mondrian-map), Talent Knowledge Map (cm4aikg.vercel.app — talentkg repo is private).
Hidden — dead host + **private** repo: BEERE, HAPPI, HOMER, PAGER-CoV (making these
repos public restores them). Hidden — dead host + **no** repo: C2-Maps, HPD, PAGED,
PEPPI, SpatialRSP.
