"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Calendar,
  ExternalLink,
  Loader2,
  Rss,
  FlaskConical,
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
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function formatPubDate(dateStr: string): string {
  if (!dateStr) return "";
  // PubMed returns "2026 Mar 14" or "2026 Apr" — parse safely
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

function yearFromDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const m = dateStr.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [rssItems, setRssItems] = useState<ResearchNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rssLoading, setRssLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(Array.isArray(data) ? data : data.news || []);
    } catch {
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRSS = useCallback(async () => {
    setRssLoading(true);
    try {
      const res = await fetch("/api/research-news");
      const data = await res.json();
      setRssItems(Array.isArray(data) ? data : []);
    } catch {
      setRssItems([]);
    } finally {
      setRssLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    fetchRSS();
  }, [fetchNews, fetchRSS]);

  // Group lab news by year
  const grouped = new Map<number, NewsItem[]>();
  for (const item of news) {
    const y = yearFromDate(item.date);
    if (!y) continue;
    if (!grouped.has(y)) grouped.set(y, []);
    grouped.get(y)!.push(item);
  }
  const years = Array.from(grouped.entries()).sort((a, b) => b[0] - a[0]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-teal-800 py-16 sm:py-20 md:py-24 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Newspaper className="mx-auto mb-4 h-12 w-12 opacity-80" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              News &amp; Updates
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
              Lab milestones, research highlights, and the latest in AI-driven drug discovery.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6 py-16 space-y-20">

        {/* ── Research News (RSS) ─────────────────────────────────── */}
        <section>
          <div className="mb-8 flex items-center gap-3">
            <Rss className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Research News</h2>
            <span className="rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Live feed
            </span>
          </div>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Latest publications in AI-driven drug discovery and biomedical informatics, sourced from PubMed.
          </p>

          {rssLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
            </div>
          ) : rssItems.length === 0 ? (
            <p className="py-10 text-center text-slate-400">Unable to load research feed.</p>
          ) : (
            <div className="space-y-3">
              {rssItems.map((item, i) => (
                <motion.div
                  key={item.pmid}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <FlaskConical className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
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
                          <ExternalLink className="h-3 w-3" />
                          PubMed
                        </a>
                        {item.doi && (
                          <a
                            href={`https://doi.org/${item.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                            DOI
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Lab News ────────────────────────────────────────────── */}
        <section>
          <div className="mb-8 flex items-center gap-3">
            <Newspaper className="h-6 w-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lab News</h2>
          </div>
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
                  <h3 className="mb-6 text-xl font-bold text-slate-900 dark:text-slate-100">
                    {year}
                  </h3>
                  <div className="space-y-4">
                    {items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        variants={fadeUp}
                        custom={i}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
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
                                <ExternalLink className="h-3 w-3" />
                                Read more
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
        </section>
      </div>
    </div>
  );
}
