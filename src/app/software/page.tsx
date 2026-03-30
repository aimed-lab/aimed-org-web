"use client";

import { motion } from "framer-motion";
import {
  Code2,
  ExternalLink,
  GitFork,
  FileText,
  Tag,
  ArrowRight,
  Shield,
  Package,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const tools = [
  {
    name: "GeneTerrainMap",
    description:
      "A terrain-based visualization system that transforms high-dimensional gene expression data into intuitive 3D landscape maps, enabling researchers to identify expression patterns and clusters at a glance.",
    category: "Visualization",
    website: "https://aimed-lab.org/geneterrainmap",
    github: "https://github.com/aimed-lab/GeneTerrainMap",
    paper: "https://doi.org/10.1093/bioinformatics/example1",
  },
  {
    name: "HAPPI",
    description:
      "Human Annotated Protein-Protein Interactions database -- a comprehensive, quality-scored resource of human protein interactions curated from multiple experimental and computational sources.",
    category: "Database",
    website: "https://aimed-lab.org/happi",
    github: "https://github.com/aimed-lab/HAPPI",
    paper: "https://doi.org/10.1093/nar/example2",
  },
  {
    name: "DrugSIGNS",
    description:
      "Drug discovery platform leveraging network-based gene expression signatures to identify potential drug repurposing candidates and predict drug-disease associations using transcriptomic data.",
    category: "Drug Discovery",
    website: "https://aimed-lab.org/drugsigns",
    github: "https://github.com/aimed-lab/DrugSIGNS",
    paper: "https://doi.org/10.1093/bioinformatics/example3",
  },
  {
    name: "BioKG Explorer",
    description:
      "An interactive biomedical knowledge graph exploration platform that integrates heterogeneous data sources to enable hypothesis generation and multi-hop reasoning across biological entities.",
    category: "Knowledge Graph",
    website: "https://aimed-lab.org/biokg",
    github: "https://github.com/aimed-lab/BioKG-Explorer",
    paper: "https://doi.org/10.1038/example4",
  },
  {
    name: "OmicsViz",
    description:
      "A multi-omics data visualization toolkit for integrating and exploring genomics, proteomics, metabolomics, and clinical data through coordinated interactive visual analytics.",
    category: "Visualization",
    website: "https://aimed-lab.org/omicsviz",
    github: "https://github.com/aimed-lab/OmicsViz",
    paper: "https://doi.org/10.1093/bioinformatics/example5",
  },
  {
    name: "DigitalTwin-Rx",
    description:
      "A patient digital twin framework for predicting individualized drug responses by integrating multi-omics profiles, clinical records, and pharmacological knowledge graphs.",
    category: "Precision Medicine",
    website: "https://aimed-lab.org/digitaltwin-rx",
    github: "https://github.com/aimed-lab/DigitalTwin-Rx",
    paper: "https://doi.org/10.1038/example6",
  },
];

const patents = [
  {
    title: "System and Method for Terrain-Based Visualization of Gene Expression Data",
    number: "US Patent 10,XXX,XXX",
    year: 2020,
    status: "Granted",
  },
  {
    title: "Network-Based Drug Repurposing Using Multi-Scale Biological Signatures",
    number: "US Patent 11,XXX,XXX",
    year: 2022,
    status: "Granted",
  },
  {
    title: "Patient Digital Twin Construction from Multi-Omics Data for Drug Response Prediction",
    number: "US Patent App. 17/XXX,XXX",
    year: 2023,
    status: "Pending",
  },
];

const categoryColors: Record<string, string> = {
  Visualization: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  Database: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Drug Discovery": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  "Knowledge Graph": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "Precision Medicine": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SoftwarePage() {
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
              Open-source tools for biomedicine
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Software &amp; Resources
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Building deployable tools that bridge the gap between computational research and real-world biomedical impact.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Tools &amp; Platforms
          </h2>
          <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
            Software developed by the AI.MED lab -- freely available to the research community
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
                  <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    categoryColors[tool.category] ?? "bg-slate-100 text-slate-700"
                  }`}
                >
                  {tool.category}
                </span>
              </div>

              <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                {tool.name}
              </h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {tool.description}
              </p>

              <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-zinc-800">
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Website
                </a>
                <a
                  href={tool.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <GitFork className="h-3.5 w-3.5" />
                  GitHub
                </a>
                <a
                  href={tool.paper}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Paper
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Patents */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              Patents
            </h2>
            <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
              Intellectual property developed from our research
            </p>
          </motion.div>

          <div className="space-y-4">
            {patents.map((patent, i) => (
              <motion.div
                key={patent.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.08 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {patent.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {patent.number} &middot; {patent.year}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-0.5 text-xs font-medium ${
                      patent.status === "Granted"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                    }`}
                  >
                    {patent.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
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
            href="mailto:jakechen@uab.edu"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            Get in Touch
            <ArrowRight className="h-4 w-4" />
          </a>
        </motion.div>
      </section>
    </div>
  );
}
