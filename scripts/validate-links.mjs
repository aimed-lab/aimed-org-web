#!/usr/bin/env node
/**
 * Validate DOI links and resolve PubMed IDs for publications.
 */

import { execSync } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { writeFileSync, readFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = resolve(__dirname, "..", "dev.db");
const TMP_SQL = "/tmp/aimed-validate.sql";
const TMP_OUT = "/tmp/aimed-validate.out";

const DELAY = 350;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function sql(query) {
  writeFileSync(TMP_SQL, `.mode csv\n.separator |\n${query}`, "utf8");
  try {
    const out = execSync(`sqlite3 "${DB_PATH}" < ${TMP_SQL}`, { encoding: "utf8" }).trim();
    return out ? out.split("\n") : [];
  } catch (e) {
    console.error("SQL error:", e.stderr);
    return [];
  }
}

function sqlUpdate(query) {
  writeFileSync(TMP_SQL, query, "utf8");
  execSync(`sqlite3 "${DB_PATH}" < ${TMP_SQL}`);
}

async function checkDOI(doi) {
  try {
    const res = await fetch(`https://doi.org/${doi}`, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function searchPubMed(title) {
  try {
    const cleanTitle = title.replace(/[^\w\s]/g, " ").substring(0, 200);
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&retmode=json&retmax=1&term=${encodeURIComponent(cleanTitle)}[Title]`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const data = await res.json();
    const ids = data?.esearchresult?.idlist;
    return ids?.length === 1 ? ids[0] : null;
  } catch {
    return null;
  }
}

async function main() {
  const rows = sql("SELECT id, doi, pubmedId, title FROM Publication ORDER BY year DESC;");
  const pubs = rows.map((r) => {
    const parts = r.split("|");
    return { id: +parts[0], doi: parts[1] || null, pubmedId: parts[2] || null, title: parts.slice(3).join("|").replace(/^"|"$/g, "") };
  });

  console.log(`Total publications: ${pubs.length}`);
  console.log(`With DOI: ${pubs.filter((p) => p.doi).length}`);
  console.log(`With PubMed ID: ${pubs.filter((p) => p.pubmedId).length}\n`);

  let doiValid = 0, doiInvalid = 0;
  let pubmedFound = 0;

  // 1. Validate DOIs
  console.log("=== Validating DOIs ===");
  for (const pub of pubs) {
    if (!pub.doi) continue;
    if (!pub.doi.startsWith("10.")) {
      console.log(`  INVALID [${pub.id}] doi="${pub.doi}"`);
      sqlUpdate(`UPDATE Publication SET doi = NULL WHERE id = ${pub.id};`);
      doiInvalid++;
      continue;
    }
    const ok = await checkDOI(pub.doi);
    if (ok) {
      doiValid++;
      process.stdout.write(".");
    } else {
      console.log(`\n  BROKEN [${pub.id}] doi="${pub.doi}" → ${pub.title.substring(0, 70)}`);
      sqlUpdate(`UPDATE Publication SET doi = NULL WHERE id = ${pub.id};`);
      doiInvalid++;
    }
    await sleep(DELAY);
  }
  console.log(`\nDOI: ${doiValid} valid, ${doiInvalid} invalid/cleared\n`);

  // 2. Search PubMed for all
  console.log("=== Searching PubMed IDs ===");
  let count = 0;
  for (const pub of pubs) {
    if (pub.pubmedId) continue;
    count++;
    const pmid = await searchPubMed(pub.title);
    if (pmid) {
      console.log(`  FOUND [${pub.id}] PMID=${pmid} → ${pub.title.substring(0, 70)}`);
      sqlUpdate(`UPDATE Publication SET pubmedId = '${pmid}' WHERE id = ${pub.id};`);
      pubmedFound++;
    } else {
      process.stdout.write(".");
    }
    await sleep(DELAY);
    if (count % 50 === 0) console.log(`\n  (${count}/${pubs.length} searched)`);
  }
  console.log(`\nPubMed: ${pubmedFound} found\n`);

  // Summary
  const s = sql("SELECT COUNT(*), COUNT(doi), COUNT(pubmedId) FROM Publication;")[0].split("|");
  console.log(`=== Final: ${s[0]} total, ${s[1]} DOIs, ${s[2]} PubMed IDs ===`);
}

main().catch(console.error);
