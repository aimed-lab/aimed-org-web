"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Newspaper,
  Calendar,
  ExternalLink,
  Loader2,
  Rss,
  FlaskConical,
  Bookmark,
  BookmarkCheck,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
} from "lucide-react";

interface NewsItem {
  id: number;
  date: string | null;
  headline: string;
  summary: string | null;
  link: string | null;
  pinned: boolean;
}

interface ResearchNewsItem {
  pmid: string;
  title: string;
  pubdate: string;
  journal: string;
  authors: string;
  link: string;
  doi: string | null;
  topic: string;
  score: number;
}

const SAVED_KEY = "aimed_saved_articles";
const RSS_FEED_URL = "https://aimed-lab.org/api/research-news/feed";

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function formatPubDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function yearFromDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      : score >= 40
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-slate-400";
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums ${color}`}
      title="Relevance to AI.MED lab focus (0–100)"
    >
      {score}/100
    </span>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.32, ease: "easeOut" as const },
  }),
};

function SectionHeader({
  icon,
  title,
  badge,
  open,
  onToggle,
  actions,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  actions?: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center gap-3 text-left group mb-2"
    >
      <span className="text-emerald-600">{icon}</span>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
        {title}
      </h2>
      {badge}
      <span className="ml-auto flex items-center gap-2">
        {actions}
        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </span>
    </button>
  );
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [rssItems, setRssItems] = useState<ResearchNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rssLoading, setRssLoading] = useState(true);
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [showSaved, setShowSaved] = useState(false);
  const [researchOpen, setResearchOpen] = useState(true);
  const [labOpen, setLabOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_KEY);
      if (raw) setSaved(new Set(JSON.parse(raw)));
    } catch {}
  }, []);

  const toggleSave = useCallback((pmid: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(pmid)) next.delete(pmid);
      else next.add(pmid);
      try { localStorage.setItem(SAVED_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(Array.isArray(data) ? data : data.news || []);
    } catch { setNews([]); } finally { setLoading(false); }
  }, []);

  const fetchRSS = useCallback(async () => {
    setRssLoading(true);
    try {
      const res = await fetch("/api/research-news");
      const data = await res.json();
      setRssItems(Array.isArray(data) ? data : []);
    } catch { setRssItems([]); } finally { setRssLoading(false); }
  }, []);

  useEffect(() => { fetchNews(); fetchRSS(); }, [fetchNews, fetchRSS]);

  const grouped = new Map<number, NewsItem[]>();
  for (const item of news) {
    const y = yearFromDate(item.date);
    if (!y) continue;
    if (!grouped.has(y)) grouped.set(y, []);
    grouped.get(y)!.push(item);
  }
  const years = Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]);

  const displayedItems = showSaved ? rssItems.filter((i) => saved.has(i.pmid)) : rssItems;
  const savedCount = rssItems.filter((i) => saved.has(i.pmid)).length;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-16 sm:py-20 md:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-4 py-2 text-sm font-medium text-blue-800 dark:text-blue-300">
              <Newspaper className="h-4 w-4" />
              Latest updates
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">News &amp; Updates</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Lab milestones, research highlights, and the latest in AI-driven drug discovery.
            </p>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] dark:opacity-[0.04]" />
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 space-y-12">

        {/* ── Research News ─────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Rss className="h-6 w-6" />}
            title="Research News"
            badge={
              <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Live feed
              </span>
            }
            open={researchOpen}
            onToggle={() => setResearchOpen((v) => !v)}
          />

          <AnimatePresence initial={false}>
            {researchOpen && (
              <motion.div
                key="research-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                {/* Description + links row */}
                <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
                    Latest publications ranked by relevance to AI.MED lab focus (0–100 score).
                    Sourced from PubMed · AI Drug Discovery · Systems Pharmacology · Biomedical Informatics.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {savedCount > 0 && (
                      <button
                        onClick={() => setShowSaved((v) => !v)}
                        className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          showSaved
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                        }`}
                      >
                        <BookmarkCheck className="h-3.5 w-3.5" />
                        Saved ({savedCount})
                      </button>
                    )}
                    <a
                      href={RSS_FEED_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 px-3 py-1 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors"
                      title="Subscribe to RSS feed"
                    >
                      <Rss className="h-3.5 w-3.5" />
                      Subscribe RSS
                    </a>
                  </div>
                </div>

                {/* Explicit feed URL */}
                <div className="mb-5 flex items-center gap-2 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                  <LinkIcon className="h-3.5 w-3.5 shrink-0 text-orange-500" />
                  <span className="font-medium mr-1 text-slate-600 dark:text-slate-300">RSS Feed:</span>
                  <a
                    href={RSS_FEED_URL}
                    className="truncate text-orange-600 dark:text-orange-400 hover:underline font-mono"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {RSS_FEED_URL}
                  </a>
                </div>

                {rssLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                  </div>
                ) : displayedItems.length === 0 ? (
                  <p className="py-10 text-center text-slate-400">
                    {showSaved ? "No saved articles yet." : "Unable to load research feed."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {displayedItems.map((item, i) => (
                      <motion.div
                        key={item.pmid}
                        variants={fadeUp}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                            <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                              <ScoreBadge score={item.score} />
                              {item.pubdate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatPubDate(item.pubdate)}
                                </span>
                              )}
                              <span className="rounded bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 text-[10px] text-blue-600 dark:text-blue-400">
                                {item.topic}
                              </span>
                              {item.journal && (
                                <span className="italic text-[10px]">{item.journal}</span>
                              )}
                            </div>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-slate-900 dark:text-slate-100 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors leading-snug"
                            >
                              {item.title}
                            </a>
                            {item.authors && (
                              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                {item.authors}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-3">
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                              >
                                <ExternalLink className="h-3 w-3" /> PubMed
                              </a>
                              {item.doi && (
                                <a
                                  href={`https://doi.org/${item.doi}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                                >
                                  <ExternalLink className="h-3 w-3" /> DOI
                                </a>
                              )}
                              <a
                                href={RSS_FEED_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 hover:text-orange-600 dark:text-orange-400"
                                title="RSS Feed"
                              >
                                <Rss className="h-3 w-3" /> RSS
                              </a>
                              <button
                                onClick={() => toggleSave(item.pmid)}
                                className={`ml-auto inline-flex items-center gap-1 text-xs font-medium transition-colors ${
                                  saved.has(item.pmid)
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                }`}
                                title={saved.has(item.pmid) ? "Remove from saved" : "Save for later"}
                              >
                                {saved.has(item.pmid) ? (
                                  <BookmarkCheck className="h-3.5 w-3.5" />
                                ) : (
                                  <Bookmark className="h-3.5 w-3.5" />
                                )}
                                {saved.has(item.pmid) ? "Saved" : "Save"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── Lab News ─────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Newspaper className="h-6 w-6" />}
            title="Lab News"
            open={labOpen}
            onToggle={() => setLabOpen((v) => !v)}
          />

          <AnimatePresence initial={false}>
            {labOpen && (
              <motion.div
                key="lab-body"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                  Grants, honors, publications, and milestones from AI.MED and Prof. Jake Y. Chen.
                </p>

                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
                  </div>
                ) : news.length === 0 ? (
                  <p className="py-10 text-center text-slate-400">No news items found.</p>
                ) : (
                  <div className="space-y-12">
                    {years.map(([year, items]) => (
                      <div key={year}>
                        <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">{year}</h3>
                        <div className="space-y-4">
                          {items.map((item, i) => (
                            <motion.div
                              key={item.id}
                              variants={fadeUp}
                              custom={i}
                              initial="hidden"
                              whileInView="visible"
                              viewport={{ once: true }}
                              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow dark:border-zinc-800 dark:bg-zinc-900"
                            >
                              <div className="flex items-start gap-4">
                                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
                                  <Newspaper className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="mb-1 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(item.date)}
                                  </div>
                                  <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                    {item.headline}
                                  </h4>
                                  {item.summary && (
                                    <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                                      {item.summary}
                                    </p>
                                  )}
                                  {item.link && (
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                                    >
                                      <ExternalLink className="h-3 w-3" /> Read more
                                    </a>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
