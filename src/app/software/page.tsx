"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Code2,
  ExternalLink,
  Shield,
  Package,
  Loader2,
  ArrowRight,
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
  category: string | null;
}

interface Patent {
  id: number;
  title: string;
  year: number | null;
  inventors: string | null;
  filingInfo: string | null;
}

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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-white">
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
              Software &amp; Patents
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Research tools, databases, and intellectual property developed
              across two decades of biomedical informatics research.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
          Software &amp; Databases
        </h2>
        <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
          {tools.length} tools developed by the lab and collaborators
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {tool.name}
                </h3>
                {tool.description && (
                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-3">
                    {tool.description}
                  </p>
                )}

                {tool.url && (
                  <div className="mt-auto border-t border-slate-100 pt-4 dark:border-zinc-800">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Visit Tool
                    </a>
                  </div>
                )}
              </motion.div>
            ))}
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
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
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
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {patent.title}
                      </h3>
                      {patent.year && (
                        <span className="mt-1 inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
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
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            Inquire About Opportunities
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
