---
name: launch-dev-site
description: >-
  Run the aimed-org-web (Next.js) site locally for preview, built/served OFF the Box
  CloudStorage filesystem (which causes npm/next read-timeouts). Use to preview the
  dev branch before merging, after a data rebuild, or whenever the local site shows
  "not available". Triggers: "launch the site", "run the dev app", "preview the site",
  "the site is not available".
---

# Launch the dev site locally (off-Box)

The repo lives under Box CloudStorage, where `npm`/`next`/`git` hit read-timeouts and
hang. Always run from a clone in `/tmp` instead.

## One-time setup
```bash
git clone https://github.com/aimed-lab/aimed-org-web /tmp/aow
cd /tmp/aow && git checkout dev
printf 'DATABASE_URL=file:./aimeddata.db\nGEMINI_API_KEY=disabled\nADMIN_ACTIVATION_CODE=AIMED2026\n' > .env
npm install
npx prisma generate
DATABASE_URL=file:./aimeddata.db node scripts/rebuild-db.mjs
```

## Launch config
`.claude/launch.json` defines the `aimed-web` preview (port 3000):
```json
{ "name": "aimed-web", "runtimeExecutable": "bash",
  "runtimeArgs": ["-lc", "cd /tmp/aow && DATABASE_URL=file:./aimeddata.db npx next dev -p 3000"],
  "port": 3000 }
```
Start it with the preview tool (`preview_start name=aimed-web`) or directly:
```bash
cd /tmp/aow && DATABASE_URL=file:./aimeddata.db npx next dev -p 3000
```
Open **http://localhost:3000** (key pages: /publications, /talks, /honors, /software).

## Gotchas
- **Server reaped between turns.** A local `next dev` is a background process the
  harness may tear down; if the page is "not available", just restart it (~10s).
- **Restart after every `rebuild-db.mjs`.** `rebuild-db` deletes and recreates
  `aimeddata.db`; a running Prisma client keeps the old (unlinked) file handle and
  serves STALE data until restarted. Always stop+start the server after a rebuild.
- **Stay on `dev`.** Preview the `dev` branch; never run/commit against `main`. Merging
  is a deliberate, separate step after the user reviews.
