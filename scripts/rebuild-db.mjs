#!/usr/bin/env node
// Rebuild aimed-lab.db from schema.sql + TSV data exports
// Does NOT use prisma db push — creates tables directly from SQL schema
import { readFileSync, readdirSync, existsSync, unlinkSync, statSync } from 'fs';
import { join } from 'path';
import { createClient } from '@libsql/client';

const DB_FILE = 'aimeddata.db';
const DATA_DIR = 'data';
const SCHEMA_FILE = join(DATA_DIR, 'schema.sql');

async function main() {
  console.log('[rebuild-db] Creating fresh database from schema.sql...');

  // Remove old db
  if (existsSync(DB_FILE)) unlinkSync(DB_FILE);

  // Connect with libsql (creates the file)
  const client = createClient({ url: `file:${DB_FILE}` });

  // Apply schema
  const schema = readFileSync(SCHEMA_FILE, 'utf-8');
  // Split by semicolons and execute each statement
  const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (err) {
      // Skip errors (e.g., CREATE INDEX IF NOT EXISTS with existing index)
    }
  }
  console.log('[rebuild-db] Schema applied.');

  // Import each TSV file
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.tsv'));

  for (const file of files) {
    const table = file.replace('.tsv', '');
    const content = readFileSync(join(DATA_DIR, file), 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    if (lines.length < 2) continue; // header only

    const headers = lines[0].split('\t');
    const cols = headers.map(h => `"${h}"`).join(', ');
    const placeholders = headers.map(() => '?').join(', ');

    let imported = 0;
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t').map(v => {
        if (v === '' || v === 'NULL') return null;
        if (v === 'true' || v === '1') return 1;
        if (v === 'false' || v === '0') return 0;
        return v;
      });

      if (values.length !== headers.length) continue;

      try {
        await client.execute({
          sql: `INSERT OR IGNORE INTO "${table}" (${cols}) VALUES (${placeholders})`,
          args: values,
        });
        imported++;
      } catch (err) {
        // Skip rows with errors
      }
    }
    console.log(`  ${table}: ${imported} rows imported`);
  }

  // Verify
  const counts = await client.execute(
    `SELECT 'Publications' as t, COUNT(*) as c FROM Publication
     UNION ALL SELECT 'Software', COUNT(*) FROM SoftwareResource
     UNION ALL SELECT 'Talks', COUNT(*) FROM Talk
     UNION ALL SELECT 'Honors', COUNT(*) FROM Honor
     UNION ALL SELECT 'Patents', COUNT(*) FROM Patent`
  );
  console.log('[rebuild-db] Database rebuilt successfully!');
  for (const row of counts.rows) {
    console.log(`  ${row.t}: ${row.c}`);
  }

  // Check curationStatus exists
  const pubCols = await client.execute("PRAGMA table_info(Publication)");
  const hasCuration = pubCols.rows.some(r => r.name === 'curationStatus');
  console.log(`  curationStatus column: ${hasCuration ? 'YES' : 'MISSING!'}`);

  const stat = statSync(DB_FILE);
  console.log(`[rebuild-db] File: ${DB_FILE}, size: ${stat.size} bytes`);

  client.close();
}

main().catch(err => {
  console.error('[rebuild-db] Failed:', err.message);
  process.exit(1);
});
