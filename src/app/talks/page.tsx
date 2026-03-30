"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MapPin,
  Calendar,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Talk {
  id: number;
  title: string;
  venue: string | null;
  host: string | null;
  city: string | null;
  country: string | null;
  date: string | null;
  talkType: string | null;
  slidesUrl: string | null;
  videoUrl: string | null;
  topic: string | null;
}

const talkTypes = ["All", "Keynote", "Panel", "Invited"];

const typeColors: Record<string, string> = {
  Keynote:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Panel:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Invited:
    "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function yearFromDate(dateStr: string | null): number | null {
  if (!dateStr) return null;
  // Parse year directly to avoid timezone issues (e.g. "2025-01-01" becoming 2024 in US timezones)
  const m = dateStr.match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function groupByYear(talks: Talk[]): { year: number; talks: Talk[] }[] {
  const map = new Map<number, Talk[]>();
  for (const talk of talks) {
    const y = yearFromDate(talk.date);
    if (!y) continue; // Skip talks without a year
    if (!map.has(y)) map.set(y, []);
    map.get(y)!.push(talk);
  }
  return Array.from(map.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, talks]) => ({ year, talks }));
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function TalksPage() {
  const [talks, setTalks] = useState<Talk[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("All");

  const fetchTalks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType !== "All") params.set("type", selectedType);
      const res = await fetch(`/api/talks?${params}`);
      const data = await res.json();
      setTalks(data.talks || []);
      setTotal(data.total || 0);
    } catch {
      setTalks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedType]);

  useEffect(() => {
    fetchTalks();
  }, [fetchTalks]);

  const grouped = groupByYear(talks);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-28 md:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-900/40 px-4 py-2 text-sm font-medium text-blue-800 dark:text-blue-300">
              <Mic className="h-4 w-4" />
              Sharing knowledge worldwide
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Invited Talks
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              200+ invited talks at conferences, symposia, and institutions
              around the world.
            </p>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] dark:opacity-[0.04]" />
      </section>

      {/* Filters */}
      <section className="border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {talkTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
                  selectedType === type
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
                }`}
              >
                {type}
              </button>
            ))}
            {!loading && (
              <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {total}
                </span>{" "}
                talk{total !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-10 pb-24">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : talks.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-400 dark:text-slate-500">
              No talks found for the selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {grouped.map(({ year, talks: yearTalks }) => (
              <div key={year}>
                <h2 className="mb-5 text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {year || "Unknown Year"}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
                  <AnimatePresence>
                    {yearTalks.map((talk, i) => (
                      <motion.div
                        key={talk.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.06 }}
                        className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                      >
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
                            {talk.title}
                          </h3>
                          {talk.talkType && (
                            <span
                              className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                typeColors[talk.talkType] ??
                                "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-slate-300"
                              }`}
                            >
                              {talk.talkType}
                            </span>
                          )}
                        </div>
                        {talk.venue && (
                          <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                            {talk.venue}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          {(talk.city || talk.country) && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {[talk.city, talk.country]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          )}
                          {talk.date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(talk.date)}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
