---
name: cv-sync
description: >-
  Sync a new version of Dr. Jake Chen's CV (.docx) into the aimed-org-web site
  database. Diffs the CV against the current data, then appends ONLY the new
  publications/talks/honors to the right TSV — never overwriting curated content
  (software links, paper DOIs). Use when the user provides an updated CV file and
  asks to update the website, publications, talks, or honors. Triggers: "update the
  site with my CV", "new CV version", "add my latest papers/talks".
---

# CV Sync — update the lab website from a new CV

The website's data is **TSV-sourced**: `data/*.tsv` are the durable source of truth.
On every deploy, `scripts/rebuild-db.mjs` deletes `aimeddata.db` and rebuilds it
from `data/schema.sql` + `data/*.tsv` with `INSERT OR IGNORE` (additive, fresh IDs).
CV uploads through the site UI only write the *runtime* DB and are wiped on the next
rebuild — so **the only durable place to add CV content is the TSV files.**

## Golden rules
1. **Append-only, dedup first.** Never re-import the whole CV. Diff against the
   current TSV and add only genuinely new rows. Most of the CV is already present.
2. **Never overwrite curated data.** Do NOT touch `data/SoftwareResource.tsv` — its
   links/paper DOIs were hand-validated (see the `software-curation` skill). CV sync
   only appends to `Publication.tsv`, `Talk.tsv`, `Honor.tsv`.
3. **Work on the `dev` branch, never `main`.** Commit + push to `dev` (PR open against
   main). The user reviews on the local preview before merging.
4. **Verify live before claiming done.** Rebuild, restart the dev server (Prisma holds
   the old SQLite file handle across a rebuild — a restart is REQUIRED), then confirm
   counts + that a new entry is searchable.

## Steps

1. **Extract CV text** (off-Box, into /tmp):
   ```bash
   textutil -convert txt -output /tmp/cv_new.txt "<path to CV .docx>"
   ```

2. **Dry-run the diff** from the repo root (`/tmp/aow` or your clone):
   ```bash
   python3 .claude/skills/cv-sync/sync_cv.py /tmp/cv_new.txt
   ```
   It prints, per type, the entries in the CV that are NOT already in
   `data/Publication.tsv`. Sanity-check the list with the user if it's large.

3. **Apply** (appends new rows; assigns fresh numeric IDs; sets
   `articleType`, `curationStatus=VERIFIED`, `sourceCV=<cv filename>`):
   ```bash
   python3 .claude/skills/cv-sync/sync_cv.py /tmp/cv_new.txt --apply --source "CV Jake Chen <Month Year>.docx"
   ```

4. **Rebuild the DB** from the updated TSV:
   ```bash
   DATABASE_URL=file:./aimeddata.db node scripts/rebuild-db.mjs
   ```
   Confirm `SoftwareResource: 19 rows` and `Software: 10 visible` are unchanged
   (the curation survived), and `Publication` count went up by the number added.

5. **Restart the dev server** (see the `launch-dev-site` skill) so Prisma reconnects
   to the rebuilt DB file. Then verify via the API:
   ```bash
   curl -s 'http://localhost:3000/api/publications?limit=1' | python3 -c 'import sys,json;print(json.load(sys.stdin)["total"])'
   ```
   and search for one new title to confirm it's retrievable.

6. **Commit + push to `dev`** (data-only; never main):
   ```bash
   git add data/Publication.tsv data/Talk.tsv data/Honor.tsv
   git commit -m "Sync CV <Month Year>: +N publications/talks/honors"
   git push origin dev
   ```

7. **Merge to `main`** (after the user reviews the local preview): `gh pr merge`.

8. **Push the data to PRODUCTION (Turso) — REQUIRED, easy to miss.**
   Production reads a hosted **Turso** (remote libSQL) DB, NOT the committed file
   (see `src/lib/db.ts`: it uses `TURSO_DATABASE_URL` when set). So merging + the
   Vercel build's `rebuild-db` only update the LOCAL/committed DB — **production data
   does not change until you sync Turso:**
   ```bash
   TURSO_DATABASE_URL=libsql://<db>.turso.io TURSO_AUTH_TOKEN=<token> \
     node scripts/sync-turso.mjs
   ```
   Credentials are in the Vercel project env (Settings → Environment Variables) or the
   Turso dashboard. Verify live: `curl https://www.aimed-lab.org/api/publications?limit=1`
   (or the `aimed-org-web.vercel.app` alias) should show the new total. **If the live
   total doesn't change after a deploy, this step was skipped.**

## Notes on publication types
`Publication.articleType` values in use: `Journal Article`, `Conference`,
`Book Chapter`, `Edited Volume`, `Editorial`, `Book`, `Preprint`. The CV sections map:
- "Refereed – Journal Articles" → `Journal Article`
- "Refereed – Conference or Workshop Proceedings Articles" → `Conference`
- "Books" → `Book`; "Refereed – Book Chapters" → `Book Chapter`
- "Editorial Articles in Books/Proceedings" → `Editorial`
- "Edited Conference Proceedings and Journal Special Issues" → `Edited Volume`

The `/publications` "By Type" filter (`src/app/publications/page.tsx`, `allTypes`)
must list every type present, and the "By Year" list is derived from the current year
— both already handle new years/types automatically.

Talks ("INVITED TALKS") and Honors ("HONORS") sync the same way into `Talk.tsv` /
`Honor.tsv`; the diff approach (normalize title/name, skip if already present) is
identical. Extend `sync_cv.py` if you need them automated; otherwise add manually
following the existing row format (`head -1 data/Talk.tsv` for columns).
