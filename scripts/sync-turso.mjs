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

async function main() {
  const client = createClient({ url, authToken });
  console.log(`[sync-turso] target: ${url.replace(/\/\/.*@/, '//')}`);

  // Apply schema (idempotent CREATE TABLE/INDEX IF NOT EXISTS).
  const schema = readFileSync(join(DATA_DIR, 'schema.sql'), 'utf-8');
  for (const stmt of schema.split(';').map(s => s.trim()).filter(Boolean)) {
    try { await client.execute(stmt); } catch { /* ignore existing */ }
  }

  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.tsv'));
  for (const file of files) {
    const table = file.replace('.tsv', '');
    const lines = readFileSync(join(DATA_DIR, file), 'utf-8').split('\n').filter(l => l.trim());
    if (lines.length < 2) continue;
    const headers = lines[0].split('\t');
    const cols = headers.map(h => `"${h}"`).join(', ');
    const ph = headers.map(() => '?').join(', ');

    // Atomic per-table replace: DELETE all + re-insert from TSV.
    const stmts = [{ sql: `DELETE FROM "${table}"`, args: [] }];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t').map(coerce);
      if (values.length !== headers.length) continue;
      stmts.push({ sql: `INSERT INTO "${table}" (${cols}) VALUES (${ph})`, args: values });
    }
    try {
      await client.batch(stmts, 'write');
      console.log(`  ${table}: ${stmts.length - 1} rows synced`);
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
