@AGENTS.md

# AI.MED Lab Website — aimed-lab.org

## Project Overview
Faculty-centered research portal for Prof. Jake Y. Chen's AI.MED lab at UAB. Built with Next.js 16 (App Router), TypeScript, Tailwind CSS, Prisma 7 with SQLite/libSQL, and Framer Motion.

## Quick Start
```bash
npm run dev     # Start dev server at http://localhost:3000
npm run build   # Production build
npm run lint    # ESLint
```

## Key Architecture Decisions
- **CV-driven content engine**: All content derives from structured database records parsed from the PI's CV. The database is the source of truth — no manual page sprawl.
- **Prisma 7 + SQLite**: Uses `@prisma/adapter-libsql` for the client adapter. Database file lives at `./dev.db`.
- **Static pages with API routes**: Public pages use static data for performance; API routes handle dynamic operations (inquiries, publications search, admin).
- **Design system**: Custom components in `src/components/ui/` following Vercel/Linear/Stripe aesthetic — cobalt blue accent, generous whitespace, subtle motion.

## Database
- Schema: `prisma/schema.prisma`
- Seed: `npx tsx prisma/seed.ts`
- Push schema: `npx prisma db push`
- Generate client: `npx prisma generate` (outputs to `src/generated/prisma/`)

## Directory Structure
```
src/
├── app/             # Next.js App Router pages
│   ├── page.tsx     # Homepage
│   ├── research/    # Research lineages
│   ├── publications/# Searchable publication database
│   ├── talks/       # Invited talks & honors
│   ├── training/    # Training & mentoring
│   ├── software/    # Software & resources
│   ├── news/        # News & media gallery
│   ├── join/        # Join/collaborate with inquiry form
│   ├── admin/       # Admin login + dashboard
│   └── api/         # API routes (inquiry, auth, publications, news, cv-upload)
├── components/
│   ├── layout/      # Header, Footer
│   ├── ui/          # Design system (Button, Card, Badge, Input, etc.)
│   └── theme-provider.tsx
├── generated/prisma/# Prisma generated client (do not edit)
└── lib/
    ├── db.ts        # Prisma client singleton
    └── utils.ts     # cn() utility
```

## Admin Access
Default credentials (change in production via env vars):
- Email: admin@aimed-lab.org
- Password: changeme123

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables to override.

## Content Update Workflow
1. Log in at `/admin`
2. Upload updated CV (PDF/DOCX) via the dashboard
3. News items can be added via the dashboard
4. For structural changes, use GitHub issues to track trouble tickets
