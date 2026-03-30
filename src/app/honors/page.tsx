"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Trophy, Loader2, ChevronDown, ChevronUp } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Honor {
  id: number;
  awardName: string;
  year: number | null;
  category: string | null;
  issuer: string | null;
  description: string | null;
}

const categories = ["All", "International", "National", "Regional", "University"];

/** Split award name into main text and parenthetical footnote */
function splitAwardName(name: string): { main: string; footnote: string | null } {
  const match = name.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (match) return { main: match[1].trim(), footnote: match[2].trim() };
  return { main: name, footnote: null };
}

const categoryColors: Record<string, string> = {
  International:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  National:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Regional:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  University:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
};

const categoryOrder: Record<string, number> = {
  International: 0,
  National: 1,
  Regional: 2,
  University: 3,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function groupByCategory(
  honors: Honor[]
): { category: string; honors: Honor[] }[] {
  const map = new Map<string, Honor[]>();
  for (const honor of honors) {
    const cat = honor.category || "Other";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(honor);
  }
  // Sort each group by year descending
  for (const group of map.values()) {
    group.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
  }
  return Array.from(map.entries())
    .sort(
      (a, b) =>
        (categoryOrder[a[0]] ?? 99) - (categoryOrder[b[0]] ?? 99)
    )
    .map(([category, honors]) => ({ category, honors }));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HonorsPage() {
  const [honors, setHonors] = useState<Honor[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchHonors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All")
        params.set("category", selectedCategory);
      const res = await fetch(`/api/honors?${params}`);
      const data = await res.json();
      setHonors(data.honors || []);
      setTotal(data.total || 0);
    } catch {
      setHonors([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchHonors();
  }, [fetchHonors]);

  const grouped = groupByCategory(honors);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-16 sm:py-20 md:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-amber-100 dark:bg-amber-900/40 px-4 py-2 text-sm font-medium text-amber-800 dark:text-amber-300">
              <Award className="h-4 w-4" />
              Recognition &amp; Achievement
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Honors &amp; Awards
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Fellowships, distinguished awards, and professional recognition
              spanning two decades of research excellence.
            </p>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] dark:opacity-[0.04]" />
      </section>

      {/* Filters */}
      <section className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                  selectedCategory === cat
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
                }`}
              >
                {cat}
              </button>
            ))}
            {!loading && (
              <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {total}
                </span>{" "}
                honor{total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-10 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : honors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-400 dark:text-slate-500">
              No honors found for the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ category, honors: catHonors }) => (
              <CategorySection key={category} category={category} count={catHonors.length}>

                <div className="relative ml-4 border-l-2 border-emerald-200 pl-8 dark:border-emerald-800">
                  <AnimatePresence>
                    {catHonors.map((honor, i) => (
                      <motion.div
                        key={honor.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.08 }}
                        className="relative mb-10 last:mb-0"
                      >
                        {/* Timeline dot */}
                        <div className="absolute -left-[calc(2rem+5px)] flex h-4 w-4 items-center justify-center rounded-full border-2 border-emerald-700 bg-white dark:bg-zinc-950">
                          <div className="h-2 w-2 rounded-full bg-emerald-700" />
                        </div>

                        {/* Year badge */}
                        {honor.year && (
                          <span className="mb-2 inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                            {honor.year}
                          </span>
                        )}

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                          {(() => {
                            const { main, footnote } = splitAwardName(honor.awardName);
                            return (
                              <>
                                <div className="mb-1 flex items-start gap-2">
                                  <Trophy className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                    {main}
                                  </h3>
                                </div>
                                {footnote && (
                                  <p className="ml-7 text-[11px] leading-snug text-slate-400 dark:text-slate-500">
                                    {footnote}
                                  </p>
                                )}
                              </>
                            );
                          })()}
                          {honor.issuer && (
                            <p className="mb-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                              {honor.issuer}
                            </p>
                          )}
                          {honor.description && (
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                              {honor.description}
                            </p>
                          )}
                          {honor.category && (
                            <div className="mt-3">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                                  categoryColors[honor.category] ??
                                  "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300"
                                }`}
                              >
                                {honor.category}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </CategorySection>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CategorySection({ category, count, children }: { category: string; count: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="mb-4 flex w-full items-center gap-3 text-left"
      >
        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {category}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            categoryColors[category] ??
            "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300"
          }`}
        >
          {count}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
