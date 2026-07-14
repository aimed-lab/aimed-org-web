# CV Update Workflow — upload → preview → accept/revise/reject

This lab site's content (publications, talks, honors, patents, software) is
generated from plain-text files in **`data/*.tsv`**, which are committed to Git
and rebuilt into the site's database on every Vercel deploy
(`scripts/rebuild-db.mjs`). That means **the `data/*.tsv` files are the source of
truth** — not the live database, which is regenerated (and is read-only) on
production.

The admin CV workflow is built around this: instead of writing changes into the
throwaway production database, it commits them to a **`cv-staging` Git branch**,
which Vercel automatically builds into a **live preview site** you can inspect
before anything goes public.

## How it works (for the PI)

1. Go to **`/admin/cv-upload`** and upload your latest CV (PDF or Word).
2. AI extracts publications, talks, honors, software, and patents, flags
   duplicates, and lets you select what to include.
3. Click **Stage & Preview Changes**. This commits the selected items to the
   `cv-staging` branch. Vercel starts building a preview.
4. When the preview is ready, click **Open preview site** to see your real pages
   with the new content — exactly as they'll look live.
5. Choose:
   - **Accept & Publish** — merges the changes into the live site
     (`www.aimed-lab.org` rebuilds automatically, ~1–2 min).
   - **Revise** — adjust the selections, add a **change comment**, and re-stage;
     the preview rebuilds with your edits.
   - **Reject** — discards the staged branch. Nothing reaches the public site.

You can safely close the tab after staging and come back later — the admin page
detects the pending `cv-staging` branch and lets you resume the review.

## One-time setup (required)

The workflow needs a GitHub token so the site can commit to your repo. This is
the only setup step, and it's done once.

### 1. Create a GitHub token

Use a **fine-grained personal access token** scoped to just this repo:

1. GitHub → **Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**.
2. **Repository access:** *Only select repositories* → `aimed-lab/aimed-org-web`.
3. **Permissions → Repository permissions → Contents: Read and write.**
   (That's the only permission needed.)
4. **Expiration:** set as long as allowed, or "No expiration" if you want it to
   be truly hands-off. Set a calendar reminder if you choose an expiry.
5. Generate and copy the token (starts with `github_pat_…`).

> A classic PAT with the `repo` scope also works if you prefer.

### 2. Add it to Vercel

1. Vercel → your **aimed-lab.org** project → **Settings → Environment
   Variables**.
2. Add:

   | Name | Value | Environments |
   |------|-------|--------------|
   | `GITHUB_TOKEN` | the token from step 1 | Production, Preview, Development |

   Optional overrides (defaults shown — only set if different):

   | Name | Default | Purpose |
   |------|---------|---------|
   | `GITHUB_REPO` | `aimed-lab/aimed-org-web` | `owner/repo` to commit to |
   | `GITHUB_BASE_BRANCH` | `main` | production branch |
   | `CV_PREVIEW_URL` | *(auto-detected)* | fallback preview URL if the live one can't be read |

3. **Redeploy** so the variable takes effect.

Until `GITHUB_TOKEN` is set, the admin page shows a notice and the Stage &
Preview button is disabled — the rest of the site is unaffected.

## What lands in Git

- New rows are appended to the relevant `data/*.tsv` file, with fresh ids,
  timestamps, and `curationStatus = PROVISIONAL` (where the table supports it).
- Duplicate detection runs twice: once at parse time (against the current DB)
  and again at stage time (against the `data/*.tsv` files), so an item already
  on the site is never added twice.
- A `data/_cv-staging.json` manifest records what was staged, the source CV, and
  the change-comment history for that batch (audit trail).

## Notes

- **No external database, no paid services.** The whole workflow rides on Git
  (free) + Vercel (your existing host). The data is plain text, readable forever.
- **No new dependencies.** The GitHub calls use the built-in `fetch` — nothing
  new to keep upgraded.
- The per-section **Finalize & Send** button still writes directly to the
  database; that path is only durable in local development (production rebuilds
  the DB from the TSV files). For production, always use **Stage & Preview →
  Accept**.
