#!/bin/bash
# Rebuild aimed-lab.db from TSV data exports
# This ensures the database is always fresh with correct schema + data
set -e

DB_FILE="aimed-lab.db"
DATA_DIR="data"

echo "[rebuild-db] Creating fresh database with Prisma schema..."
rm -f "$DB_FILE"
DATABASE_URL="file:./$DB_FILE" npx prisma db push --accept-data-loss 2>&1 || true

echo "[rebuild-db] Importing data from TSV files..."

for tsv in "$DATA_DIR"/*.tsv; do
  [ -f "$tsv" ] || continue
  table=$(basename "$tsv" .tsv)
  # Get header (column names)
  header=$(head -1 "$tsv")
  cols=$(echo "$header" | tr '\t' ',')
  # Count data rows
  count=$(($(wc -l < "$tsv") - 1))
  if [ "$count" -gt 0 ]; then
    # Import using sqlite3 .import with tab separator, skip header
    sqlite3 "$DB_FILE" <<SQL
.mode tabs
.import --skip 1 $tsv $table
SQL
    echo "  $table: $count rows imported"
  fi
done

echo "[rebuild-db] Database rebuilt successfully!"
sqlite3 "$DB_FILE" "SELECT 'Publications', COUNT(*) FROM Publication UNION ALL SELECT 'Software', COUNT(*) FROM SoftwareResource UNION ALL SELECT 'Talks', COUNT(*) FROM Talk UNION ALL SELECT 'Honors', COUNT(*) FROM Honor UNION ALL SELECT 'Patents', COUNT(*) FROM Patent;"
