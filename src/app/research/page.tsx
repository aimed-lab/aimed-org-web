"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Pill,
  Network,
  BarChart3,
  Users,
  Database,
  Microscope,
  Brain,
  FlaskConical,
  Layers,
  Server,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

interface TimelineEvent {
  year: string;
  label: string;
}

interface Lineage {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  methods: string[];
  seminalPapers: { title: string; year: string }[];
  tools: string[];
  timeline: TimelineEvent[];
  color: string;
}

const lineages: Lineage[] = [
  {
    id: "pharmacology",
    icon: <Pill className="h-7 w-7" />,
    title: "Systems Pharmacology & Drug Discovery",
    description:
      "Computational identification of drug targets, molecular modeling, and AI-driven therapeutic development. This lineage spans from early network pharmacology approaches through modern deep-learning generative models for molecular design.",
    methods: [
      "Network pharmacology",
      "Molecular docking & dynamics",
      "Generative chemistry (VAE / GAN)",
      "Drug repurposing algorithms",
      "ADMET prediction",
    ],
    seminalPapers: [
      { title: "Network-based Drug Repurposing for Human Coronavirus", year: "2020" },
      { title: "Deep Learning Approaches for Protein Structure Prediction", year: "2023" },
      { title: "AI-Driven Multi-Target Drug Design for Complex Diseases", year: "2024" },
    ],
    tools: ["DrugRepoNet", "MolGraphNet", "TargetHunter"],
    timeline: [
      { year: "2012", label: "Network pharmacology framework" },
      { year: "2016", label: "Large-scale docking pipelines" },
      { year: "2020", label: "COVID drug repurposing" },
      { year: "2023", label: "Generative molecular design" },
      { year: "2025", label: "Multi-target AI therapeutics" },
    ],
    color: "blue",
  },
  {
    id: "knowledge-networks",
    icon: <Network className="h-7 w-7" />,
    title: "Biomedical Knowledge Networks & Data Ecosystems",
    description:
      "Construction and reasoning over large-scale knowledge graphs, biomedical ontologies, and semantic integration pipelines. This lineage drives our ability to connect disparate data sources into coherent, queryable ecosystems.",
    methods: [
      "Knowledge graph embedding",
      "Ontology alignment",
      "Biomedical NLP & text mining",
      "Semantic web technologies",
      "Link prediction",
    ],
    seminalPapers: [
      { title: "Biomedical Knowledge Graph Construction and Applications", year: "2022" },
      { title: "Ontology-Guided Integration of Multi-Source Biomedical Data", year: "2021" },
      { title: "Large Language Models for Biomedical Knowledge Extraction", year: "2024" },
    ],
    tools: ["BioKG Builder", "OntoAlign", "SemMedExtract"],
    timeline: [
      { year: "2013", label: "Biomedical text mining tools" },
      { year: "2017", label: "Knowledge graph v1" },
      { year: "2021", label: "Ontology integration platform" },
      { year: "2023", label: "LLM-augmented extraction" },
      { year: "2025", label: "Federated knowledge ecosystems" },
    ],
    color: "emerald",
  },
  {
    id: "multiomics",
    icon: <BarChart3 className="h-7 w-7" />,
    title: "Multi-omics, Visualization & Interpretable AI",
    description:
      "Pioneering visual analytics for high-dimensional biological data, including the GeneTerrainMap platform. This lineage is grounded in the belief that interpretability is not optional -- every model must explain itself.",
    methods: [
      "Dimensionality reduction (t-SNE, UMAP)",
      "Terrain-based visualization",
      "SHAP / attention-based explainability",
      "Multi-omics factor analysis",
      "Interactive dashboards",
    ],
    seminalPapers: [
      { title: "GeneTerrainMap: Terrain-based Visualization of Gene Expression Data", year: "2019" },
      { title: "Interpretable Deep Learning for Multi-omics Cancer Subtypes", year: "2022" },
      { title: "Multi-omics Integration for Precision Oncology", year: "2024" },
    ],
    tools: ["GeneTerrainMap", "OmicsLens", "XAI-Omics"],
    timeline: [
      { year: "2014", label: "Early gene expression visualization" },
      { year: "2019", label: "GeneTerrainMap release" },
      { year: "2022", label: "Explainable multi-omics ML" },
      { year: "2024", label: "Real-time interactive analytics" },
      { year: "2026", label: "Foundation model interpretability" },
    ],
    color: "violet",
  },
  {
    id: "digital-twins",
    icon: <Users className="h-7 w-7" />,
    title: "Digital Twins & Precision Medicine",
    description:
      "Building patient-level computational models that fuse genomics, phenomics, and clinical data into personalized digital twins. These multi-scale simulations enable in-silico clinical trials and individualized treatment optimization.",
    methods: [
      "Agent-based modeling",
      "Physiologically-based PK/PD",
      "Bayesian patient stratification",
      "Multi-scale simulation",
      "Causal inference",
    ],
    seminalPapers: [
      { title: "Digital Twin Framework for Personalized Cancer Therapy", year: "2023" },
      { title: "Multi-Scale Computational Modeling of Drug Response", year: "2021" },
      { title: "Patient Stratification via Integrative Bayesian Networks", year: "2020" },
    ],
    tools: ["TwinSim", "PrecisionRx", "PatientGraph"],
    timeline: [
      { year: "2016", label: "PK/PD modeling pipelines" },
      { year: "2020", label: "Patient stratification models" },
      { year: "2023", label: "Digital twin framework" },
      { year: "2025", label: "In-silico trial simulations" },
      { year: "2026", label: "Real-time adaptive twins" },
    ],
    color: "amber",
  },
  {
    id: "infrastructure",
    icon: <Database className="h-7 w-7" />,
    title: "Translational Data Infrastructure",
    description:
      "Designing and deploying the data platforms, clinical informatics systems, and research-to-bedside pipelines that underpin every other lineage. Infrastructure is the invisible backbone that turns ideas into patient impact.",
    methods: [
      "FHIR / HL7 interoperability",
      "ETL & data harmonization",
      "Cloud-native data lakes",
      "REDCap / i2b2 integration",
      "Regulatory-compliant ML pipelines",
    ],
    seminalPapers: [
      { title: "Scalable Clinical Data Platforms for Learning Health Systems", year: "2021" },
      { title: "FAIR Principles Applied to Biomedical Research Data", year: "2019" },
      { title: "Federated Analytics for Multi-Site Clinical Studies", year: "2024" },
    ],
    tools: ["BioDataHub", "ClinConnect", "FAIR-Pipe"],
    timeline: [
      { year: "2015", label: "First clinical data warehouse" },
      { year: "2019", label: "FAIR data platform" },
      { year: "2021", label: "Cloud-native data lake" },
      { year: "2024", label: "Federated analytics layer" },
      { year: "2026", label: "AI-ready research fabric" },
    ],
    color: "rose",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; dot: string; light: string }> = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-600 dark:border-blue-400",
    dot: "bg-blue-600 dark:bg-blue-400",
    light: "bg-blue-50 dark:bg-blue-950/40",
  },
  emerald: {
    bg: "bg-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-600 dark:border-emerald-400",
    dot: "bg-emerald-600 dark:bg-emerald-400",
    light: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  violet: {
    bg: "bg-violet-600",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-600 dark:border-violet-400",
    dot: "bg-violet-600 dark:bg-violet-400",
    light: "bg-violet-50 dark:bg-violet-950/40",
  },
  amber: {
    bg: "bg-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-600 dark:border-amber-400",
    dot: "bg-amber-600 dark:bg-amber-400",
    light: "bg-amber-50 dark:bg-amber-950/40",
  },
  rose: {
    bg: "bg-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-600 dark:border-rose-400",
    dot: "bg-rose-600 dark:bg-rose-400",
    light: "bg-rose-50 dark:bg-rose-950/40",
  },
};

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ------------------------------------------------------------------ */
/*  Components                                                        */
/* ------------------------------------------------------------------ */

function TimelineStrip({ events, color }: { events: TimelineEvent[]; color: string }) {
  const c = colorMap[color];
  return (
    <div className="relative mt-6 pl-4">
      {/* vertical line */}
      <div className={`absolute left-[7px] top-0 bottom-0 w-0.5 ${c.bg} opacity-30`} />
      <motion.ul variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="space-y-4">
        {events.map((ev, i) => (
          <motion.li key={ev.year} variants={fadeUp} custom={i} className="relative flex items-start gap-3">
            <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${c.dot} ring-2 ring-white dark:ring-zinc-950`} />
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${c.text}`}>{ev.year}</span>
              <p className="text-sm text-slate-700 dark:text-slate-300">{ev.label}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}

function LineageSection({ lineage, index }: { lineage: Lineage; index: number }) {
  const c = colorMap[lineage.color];
  const isEven = index % 2 === 0;

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={fadeUp}
      custom={0}
      className="py-16 md:py-24"
    >
      <div className={`mx-auto max-w-6xl px-6 lg:px-8 grid gap-12 md:grid-cols-2 items-start ${isEven ? "" : "md:[direction:rtl]"}`}>
        {/* Text column */}
        <div className={isEven ? "" : "md:[direction:ltr]"}>
          <div className="flex items-center gap-3 mb-4">
            <span className={`flex items-center justify-center h-12 w-12 rounded-xl ${c.light} ${c.text}`}>
              {lineage.icon}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{lineage.title}</h2>
          </div>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400 mb-6">{lineage.description}</p>

          {/* Methods */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">Key Methods</h3>
          <ul className="flex flex-wrap gap-2 mb-6">
            {lineage.methods.map((m) => (
              <li key={m} className="rounded-full bg-slate-100 dark:bg-zinc-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                {m}
              </li>
            ))}
          </ul>

          {/* Seminal papers */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">Seminal Papers</h3>
          <ul className="space-y-2 mb-6">
            {lineage.seminalPapers.map((p) => (
              <li key={p.title} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 ${c.text}`} />
                <span>
                  {p.title} <span className="text-slate-400">({p.year})</span>
                </span>
              </li>
            ))}
          </ul>

          {/* Tools */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">Related Tools</h3>
          <div className="flex flex-wrap gap-2">
            {lineage.tools.map((t) => (
              <span key={t} className={`rounded-md border ${c.border} px-2.5 py-0.5 text-xs font-semibold ${c.text}`}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline column */}
        <div className={isEven ? "" : "md:[direction:ltr]"}>
          <div className={`rounded-2xl border border-slate-200 dark:border-zinc-800 ${c.light} p-6`}>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Lineage Evolution</h3>
            <TimelineStrip events={lineage.timeline} color={lineage.color} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-28 md:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl"
          >
            Research Program
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            Our intellectual program weaves five interconnected research lineages -- from molecular
            modeling to bedside data infrastructure -- into a unified effort to make AI truly useful
            in medicine. Each lineage builds on a decade of cumulative insight and feeds directly
            into the others.
          </motion.p>
        </div>
        {/* Decorative grid */}
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] dark:opacity-[0.04]" />
      </section>

      {/* Lineage sections */}
      {lineages.map((l, i) => (
        <div key={l.id}>
          <LineageSection lineage={l} index={i} />
          {i < lineages.length - 1 && (
            <hr className="mx-auto max-w-5xl border-slate-200 dark:border-zinc-800" />
          )}
        </div>
      ))}

      {/* Cross-lineage callout */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        custom={0}
        className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-zinc-950 dark:to-zinc-900"
      >
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">Cross-Lineage Synergies</h2>
          <p className="text-base leading-relaxed text-slate-600 dark:text-slate-400">
            The power of the AI.MED lab lies in the intersections: knowledge graphs feed drug
            discovery models, digital twins consume multi-omics visualizations, and every insight
            travels through our translational data infrastructure on its way to patient care. We
            design our research program so that progress in one lineage accelerates all the others.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
