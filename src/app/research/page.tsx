"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Pill,
  Network,
  BarChart3,
  Users,
  Database,
  ChevronRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data — all derived from Prof. Chen's CV publications       */
/* ------------------------------------------------------------------ */

interface Lineage {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  methods: string[];
  representativePapers: { title: string; year: string }[];
  tools: string[];
  color: string;
}

const lineages: Lineage[] = [
  {
    id: "pharmacology",
    icon: <Pill className="h-7 w-7" />,
    title: "Systems Pharmacology & Drug Discovery",
    description:
      "Computational identification of drug targets, AI-driven therapeutic development, and drug repurposing using network pharmacology, neuro-symbolic AI, and large language models. From early connectivity map approaches to modern LLM agent swarms for hypothesis-driven drug discovery.",
    methods: [
      "Network pharmacology",
      "Drug repurposing (PETS, C2Maps)",
      "Neuro-symbolic AI (QSAR)",
      "LLM agent swarms",
      "Antibody-antigen binding prediction",
      "ADMET & hERG cardiotoxicity prediction",
    ],
    representativePapers: [
      { title: "LLM Agent Swarm for Hypothesis-Driven Drug Discovery", year: "2025" },
      { title: "LlamaAffinity: A Predictive Antibody-Antigen Binding Model Integrating Antibody Sequences with Llama3 Backbone Architecture", year: "2025" },
      { title: "NeSyDPP4-QSAR: Discovering DPP-4 Inhibitors for Diabetes Treatment with a Neuro-symbolic AI Approach", year: "2025" },
      { title: "Integrative multi-scale network simulation for precision drug repurposing with PETS", year: "2025" },
      { title: "An NLP-based Technique to Extract Meaningful Features from Drug SMILES", year: "2024" },
      { title: "C2Maps: A Network Pharmacology Database with Comprehensive Disease-Gene-Drug Connectivity Relationships", year: "2012" },
    ],
    tools: ["C2-Maps", "PAGER-CoV", "WINNER", "BEERE"],
    color: "blue",
  },
  {
    id: "knowledge-networks",
    icon: <Network className="h-7 w-7" />,
    title: "Biomedical Knowledge Networks & Network Biology",
    description:
      "Construction of large-scale knowledge graphs, pathway/gene-set repositories, protein interaction databases, and network biology methods. From the foundational HAPPI protein interactome and PAGER gene-set repository to modern network-based biomarker discovery and drug target prioritization.",
    methods: [
      "Gene set / pathway enrichment (PAGER, PAGED)",
      "Protein interaction networks (HAPPI, WIPER)",
      "Biomedical entity expansion (BEERE)",
      "Ontology-guided analysis (GOALS)",
      "Network topology & reordering",
      "Semantic web & data mining",
    ],
    representativePapers: [
      { title: "GOALS: Gene Ontology Analysis with Layered Shells for Enhanced Functional Insight and Visualization", year: "2025" },
      { title: "AI-Driven Network Biology Identifies SRC as a Therapeutic Target in Metastatic Pancreatic Adenocarcinoma", year: "2025" },
      { title: "Toden-E: Topology-Based and Density-Based Ensembled Clustering for the Development of Super-PAG in Functional Genomics", year: "2025" },
      { title: "WIPER: Weighted in-Path Edge Ranking for Biomolecular Association Networks", year: "2019" },
      { title: "PAGER: Constructing PAGs and new PAG-PAG Relationships for Network Biology", year: "2015" },
      { title: "HAPPI: an Online Database of Comprehensive Human Annotated and Predicted Protein Interactions", year: "2009" },
    ],
    tools: ["PAGER", "PAGED", "BEERE", "GOALS", "HAPPI Database", "WIPER Database", "HPD"],
    color: "emerald",
  },
  {
    id: "multiomics",
    icon: <BarChart3 className="h-7 w-7" />,
    title: "Multi-omics, Visualization & Interpretable AI",
    description:
      "Pioneering visual analytics for high-dimensional biological data. From the original GeneTerrain platform to Mondrian-inspired differential pathway analysis and single-cell spatial embedding tools (PGC, SpatialRSP).",
    methods: [
      "Terrain-based expression visualization",
      "Single-cell spatial embeddings (PGC, SpatialRSP)",
      "Mondrian abstraction for pathway analysis",
      "Network layout algorithms (DEMA, GraphWaGu)",
      "Multi-omics integration",
      "Kinome profiling visualization",
    ],
    representativePapers: [
      { title: "Temporal GeneTerrain: Advancing Precision Medicine Through Dynamic Gene Expression Visualization", year: "2025" },
      { title: "KinoViz: A User-Friendly Web Application for High-Throughput Kinome Profiling Analysis and Visualization in Cancer Research", year: "2025" },
      { title: "Mondrian Abstraction and Language Model Embeddings for Differential Pathway Analysis", year: "2024" },
      { title: "Polar Gini Curve: a Quantitative Technique to Discover Gene Expression Spatial Patterns from Single-cell Data", year: "2022" },
      { title: "DEMA: a Distance-bounded Energy-field Minimization Algorithm to Model and Layout Bio-molecular Networks", year: "2022" },
      { title: "GeneTerrain: Visual Exploration of Differential Gene Expression Profiles Organized in Native Biomolecular Interaction Networks", year: "2010" },
    ],
    tools: ["GeneTerrain", "Mondrian Map", "PGC", "SpatialRSP", "HOMER", "PEPPI"],
    color: "violet",
  },
  {
    id: "digital-twins",
    icon: <Users className="h-7 w-7" />,
    title: "Digital Twins & Precision Medicine",
    description:
      "Building patient-level computational models that fuse genomics, phenomics, and clinical data into personalized digital twins for cancer simulation, treatment optimization, and precision drug screening.",
    methods: [
      "Multi-scale digital twin simulation (MLPA)",
      "Sample-level statistical enrichment (SEAS)",
      "Clinotype-phenotype-genotype linking",
      "Cancer systems pharmacology",
      "Biomarker discovery & prioritization",
      "Personalized drug response prediction",
    ],
    representativePapers: [
      { title: "MLPA: A Multi-scale Digital Twin Framework for Personalized Cancer Simulation and Treatment Optimization", year: "2024" },
      { title: "Statistical Enrichment Analysis of Samples (SEAS): a General-purpose Tool to Annotate Metadata Neighborhoods of Biomedical Samples", year: "2021" },
      { title: "Linking Clinotypes to Phenotypes and Genotypes from Laboratory Test Results in Comprehensive Physical Examinations", year: "2021" },
      { title: "Network Medicine: Finding the Links to Personalized Therapy", year: "2013" },
      { title: "Unraveling Human Complexity and Disease with Systems Biology and Personalized Medicine", year: "2010" },
    ],
    tools: ["SEAS", "WINNER", "HIP2", "ProteoLens"],
    color: "amber",
  },
  {
    id: "infrastructure",
    icon: <Database className="h-7 w-7" />,
    title: "Translational Infrastructure, Data Ecosystems & Team Science",
    description:
      "Designing and deploying the data platforms, AI-ready data ecosystems, and multi-institutional collaboration frameworks that underpin biomedical AI. Includes leadership of the NIH-funded CONNECT consortium and Bridge2AI program, the U-BRITE translational platform, COVID-19 data resources, and the UAB CCTS bioinformatics core.",
    methods: [
      "NIH Common Fund data ecosystems (CONNECT, Bridge2AI, CFDE)",
      "Translational informatics platforms (U-BRITE)",
      "COVID-19 data integration (PAGER-CoV, N3C)",
      "AI-ready cell architecture maps (Cell Maps for AI)",
      "Talent knowledge graphs & team science analytics",
      "Privacy-preserving health informatics",
    ],
    representativePapers: [
      { title: "Cell Maps for Artificial Intelligence: AI-Ready Maps of Human Cell Architecture from Disease-Relevant Cell Lines", year: "2024" },
      { title: "PAGER-scFGA: Unveiling Cell Functions and Molecular Mechanisms in Cell Trajectories through Single-Cell Functional Genomics Analysis", year: "2024" },
      { title: "PAGER-CoV: A Comprehensive Collection of Pathways, Annotated-gene-lists, and Gene Signatures for Coronavirus Disease Functional Genomic Studies", year: "2021" },
      { title: "Empowering Team Science Across the Translational Spectrum with the UAB Biomedical Research Infrastructure Technology Enhancement (U-BRITE)", year: "2020" },
      { title: "PAGER Web APP: An Interactive, Online Gene Set and Network Interpretation Tool", year: "2022" },
    ],
    tools: ["PAGER-CoV", "Talent Knowledge Map", "SEAS", "PAGER"],
    color: "rose",
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: {
    bg: "bg-blue-600",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-600 dark:border-blue-400",
    light: "bg-blue-50 dark:bg-blue-950/40",
  },
  emerald: {
    bg: "bg-emerald-600",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-600 dark:border-emerald-400",
    light: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  violet: {
    bg: "bg-violet-600",
    text: "text-violet-600 dark:text-violet-400",
    border: "border-violet-600 dark:border-violet-400",
    light: "bg-violet-50 dark:bg-violet-950/40",
  },
  amber: {
    bg: "bg-amber-600",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-600 dark:border-amber-400",
    light: "bg-amber-50 dark:bg-amber-950/40",
  },
  rose: {
    bg: "bg-rose-600",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-600 dark:border-rose-400",
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

/* ------------------------------------------------------------------ */
/*  Components                                                        */
/* ------------------------------------------------------------------ */

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

          {/* Tools */}
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">Lab Software</h3>
          <div className="flex flex-wrap gap-2">
            {lineage.tools.map((t) => (
              <Link key={t} href="/software" className={`rounded-md border ${c.border} px-2.5 py-0.5 text-xs font-semibold ${c.text} hover:opacity-80 transition-opacity`}>
                {t}
              </Link>
            ))}
          </div>
        </div>

        {/* Papers column */}
        <div className={isEven ? "" : "md:[direction:ltr]"}>
          <div className={`rounded-2xl border border-slate-200 dark:border-zinc-800 ${c.light} p-6`}>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">Representative Publications</h3>
            <ul className="space-y-3">
              {lineage.representativePapers.map((p) => (
                <li key={p.title} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 ${c.text}`} />
                  <Link href={`/publications?search=${encodeURIComponent(p.title.substring(0, 50))}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    {p.title} <span className="text-slate-400 dark:text-slate-500">({p.year})</span>
                  </Link>
                </li>
              ))}
            </ul>
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
            Our research weaves five interconnected lineages -- from AI-driven drug discovery
            to translational data infrastructure -- into a unified effort to make artificial
            intelligence truly useful in medicine.
          </motion.p>
        </div>
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
            The power of the AI.MED lab lies in the intersections: knowledge networks feed drug
            discovery models, digital twins consume multi-omics visualizations, and every insight
            travels through our translational data infrastructure on its way to patient care. We
            design our research program so that progress in one lineage accelerates all the others.
          </p>
        </div>
      </motion.section>
    </div>
  );
}
