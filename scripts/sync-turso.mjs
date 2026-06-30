#!/usr/bin/env node
// Sync data/*.tsv -> the production Turso (remote libSQL) database.
//
// Production (Vercel) reads from Turso when TURSO_DATABASE_URL is set (see
// src/lib/db.ts). `rebuild-db.mjs` only writes the LOCAL aimeddata.db, so it does
// NOT update production. Run THIS after a CV/content change to push the TSV data live:
//
//   TURSO_DATABASE_URL=libsql://<db>.turso.io TURSO_AUTH_TOKEN=<token> \
//     node scripts/sync-turso.mjs
//
// Credentials live in the Vercel project env (Settings -> Environment Variables) or
// the Turso dashboard. Unlike rebuild-db's additive INSERT OR IGNORE, this DELETEs
// each TSV-backed table and re-inserts, so curated rows (e.g. software links) replace
// stale ones. Tables WITHOUT a TSV (Inquiry, AdminUser, sessions) are never touched.
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url) {
  console.error('ERROR: set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) to the production Turso DB.');
  process.exit(1);
}
const DATA_DIR = 'data';

function coerce(v) {
  if (v === '' || v === 'NULL') return null;
  if (v === 'true' || v === '1') return 1;
  if (v === 'false' || v === '0') return 0;
  return v;
}

// ONLY these tables are synced from the TSV. They are CV/curation-driven and their
// row ids in Turso are aligned with data/*.tsv (so the id-based UPSERT updates in
// place). Tables managed directly in production — LabMember, NewsItem, Patent,
// Appointment (team roster, news, patents) — are intentionally EXCLUDED: their Turso
// ids differ from the TSV, so syncing them would insert duplicates. Do not add them
// here without first aligning ids.
const SYNC_TABLES = new Set(['Publication', 'Talk', 'Honor', 'SoftwareResource']);

async function main() {
  const client = createClient({ url, authToken });
  console.log(`[sync-turso] target: ${url.replace(/\/\/.*@/, '//')}`);
  console.log(`[sync-turso] syncing tables: ${[...SYNC_TABLES].join(', ')}`);

  // Apply schema (idempotent CREATE TABLE/INDEX IF NOT EXISTS).
  const schema = readFileSync(join(DATA_DIR, 'schema.sql'), 'utf-8');
  for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
    try { await client.execute(stmt); } catch { /* ignore existing */ }
  }

  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.tsv'));
  for (const file of files) {
    const table = file.replace('.tsv', '');
    if (!SYNC_TABLES.has(table)) continue;
    const lines = readFileSync(join(DATA_DIR, file), 'utf-8').split('\n').filter(l => l.trim());
    if (lines.length < 2) continue;
    const headers = lines[0].split('\t');

    // Add any columns present in the TSV but missing on the (older) Turso table.
    // CREATE TABLE IF NOT EXISTS won't alter an existing table, so migrate here.
    try {
      const info = await client.execute(`PRAGMA table_info("${table}")`);
      const have = new Set(info.rows.map(r => r.name));
      for (const col of headers.filter(h => !have.has(h))) {
        try { await client.execute(`ALTER TABLE "${table}" ADD COLUMN "${col}" TEXT`); console.log(`  ${table}: +column ${col}`); }
        catch (e) { console.log(`  ${table}: ALTER ${col} failed — ${e.message}`); }
      }
    } catch { /* table will be created by schema above */ }
    const cols = headers.map(h => `"${h}"`).join(', ');
    const ph = headers.map(() => '?').join(', ');
    // True UPSERT on the `id` primary key: update the row IN PLACE on conflict.
    // (Avoids DELETE/REPLACE, which would trip Turso's FK enforcement on parent
    // tables like LabMember that have child rows referencing them.) The TSV is
    // additive/authoritative for the rows it contains; rows removed from the TSV are
    // NOT pruned from Turso — handle a true deletion manually if ever needed.
    const setClause = headers.filter(h => h !== 'id')
      .map(h => `"${h}"=excluded."${h}"`).join(', ');
    const upsert = `INSERT INTO "${table}" (${cols}) VALUES (${ph}) ` +
      (setClause ? `ON CONFLICT("id") DO UPDATE SET ${setClause}` : `ON CONFLICT("id") DO NOTHING`);

    const stmts = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t').map(coerce);
      if (values.length !== headers.length) continue;
      stmts.push({ sql: upsert, args: values });
    }
    if (!stmts.length) continue;
    try {
      await client.batch(stmts, 'write');
      console.log(`  ${table}: ${stmts.length} rows synced`);
    } catch (err) {
      console.error(`  ${table}: FAILED — ${err.message}`);
      throw err;
    }
  }

  const counts = await client.execute(
    `SELECT 'Publications' t, COUNT(*) c FROM Publication
     UNION ALL SELECT 'Software', COUNT(*) FROM SoftwareResource
     UNION ALL SELECT 'Talks', COUNT(*) FROM Talk
     UNION ALL SELECT 'Honors', COUNT(*) FROM Honor`
  );
  console.log('[sync-turso] done:');
  for (const r of counts.rows) console.log(`  ${r.t}: ${r.c}`);
  client.close();
}

main().catch(e => { console.error(e); process.exit(1); });
