/**
 * Definitions for the five CV sections that flow into the site's `data/*.tsv`
 * source-of-truth files. Each section knows:
 *   - which TSV file it lives in and that file's column order,
 *   - how to turn an AI-parsed item (from /api/cv-parse) into a TSV row,
 *   - a normalised dedup key so an item already on the site is never re-added.
 *
 * Parsed shapes match the response of /api/cv-parse (see that route + the
 * admin CV-upload page). New rows are marked PROVISIONAL where the schema has a
 * curationStatus column, so they render as "pending" until accepted.
 */

import type { TsvRow } from "./tsv";

export type SectionKey =
  | "publications"
  | "talks"
  | "honors"
  | "software"
  | "patents";

export interface SectionDef {
  key: SectionKey;
  label: string;
  tsvFile: string; // relative to data/
  columns: string[];
  /** Map an AI-parsed item to the column values it supplies (id/timestamps added later). */
  toRow: (item: Record<string, unknown>, sourceCV: string) => TsvRow;
  /** Normalised key used to detect an item that already exists on the site. */
  dedupKey: (row: TsvRow) => string;
}

const norm = (s: unknown): string =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v));

/** Normalise a possibly-partial date/year to an ISO datetime string, or "". */
function toIsoDate(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  const raw = String(value);
  // A bare year → Jan 1 of that year.
  if (/^\d{4}$/.test(raw)) return `${raw}-01-01T00:00:00.000+00:00`;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
}

export const SECTIONS: Record<SectionKey, SectionDef> = {
  publications: {
    key: "publications",
    label: "Publications",
    tsvFile: "Publication.tsv",
    columns: [
      "id", "title", "authors", "year", "journal", "abstract", "doi",
      "pubmedId", "arxivId", "pdfUrl", "tags", "researchLineage",
      "articleType", "featured", "curationStatus", "sourceCV",
      "createdAt", "updatedAt",
    ],
    toRow: (it, sourceCV) => ({
      title: str(it.title),
      authors: str(it.authors),
      year: str(it.year),
      journal: str(it.journal),
      abstract: str(it.abstract),
      doi: str(it.doi),
      pubmedId: str(it.pubmedId),
      arxivId: str(it.arxivId),
      pdfUrl: "",
      tags: "",
      researchLineage: "",
      articleType: str(it.articleType) || "Journal Article",
      featured: "0",
      curationStatus: "PROVISIONAL",
      sourceCV: sourceCV,
    }),
    // DOI is the strongest key; fall back to title+year.
    dedupKey: (r) => (r.doi ? `doi:${norm(r.doi)}` : `t:${norm(r.title)}|${str(r.year)}`),
  },

  talks: {
    key: "talks",
    label: "Talks & Presentations",
    tsvFile: "Talk.tsv",
    columns: [
      "id", "title", "venue", "host", "city", "country", "date",
      "talkType", "slidesUrl", "videoUrl", "topic", "createdAt", "updatedAt",
    ],
    toRow: (it) => ({
      title: str(it.title),
      venue: str(it.venue),
      host: str(it.host),
      city: str(it.city),
      country: str(it.country),
      date: toIsoDate(it.date),
      talkType: str(it.talkType),
      slidesUrl: "",
      videoUrl: "",
      topic: str(it.topic),
    }),
    dedupKey: (r) => `${norm(r.title)}|${r.date ? r.date.slice(0, 4) : ""}`,
  },

  honors: {
    key: "honors",
    label: "Honors & Awards",
    tsvFile: "Honor.tsv",
    columns: ["id", "awardName", "year", "category", "issuer", "description", "createdAt", "updatedAt"],
    toRow: (it) => ({
      awardName: str(it.awardName),
      year: str(it.year),
      category: str(it.category),
      issuer: str(it.issuer),
      description: str(it.description),
    }),
    dedupKey: (r) => `${norm(r.awardName)}|${str(r.year)}`,
  },

  software: {
    key: "software",
    label: "Software & Tools",
    tsvFile: "SoftwareResource.tsv",
    columns: [
      "id", "name", "description", "url", "githubUrl", "screenshotUrl",
      "relatedPapers", "category", "featured", "curationStatus",
      "createdAt", "updatedAt",
    ],
    toRow: (it) => ({
      name: str(it.name),
      description: str(it.description),
      url: str(it.url),
      githubUrl: str(it.githubUrl),
      screenshotUrl: "",
      relatedPapers: "",
      category: str(it.category),
      featured: "0",
      curationStatus: "PROVISIONAL",
    }),
    dedupKey: (r) => norm(r.name),
  },

  patents: {
    key: "patents",
    label: "Patents",
    tsvFile: "Patent.tsv",
    columns: ["id", "title", "year", "inventors", "filingInfo", "relatedResearch", "createdAt", "updatedAt"],
    toRow: (it) => ({
      title: str(it.title),
      year: str(it.year),
      inventors: str(it.inventors),
      filingInfo: str(it.filingInfo),
      relatedResearch: "",
    }),
    dedupKey: (r) => norm(r.title),
  },
};

export const SECTION_KEYS = Object.keys(SECTIONS) as SectionKey[];
