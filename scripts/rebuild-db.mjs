#!/usr/bin/env node
// Rebuild aimed-lab.db from TSV data exports using better-sqlite3 or libsql
import { execSync } from 'child_process';
import { readFileSync, readdirSync, existsSync, unlinkSync } from 'fs';
import { join } from 'path';
import { createClient } from '@libsql/client';

const DB_FILE = 'aimed-lab.db';
const DATA_DIR = 'data';

async function main() {
  console.log('[rebuild-db] Creating fresh database with Prisma schema...');

  // Remove old db
  if (existsSync(DB_FILE)) unlinkSync(DB_FILE);

  // Create schema with prisma db push
  execSync(`DATABASE_URL="file:./${DB_FILE}" npx prisma db push --accept-data-loss`, {
    stdio: 'pipe',
    env: { ...process.env, DATABASE_URL: `file:./${DB_FILE}` },
  });
  console.log('[rebuild-db] Schema created.');

  // Connect with libsql
  const client = createClient({ url: `file:${DB_FILE}` });

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
        // Handle boolean values
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
        // Skip rows with errors (e.g., duplicate keys)
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

  client.close();

  // Verify the file on disk
  const { statSync } = await import('fs');
  const stat = statSync(DB_FILE);
  console.log(`[rebuild-db] File: ${DB_FILE}, size: ${stat.size} bytes`);
}

main().catch(err => {
  console.error('[rebuild-db] Failed:', err.message);
  process.exit(1);
});
