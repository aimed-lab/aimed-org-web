/**
 * Tab-separated-value helpers for the CV → data/*.tsv staging pipeline.
 *
 * The site's durable source of truth is the plain-text `data/*.tsv` files in
 * git (rebuilt into the SQLite DB at deploy time by scripts/rebuild-db.mjs).
 * These helpers read a TSV into row objects, append new rows with fresh ids +
 * timestamps, and serialise back to TSV — with cell sanitisation so a stray
 * tab or newline from an AI-parsed CV can never corrupt the column layout.
 */

export type TsvRow = Record<string, string>;

/** A single tab-separated cell can hold no tabs or newlines. */
export function sanitizeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r?\n/g, " ").replace(/\t/g, " ").trim();
}

/** Parse TSV text into an array of row objects keyed by the header columns. */
export function parseTsv(text: string): { columns: string[]; rows: TsvRow[] } {
  const lines = text.split("\n").filter((l) => l.replace(/\r$/, "").length > 0);
  if (lines.length === 0) return { columns: [], rows: [] };

  const columns = lines[0].replace(/\r$/, "").split("\t");
  const rows: TsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].replace(/\r$/, "").split("\t");
    const row: TsvRow = {};
    columns.forEach((col, c) => {
      row[col] = cells[c] ?? "";
    });
    rows.push(row);
  }

  return { columns, rows };
}

/** Serialise rows back to TSV using the given column order. Ends with a newline. */
export function serializeTsv(columns: string[], rows: TsvRow[]): string {
  const header = columns.join("\t");
  const body = rows.map((row) =>
    columns.map((col) => sanitizeCell(row[col])).join("\t")
  );
  return [header, ...body].join("\n") + "\n";
}

/** The largest numeric id currently in a set of rows (0 if none). */
export function maxId(rows: TsvRow[]): number {
  return rows.reduce((max, row) => {
    const n = Number(row.id);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
}
