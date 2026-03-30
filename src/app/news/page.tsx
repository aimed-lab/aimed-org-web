"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Calendar,
  ExternalLink,
  Loader2,
} from "lucide-react";

interface NewsItem {
  id: number;
  date: string | null;
  headline: string;
  summary: string | null;
  link: string | null;
  pinned: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + (dateStr.includes("T") ? "" : "T00:00:00"));
  if (isNaN(d.getTime())) return "";
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
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // Group by year
  const grouped = new Map<number, NewsItem[]>();
  for (const item of news) {
    const y = yearFromDate(item.date);
    if (!y) continue;
    if (!grouped.has(y)) grouped.set(y, []);
    grouped.get(y)!.push(item);
  }
  const years = Array.from(grouped.entries())
    .sort((a, b) => b[0] - a[0]);

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
              Grants, honors, publications, and milestones from
              AI.MED and Prof. Jake Y. Chen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Timeline */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : news.length === 0 ? (
          <p className="py-20 text-center text-slate-400">No news items found.</p>
        ) : (
          <div className="space-y-12">
            {years.map(([year, items]) => (
              <div key={year}>
                <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {year}
                </h2>
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
                          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                            {item.headline}
                          </h3>
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
  );
}
