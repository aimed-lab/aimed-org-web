#!/usr/bin/env node
// Additively sync the production Turso schema to prisma/schema.prisma.
//
// Turso was originally seeded via `prisma db push`, then the Prisma schema kept
// evolving (new columns) without those columns being added to Turso. The generated
// Prisma client then SELECTs columns Turso lacks → "no such column" → 500 on the
// affected endpoints (this is what broke /api/member/me, /datasets, /projects,
// /tools, /profile). This script ADDs any missing scalar columns (never drops or
// modifies) so the running client's queries always resolve.
//
// Wired into `npm run build` before sync-turso so every production deploy self-heals.
// Guards: skips on Vercel preview/dev and when TURSO_DATABASE_URL is unset.
import { readFileSync } from "fs"
import { createClient } from "@libsql/client"

if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
  console.log(`[sync-turso-schema] VERCEL_ENV=${process.env.VERCEL_ENV} — skipping.`)
  process.exit(0)
}
const url = process.env.TURSO_DATABASE_URL
if (!url) {
  console.log("[sync-turso-schema] TURSO_DATABASE_URL not set — skipping (local/file mode).")
  process.exit(0)
}

const TYPE = { String: "TEXT", Int: "INTEGER", BigInt: "INTEGER", Boolean: "BOOLEAN", DateTime: "DATETIME", Float: "REAL", Decimal: "REAL", Json: "TEXT" }

async function main() {
  const schema = readFileSync("prisma/schema.prisma", "utf-8")
  const models = [...schema.matchAll(/model\s+(\w+)\s*\{([\s\S]*?)\n\}/g)]
  const c = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })
  let added = 0

  for (const [, model, body] of models) {
    let cols
    try {
      cols = (await c.execute(`PRAGMA table_info("${model}")`)).rows.map((r) => r.name)
    } catch {
      continue // table not present in Turso
    }
    if (!cols.length) continue
    const have = new Set(cols)

    for (const line of body.split("\n").map((l) => l.trim())) {
      if (!line || line.startsWith("//") || line.startsWith("@@")) continue
      const m = line.match(/^(\w+)\s+(\w+)(\?)?(\[\])?/)
      if (!m) continue
      const [, field, ptype, opt, arr] = m
      if (arr || !TYPE[ptype] || field === "id" || have.has(field)) continue

      let colDef = `"${field}" ${TYPE[ptype]}`
      const strDef = line.match(/@default\("([^"]*)"\)/)
      const rawDef = line.match(/@default\(([^)]*)\)/)
      if (strDef) colDef += ` NOT NULL DEFAULT '${strDef[1]}'`
      else if (rawDef) {
        const d = rawDef[1].trim()
        if (d === "now()") colDef += " NOT NULL DEFAULT CURRENT_TIMESTAMP"
        else if (d === "true") colDef += " NOT NULL DEFAULT 1"
        else if (d === "false") colDef += " NOT NULL DEFAULT 0"
        else if (/^-?\d+(\.\d+)?$/.test(d)) colDef += ` NOT NULL DEFAULT ${d}`
        // autoincrement()/cuid()/uuid(): no column default
      } else if (!opt) {
        // required, no default — give a type-appropriate empty default so existing rows
        // don't null-error when the required field is read.
        colDef += TYPE[ptype] === "TEXT" ? " NOT NULL DEFAULT ''" : /INTEGER|REAL/.test(TYPE[ptype]) ? " NOT NULL DEFAULT 0" : ""
      }
      try {
        await c.execute(`ALTER TABLE "${model}" ADD COLUMN ${colDef}`)
        console.log(`  + ${model}.${field}`)
        added++
      } catch (e) {
        if (!/duplicate column/i.test(e.message)) console.log(`  FAILED ${model}.${field}: ${e.message}`)
      }
    }
  }
  console.log(`[sync-turso-schema] done — ${added} column(s) added.`)
  c.close()
}

main().catch((e) => { console.error(e); process.exit(1) })
