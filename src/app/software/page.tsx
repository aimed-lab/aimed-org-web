"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  ExternalLink,
  Shield,
  Loader2,
  ArrowRight,
  GitFork,
  FileText,
  Network,
  Database,
  BarChart3,
  Microscope,
  FlaskConical,
  Waypoints,
  Eye,
  Users,
  Globe,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SoftwareTool {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  githubUrl: string | null;
  relatedPapers: string | null;
  category: string | null;
}

interface Patent {
  id: number;
  title: string;
  year: number | null;
  inventors: string | null;
  filingInfo: string | null;
}

interface PaperRef {
  doi: string;
  title: string;
}

/* ------------------------------------------------------------------ */
/*  Category icon + color map                                          */
/* ------------------------------------------------------------------ */

const categoryConfig: Record<string, { icon: typeof Network; color: string; bgColor: string }> = {
  "Network Analysis": { icon: Network, color: "text-violet-600 dark:text-violet-400", bgColor: "bg-violet-50 dark:bg-violet-900/30" },
  "Pathway Analysis": { icon: Waypoints, color: "text-emerald-600 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-900/30" },
  "Single-cell Analysis": { icon: Microscope, color: "text-pink-600 dark:text-pink-400", bgColor: "bg-pink-50 dark:bg-pink-900/30" },
  "Statistical Analysis": { icon: BarChart3, color: "text-amber-600 dark:text-amber-400", bgColor: "bg-amber-50 dark:bg-amber-900/30" },
  "Knowledge Networks": { icon: Users, color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-900/30" },
  "Disease Databases": { icon: Database, color: "text-red-600 dark:text-red-400", bgColor: "bg-red-50 dark:bg-red-900/30" },
  "Protein Interactions": { icon: Globe, color: "text-cyan-600 dark:text-cyan-400", bgColor: "bg-cyan-50 dark:bg-cyan-900/30" },
  "Drug Discovery": { icon: FlaskConical, color: "text-orange-600 dark:text-orange-400", bgColor: "bg-orange-50 dark:bg-orange-900/30" },
  "Visualization": { icon: Eye, color: "text-indigo-600 dark:text-indigo-400", bgColor: "bg-indigo-50 dark:bg-indigo-900/30" },
  "Expression Databases": { icon: Database, color: "text-teal-600 dark:text-teal-400", bgColor: "bg-teal-50 dark:bg-teal-900/30" },
  "Proteomics": { icon: Microscope, color: "text-fuchsia-600 dark:text-fuchsia-400", bgColor: "bg-fuchsia-50 dark:bg-fuchsia-900/30" },
};

const defaultConfig = { icon: Code2, color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-50 dark:bg-emerald-900/30" };

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SoftwarePage() {
  const [tools, setTools] = useState<SoftwareTool[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("All");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [swRes, patRes] = await Promise.all([
        fetch("/api/software"),
        fetch("/api/patents"),
      ]);
      const swData = await swRes.json();
      const patData = await patRes.json();
      setTools(swData.software || []);
      setPatents(patData.patents || []);
    } catch {
      setTools([]);
      setPatents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const categories = ["All", ...Array.from(new Set(tools.map((t) => t.category).filter(Boolean))) as string[]];
  const filtered = filter === "All" ? tools : tools.filter((t) => t.category === filter);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 py-16 sm:py-20 md:py-24 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/3 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/3 bottom-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Code2 className="h-4 w-4" />
              Tools for biomedicine
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Software &amp; Resources
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
              {tools.length} research tools, databases, and platforms developed
              across two decades of biomedical informatics research.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        {/* Category filter */}
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filter === cat
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((tool, i) => {
              const config = categoryConfig[tool.category || ""] || defaultConfig;
              const Icon = config.icon;
              const papers: PaperRef[] = tool.relatedPapers ? JSON.parse(tool.relatedPapers) : [];

              return (
                <motion.div
                  key={tool.id}
                  variants={fadeUp}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  {/* Graphical abstract header */}
                  <div className={`flex items-center justify-center rounded-t-xl ${config.bgColor} py-8`}>
                    <div className="relative">
                      <Icon className={`h-16 w-16 ${config.color} opacity-80`} strokeWidth={1} />
                      <div className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm dark:bg-zinc-800`}>
                        <Code2 className={`h-3.5 w-3.5 ${config.color}`} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-5">
                    {/* Category badge */}
                    {tool.category && (
                      <span className={`mb-2 inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${config.bgColor} ${config.color}`}>
                        {tool.category}
                      </span>
                    )}

                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-slate-100">
                      {tool.name}
                    </h3>

                    {tool.description && (
                      <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {tool.description}
                      </p>
                    )}

                    {/* Links row */}
                    <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800">
                      {tool.url && (
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Launch
                        </a>
                      )}
                      {tool.githubUrl && (
                        <a
                          href={tool.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
                        >
                          <GitFork className="h-3 w-3" />
                          GitHub
                        </a>
                      )}
                      {papers.map((p) => (
                        <a
                          key={p.doi}
                          href={`https://doi.org/${p.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
                          title={p.title}
                        >
                          <FileText className="h-3 w-3" />
                          Paper
                        </a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Patents */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Patents
          </h2>
          <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
            {patents.length} patents from research discoveries
          </p>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {patents.map((patent, i) => (
                <motion.div
                  key={patent.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.08 }}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start gap-3">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {patent.title}
                      </h3>
                      {patent.year && (
                        <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {patent.year}
                        </span>
                      )}
                      {patent.filingInfo && (
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {patent.filingInfo}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
            Interested in Collaborating?
          </h2>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            We welcome collaborations on tool development, data integration, and translational applications.
          </p>
          <a
            href="/join"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-800"
          >
            Inquire About Opportunities
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
