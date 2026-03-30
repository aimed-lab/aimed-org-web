"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ExternalLink,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
  Loader2,
  Download,
  GraduationCap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Publication {
  id: number;
  title: string;
  authors: string;
  journal: string | null;
  year: number;
  abstract: string | null;
  doi: string | null;
  pubmedId: string | null;
  arxivId: string | null;
  pdfUrl: string | null;
  tags: string | null; // JSON string
  researchLineage: string | null;
  articleType: string | null;
  featured: boolean;
}

const allTopics = ["Drug Discovery", "AI/ML", "Bioinformatics", "Systems Biology", "Knowledge Networks", "Multi-omics", "Precision Medicine", "Cancer", "Neurodegenerative Diseases", "Immunology", "Visualization"];
const allTypes = ["Journal Article", "Preprint", "Conference"];
const years = Array.from({ length: 26 }, (_, i) => 2025 - i);

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
        active
          ? "bg-emerald-700 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function generateRIS(pub: Publication): string {
  const type = pub.articleType === "Conference" ? "CONF" : pub.articleType === "Book" ? "BOOK" : pub.articleType === "Book Chapter" ? "CHAP" : "JOUR";
  const lines = [`TY  - ${type}`];
  // Split authors and add each as AU
  const authorList = pub.authors.replace(/\*/g, "").split(/,\s*(?:and\s+)?|(?:\s+and\s+)/);
  for (const a of authorList) {
    const trimmed = a.trim();
    if (trimmed) lines.push(`AU  - ${trimmed}`);
  }
  lines.push(`TI  - ${pub.title}`);
  if (pub.journal) lines.push(`JO  - ${pub.journal}`);
  lines.push(`PY  - ${pub.year}`);
  if (pub.doi) lines.push(`DO  - ${pub.doi}`);
  if (pub.pubmedId) lines.push(`AN  - ${pub.pubmedId}`);
  if (pub.arxivId) lines.push(`UR  - https://arxiv.org/abs/${pub.arxivId}`);
  if (pub.abstract) lines.push(`AB  - ${pub.abstract}`);
  lines.push("ER  - ");
  return lines.join("\r\n");
}

function downloadRIS(pub: Publication) {
  const ris = generateRIS(pub);
  const blob = new Blob([ris], { type: "application/x-research-info-systems" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const slug = pub.title.replace(/[^a-zA-Z0-9]+/g, "_").substring(0, 60);
  a.download = `${slug}.ris`;
  a.click();
  URL.revokeObjectURL(url);
}

function PublicationCard({ pub, index }: { pub: Publication; index: number }) {
  const [open, setOpen] = useState(false);
  const tags: string[] = pub.tags ? JSON.parse(pub.tags) : [];
  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : null;
  const pubmedUrl = pub.pubmedId
    ? `https://pubmed.ncbi.nlm.nih.gov/${pub.pubmedId}`
    : null;
  const pubmedSearchUrl = !pub.pubmedId
    ? `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(pub.title)}`
    : null;
  const arxivUrl = pub.arxivId ? `https://arxiv.org/abs/${pub.arxivId}` : null;
  const scholarUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(pub.title)}`;

  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <h3
        onClick={() => setOpen(!open)}
        className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100 cursor-pointer hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
      >
        {pub.title}
      </h3>

      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{pub.authors}</p>
      <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">
        {pub.journal}{pub.journal && ", "}{pub.year}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:text-emerald-300"
          >
            {t}
          </span>
        ))}
        {pub.articleType && (
          <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {pub.articleType}
          </span>
        )}
      </div>

      {/* Links */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {doiUrl ? (
          <a href={doiUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> DOI
          </a>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-slate-300 dark:text-slate-600 select-none" title="DOI not available">
            <ExternalLink className="h-3.5 w-3.5" /> DOI
          </span>
        )}
        {pubmedUrl && (
          <a href={pubmedUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
            <BookOpen className="h-3.5 w-3.5" /> PubMed
          </a>
        )}
        {pubmedSearchUrl && pub.articleType === "Journal Article" && (
          <a href={pubmedSearchUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
            <BookOpen className="h-3.5 w-3.5" /> PubMed
          </a>
        )}
        <a href={scholarUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
          <GraduationCap className="h-3.5 w-3.5" /> Scholar
        </a>
        {arxivUrl && (
          <a href={arxivUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
            <FileText className="h-3.5 w-3.5" /> arXiv
          </a>
        )}
        {pub.pdfUrl && (
          <a href={pub.pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline">
            <FileText className="h-3.5 w-3.5" /> PDF
          </a>
        )}
        <button
          onClick={() => downloadRIS(pub)}
          className="flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:underline"
        >
          <Download className="h-3.5 w-3.5" /> Cite
        </button>
        {pub.abstract && (
          <button
            onClick={() => setOpen(!open)}
            className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {open ? "Hide abstract" : "Abstract"}
          </button>
        )}
      </div>

      {/* Expandable abstract */}
      <AnimatePresence>
        {open && pub.abstract && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-zinc-800 pt-4">
              {pub.abstract}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

type FilterMode = "all" | "year" | "topic" | "type";

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const fetchPublications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (filterMode === "year" && selectedYear) params.set("year", String(selectedYear));
      if (filterMode === "topic" && selectedTopic) params.set("topic", selectedTopic);
      if (filterMode === "type" && selectedType) params.set("type", selectedType);
      params.set("limit", "300");

      const res = await fetch(`/api/publications?${params}`);
      const data = await res.json();
      setPublications(data.publications || []);
      setTotal(data.total || 0);
    } catch {
      setPublications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [query, filterMode, selectedYear, selectedTopic, selectedType]);

  useEffect(() => {
    const timer = setTimeout(fetchPublications, 300);
    return () => clearTimeout(timer);
  }, [fetchPublications]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-16 sm:py-20 md:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl"
          >
            Publications
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Peer-reviewed publications spanning drug discovery, biomedical AI, knowledge
            engineering, and translational informatics.
          </motion.p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] dark:opacity-[0.04]" />
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-20 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, journal, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mode pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 mr-1" />
            {(["all", "year", "topic", "type"] as FilterMode[]).map((m) => (
              <Pill
                key={m}
                label={m === "all" ? "All" : m === "year" ? "By Year" : m === "topic" ? "By Topic" : "By Type"}
                active={filterMode === m}
                onClick={() => {
                  setFilterMode(m);
                  setSelectedYear(null);
                  setSelectedTopic(null);
                  setSelectedType(null);
                }}
              />
            ))}
          </div>

          {/* Contextual sub-filters */}
          <AnimatePresence mode="wait">
            {filterMode === "year" && (
              <motion.div
                key="year"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Year:</label>
                  <select
                    value={selectedYear ?? ""}
                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                    className="rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="">All years</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {filterMode === "topic" && (
              <motion.div
                key="topic"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((t) => (
                    <Pill key={t} label={t} active={selectedTopic === t} onClick={() => setSelectedTopic(selectedTopic === t ? null : t)} />
                  ))}
                </div>
              </motion.div>
            )}

            {filterMode === "type" && (
              <motion.div
                key="type"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {allTypes.map((t) => (
                    <Pill key={t} label={t} active={selectedType === t} onClick={() => setSelectedType(selectedType === t ? null : t)} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results count */}
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{total}</span>{" "}
          publication{total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Publication grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : publications.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-400 dark:text-slate-500">No publications match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 mt-4">
            {publications.map((pub, i) => (
              <PublicationCard key={pub.id} pub={pub} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
