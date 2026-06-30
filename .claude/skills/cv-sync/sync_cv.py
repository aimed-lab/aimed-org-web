#!/usr/bin/env python3
"""
cv-sync: diff a CV (plain text, from `textutil -convert txt`) against the current
data/Publication.tsv and append ONLY the publications that aren't already present.

Usage (run from the repo root):
    python3 .claude/skills/cv-sync/sync_cv.py /tmp/cv_new.txt                 # dry-run report
    python3 .claude/skills/cv-sync/sync_cv.py /tmp/cv_new.txt --apply \
            --source "CV Jake Chen July 2026.docx"                            # append new rows

Never touches data/SoftwareResource.tsv (curated links). Append-only; assigns fresh
numeric IDs; sets curationStatus=VERIFIED. Re-run safe (dedup prevents duplicates).

Section detection is by header text, so it tolerates line-number drift between CV
versions. Title/venue are split at the first sentence boundary; DOIs/arXiv IDs are
extracted when present. Review the dry-run before --apply.
"""
import re, sys, csv, json, argparse, datetime

PUB_TSV = "data/Publication.tsv"

# CV section header (regex, matched on a stripped line) -> articleType
SECTIONS = [
    (r"^Refereed\s*[–-]\s*Journal Articles", "Journal Article"),
    (r"^Refereed\s*[–-]\s*Conference or Workshop Proceedings", "Conference"),
    (r"^Books$", "Book"),
    (r"^Refereed\s*[–-]\s*Book Chapters", "Book Chapter"),
    (r"^Editorial Articles", "Editorial"),
    (r"^Edited Conference Proceedings", "Edited Volume"),
]
# Any header that ends a section (the next section, or these hard stops)
STOP = re.compile(r"^(Refereed|Books$|Editorial Articles|Edited Conference|Non-Refereed|SOFTWARE AND PATENTS|INVITED TALKS|HONORS)", re.I)


# Topic vocabulary used by the /publications "By Topic" filter (allTopics in
# src/app/publications/page.tsx). The API matches `tags contains <topic>`, so every
# publication needs ≥1 of these in its tags or it won't sort into any topic.
TOPIC_KEYWORDS = [
    ("Drug Discovery", r"drug|inhibitor|antibod|antigen|\bBRD4\b|\bRIPK3\b|hERG|conjugate|\bADC\b|ligand|pharmac|compound|cardiotox|de novo|target(ing|ed)?|synthesis|arsenical|affinity"),
    ("AI/ML", r"\bAI\b|A\.I\.|artificial intelligence|\bagent|\bLLM|large language model|generative|deep learning|machine learning|neural|diffusion|foundation[- ]model|neuro-symbolic|reasoning|\bGPT|llama|embedding"),
    ("Bioinformatics", r"bioinformatic|gene[- ]set|gene[- ]signature|pathway|genomic|data mining|BIOKDD|computational biolog|sequence|enrichment|ranking|classification|annotat|networks?\b|in silico"),
    ("Systems Biology", r"systems biolog|interactome|signaling|regulatory|multi-?scale network|network biolog|network simulation|protein-protein|gene regulat"),
    ("Knowledge Networks", r"knowledge graph|knowledge network|talent knowledge|teaming|ontolog|semantic|super gene set"),
    ("Multi-omics", r"multi-?omic|proteomic|transcriptom|single-?cell|spatial|\bomics|metabolom|genomics"),
    ("Precision Medicine", r"precision medicine|clinical|diagnos|biomarker|\bEHR\b|health record|digital twin|personalized|diabet|glucose|COVID|epidemic|outbreak|real-world"),
    ("Cancer", r"cancer|tumou?r|oncolog|glioma|glioblastoma|leukemia|melanoma|carcinoma|metasta"),
    ("Neurodegenerative Diseases", r"alzheimer|neurodegener|neuron|parkinson|cognitive|\bbrain\b|emotional"),
    ("Immunology", r"immun|antibod|antigen|inflammat|vaccine|\bT cell"),
    ("Visualization", r"visuali|graph visualization|geneterrain|terrain|rendering|interactive graph|mondrian"),
]
_TOPIC_RX = [(t, re.compile(p, re.I)) for t, p in TOPIC_KEYWORDS]


def classify_topics(title, journal):
    """Assign 1–4 topics from the vocabulary by keyword match on title+journal.
    Falls back to Bioinformatics so every publication sorts into at least one topic."""
    text = (title or "") + " " + (journal or "")
    tags = [t for t, rx in _TOPIC_RX if rx.search(text)]
    return (tags or ["Bioinformatics"])[:4]


def norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def _is_header(s):
    return next((t for pat, t in SECTIONS if re.search(pat, s, re.I)), None)


def split_sections(lines):
    """Yield (articleType, [entry_lines]) by scanning header text.
    A section runs from its header until the next known section header or a hard stop."""
    i, n = 0, len(lines)
    while i < n:
        atype = _is_header(lines[i].strip())
        if not atype:
            i += 1
            continue
        entries = []
        j = i + 1
        while j < n:
            s = lines[j].strip()
            if s and (_is_header(s) or STOP.search(s)):
                break
            if s:
                entries.append(s)
            j += 1
        yield atype, entries
        i = j


def parse_entry(line, atype):
    m = re.search(r"\((\d{4})\)", line)
    if not m:
        return None
    year = m.group(1)
    authors = line[: m.start()].strip().rstrip(",").strip()
    authors = re.sub(r",?\s*ed\.?$", "", authors).strip().rstrip(",").rstrip(".").strip().replace("*", "")
    after = line[m.end():].strip().lstrip(".").strip()
    parts = re.split(r'(?<=[a-z0-9\)"”])\.\s+(?=[A-Z])', after, maxsplit=1)
    title = parts[0].strip().rstrip(",").strip()
    journal = ""
    if len(parts) > 1:
        journal = re.split(r",?\s*(pp\.|DOI:|doi:|arXiv:)", parts[1])[0].strip().rstrip(".").strip()
    doi = ""
    dm = re.search(r"10\.\d{4,}/[^\s,]+", after)
    if dm:
        doi = dm.group(0).rstrip(".")
    arx = ""
    am = re.search(r"arXiv:(\S+)", after)
    if am:
        arx = am.group(1).rstrip(".")
    if title.lower().strip() == "preface":  # book prefaces -> make meaningful
        title = ("Preface: " + journal.split(",")[0]).strip().rstrip(":").strip()
    return dict(year=year, authors=authors, title=title, journal=journal, doi=doi, arxiv=arx, atype=atype)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("cv_txt")
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--source", default="")
    args = ap.parse_args()

    lines = open(args.cv_txt, encoding="utf-8", errors="replace").read().splitlines()
    rows = list(csv.reader(open(PUB_TSV), delimiter="\t"))
    hdr = rows[0]
    ci = {c: i for i, c in enumerate(hdr)}
    dbnorm = [norm(r[ci["title"]]) for r in rows[1:]]

    def in_db(key):
        return any(key in t or t in key for t in dbnorm if len(t) > 10)

    new = []
    for atype, entries in split_sections(lines):
        for e in entries:
            rec = parse_entry(e, atype)
            if not rec or not rec["title"]:
                continue
            if in_db(norm(rec["title"])[:45]):
                continue
            new.append(rec)

    print(f"NEW vs {PUB_TSV}: {len(new)}")
    from collections import Counter
    for k, v in Counter(r["atype"] for r in new).items():
        print(f"  {k}: {v}")
    for r in new:
        ref = r["doi"] or r["arxiv"] or "-"
        print(f"  [{r['atype']:13}] {r['year']}  {r['title'][:70]}  ({ref})")

    if not args.apply or not new:
        if not new:
            print("Nothing to add.")
        else:
            print("\nDry-run only. Re-run with --apply --source \"<CV filename>\" to append.")
        return

    now = datetime.datetime.utcnow().strftime("%Y-%m-%dT00:00:00.000+00:00")
    maxid = max(int(r[0]) for r in rows[1:] if r[0].isdigit())
    out = []
    for r in new:
        maxid += 1
        row = [""] * len(hdr)
        row[ci["id"]] = str(maxid)
        row[ci["title"]] = r["title"]
        row[ci["authors"]] = r["authors"]
        row[ci["year"]] = r["year"]
        row[ci["journal"]] = r["journal"]
        row[ci["doi"]] = r["doi"]
        if "arxivId" in ci:
            row[ci["arxivId"]] = r["arxiv"]
        row[ci["articleType"]] = r["atype"]
        if "tags" in ci:
            row[ci["tags"]] = json.dumps(classify_topics(r["title"], r["journal"]))
        if "featured" in ci:
            row[ci["featured"]] = "0"
        row[ci["curationStatus"]] = "VERIFIED"
        if "sourceCV" in ci:
            row[ci["sourceCV"]] = args.source
        row[ci["createdAt"]] = now
        row[ci["updatedAt"]] = now
        for c in row:
            assert "\t" not in c and "\n" not in c and "\r" not in c, repr(c)
        out.append(row)
    with open(PUB_TSV, "a") as f:
        for row in out:
            f.write("\t".join(row) + "\n")
    print(f"\nAppended {len(out)} rows (ids {out[0][0]}-{out[-1][0]}) to {PUB_TSV}.")
    print("Next: node scripts/rebuild-db.mjs ; restart dev server ; verify ; commit to dev.")


if __name__ == "__main__":
    main()
