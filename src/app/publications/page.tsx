"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  FileText,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types & static data                                               */
/* ------------------------------------------------------------------ */

type PubType = "Journal Article" | "Conference" | "Book Chapter" | "Review";
type Topic = "Drug Discovery" | "Knowledge Networks" | "Multi-omics" | "AI/ML" | "Bioinformatics" | "Systems Biology";

interface Publication {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  type: PubType;
  topics: Topic[];
  abstract: string;
  doi?: string;
  pubmed?: string;
  pdf?: string;
}

const publications: Publication[] = [
  {
    id: 1,
    title: "Network-based Drug Repurposing for Human Coronavirus",
    authors: "Chen J, Li Y, Wang X, Zhang H, Liu M, Chen JY",
    journal: "Nature Communications",
    year: 2020,
    type: "Journal Article",
    topics: ["Drug Discovery", "Knowledge Networks"],
    abstract:
      "We present a network-based framework for rapid identification of repurposable drugs against SARS-CoV-2 by integrating virus-host interactome data with large-scale drug-target networks. Our approach identified several FDA-approved candidates, three of which entered clinical trials within months of prediction. The method generalizes to emerging pathogens and demonstrates the value of pre-computed knowledge graphs for pandemic preparedness.",
    doi: "https://doi.org/10.1038/s41467-020-00000-0",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/32000000",
    pdf: "#",
  },
  {
    id: 2,
    title: "Deep Learning Approaches for Protein Structure Prediction",
    authors: "Wang X, Zhang H, Liu M, Chen JY",
    journal: "Bioinformatics",
    year: 2023,
    type: "Journal Article",
    topics: ["AI/ML", "Bioinformatics", "Drug Discovery"],
    abstract:
      "We benchmark and extend state-of-the-art deep learning architectures for protein structure prediction, focusing on multi-domain proteins that remain challenging for current methods. Our hybrid attention-graph neural network achieves substantial improvements on CASP15 targets and reveals learned representations that correlate with functional sites, opening new avenues for structure-guided drug design.",
    doi: "https://doi.org/10.1093/bioinformatics/btad000",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/37000000",
  },
  {
    id: 3,
    title: "Biomedical Knowledge Graph Construction and Applications",
    authors: "Li Y, Chen J, Wang X, Johnson R, Chen JY",
    journal: "Journal of Biomedical Informatics",
    year: 2022,
    type: "Journal Article",
    topics: ["Knowledge Networks", "AI/ML"],
    abstract:
      "We describe the design, construction, and applications of a large-scale biomedical knowledge graph integrating over 30 million entities from PubMed, clinical trials, drug databases, and genomic resources. The graph supports drug repurposing, adverse event prediction, and clinical decision support. We release the construction pipeline as open-source software.",
    doi: "https://doi.org/10.1016/j.jbi.2022.100000",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/35000000",
    pdf: "#",
  },
  {
    id: 4,
    title: "GeneTerrainMap: Terrain-based Visualization of Gene Expression Data",
    authors: "Zhang H, Chen J, Liu M, Chen JY",
    journal: "BMC Bioinformatics",
    year: 2019,
    type: "Journal Article",
    topics: ["Multi-omics", "Bioinformatics"],
    abstract:
      "GeneTerrainMap is a novel visualization platform that renders high-dimensional gene expression landscapes as navigable 3D terrain maps. By mapping expression similarity to elevation and using color to encode pathway membership, the tool enables biologists to intuitively explore transcriptomic structure. User studies show a 40% improvement in pattern discovery time compared to conventional heatmaps.",
    doi: "https://doi.org/10.1186/s12859-019-0000-0",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/31000000",
    pdf: "#",
  },
  {
    id: 5,
    title: "Multi-omics Integration for Precision Oncology",
    authors: "Liu M, Wang X, Li Y, Zhang H, Chen JY",
    journal: "Cancer Research",
    year: 2024,
    type: "Journal Article",
    topics: ["Multi-omics", "AI/ML", "Systems Biology"],
    abstract:
      "We introduce MOIPO, a transformer-based framework that fuses genomic, transcriptomic, proteomic, and clinical data to predict therapeutic response in solid tumors. Applied to a 1,200-patient pan-cancer cohort, MOIPO achieves AUC > 0.88 on treatment response prediction and identifies novel biomarker combinations for immunotherapy stratification.",
    doi: "https://doi.org/10.1158/0008-5472.CAN-24-0000",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/38000000",
  },
  {
    id: 6,
    title: "Scalable Clinical Data Platforms for Learning Health Systems",
    authors: "Johnson R, Chen J, Li Y, Chen JY",
    journal: "Journal of the American Medical Informatics Association",
    year: 2021,
    type: "Journal Article",
    topics: ["Bioinformatics", "Systems Biology"],
    abstract:
      "We present the architecture and deployment of a cloud-native clinical data platform that integrates EHR, claims, and genomic data across five hospital systems. The platform supports real-time cohort identification, federated analytics, and regulatory-compliant machine learning pipelines, reducing time from hypothesis to insight by an order of magnitude.",
    doi: "https://doi.org/10.1093/jamia/ocab000",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/34000000",
    pdf: "#",
  },
  {
    id: 7,
    title: "Attention-based Graph Neural Networks for Drug-Target Interaction Prediction",
    authors: "Wang X, Chen J, Zhang H, Chen JY",
    journal: "Proceedings of NeurIPS Workshop on ML for Health",
    year: 2022,
    type: "Conference",
    topics: ["Drug Discovery", "AI/ML"],
    abstract:
      "We propose AttDTI, a graph attention network that jointly learns drug molecular graphs and protein contact maps to predict drug-target interactions. AttDTI outperforms baselines on three benchmark datasets and provides interpretable attention maps highlighting binding-relevant substructures, facilitating medicinal chemistry optimization.",
    doi: "https://doi.org/10.48550/arXiv.2212.00000",
  },
  {
    id: 8,
    title: "Ontology-Driven Semantic Integration of Biomedical Databases",
    authors: "Li Y, Johnson R, Chen JY",
    journal: "In: Biomedical Data Management and Graph Online Querying (Springer)",
    year: 2018,
    type: "Book Chapter",
    topics: ["Knowledge Networks", "Bioinformatics"],
    abstract:
      "This chapter presents a comprehensive framework for semantically integrating heterogeneous biomedical databases using a suite of OWL ontologies. We discuss mapping strategies, conflict resolution, and query federation, illustrated with a case study linking DrugBank, UniProt, and the Human Disease Ontology.",
    doi: "https://doi.org/10.1007/978-3-030-00000-0_1",
  },
  {
    id: 9,
    title: "Digital Twin Framework for Personalized Cancer Therapy",
    authors: "Zhang H, Liu M, Wang X, Li Y, Chen JY",
    journal: "npj Digital Medicine",
    year: 2023,
    type: "Journal Article",
    topics: ["AI/ML", "Systems Biology", "Multi-omics"],
    abstract:
      "We introduce a digital twin framework that integrates patient-specific genomic profiles, tumor microenvironment models, and pharmacokinetic simulations to predict individual treatment outcomes in breast cancer. In a retrospective validation cohort of 350 patients, the digital twin predicted progression-free survival with a concordance index of 0.81.",
    doi: "https://doi.org/10.1038/s41746-023-00000-0",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/37500000",
    pdf: "#",
  },
  {
    id: 10,
    title: "A Survey of AI Methods in Systems Biology and Drug Discovery",
    authors: "Chen JY, Wang X, Li Y, Liu M",
    journal: "Pharmacological Reviews",
    year: 2024,
    type: "Review",
    topics: ["Drug Discovery", "AI/ML", "Systems Biology"],
    abstract:
      "This comprehensive review surveys the landscape of AI and machine learning methods applied to systems biology and drug discovery over the past decade. We categorize approaches into network-based, sequence-based, structure-based, and generative paradigms, discuss their relative strengths and limitations, and outline a roadmap for the next generation of AI-driven therapeutic development.",
    doi: "https://doi.org/10.1124/pharmrev.124.000000",
    pubmed: "https://pubmed.ncbi.nlm.nih.gov/39000000",
    pdf: "#",
  },
];

const allTopics: Topic[] = ["Drug Discovery", "Knowledge Networks", "Multi-omics", "AI/ML", "Bioinformatics", "Systems Biology"];
const allTypes: PubType[] = ["Journal Article", "Conference", "Book Chapter", "Review"];
const years = Array.from({ length: 25 }, (_, i) => 2024 - i); // 2024 down to 2000

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                 */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.4, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
      }`}
    >
      {label}
    </button>
  );
}

function PublicationCard({ pub, index }: { pub: Publication; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.article
      variants={fadeUp}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Title */}
      <h3
        onClick={() => setOpen(!open)}
        className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {pub.title}
      </h3>

      {/* Authors & journal */}
      <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{pub.authors}</p>
      <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">
        {pub.journal}, {pub.year}
      </p>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {pub.topics.map((t) => (
          <span
            key={t}
            className="rounded-full bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:text-blue-300"
          >
            {t}
          </span>
        ))}
        <span className="rounded-full bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {pub.type}
        </span>
      </div>

      {/* Links */}
      <div className="mt-3 flex items-center gap-3">
        {pub.doi && (
          <a href={pub.doi} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> DOI
          </a>
        )}
        {pub.pubmed && (
          <a href={pub.pubmed} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
            <BookOpen className="h-3.5 w-3.5" /> PubMed
          </a>
        )}
        {pub.pdf && (
          <a href={pub.pdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
            <FileText className="h-3.5 w-3.5" /> PDF
          </a>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="ml-auto flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? "Hide abstract" : "Abstract"}
        </button>
      </div>

      {/* Expandable abstract */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-zinc-800 pt-4">
              {pub.abstract}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

type FilterMode = "all" | "year" | "topic" | "type";

export default function PublicationsPage() {
  const [query, setQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<Set<Topic>>(new Set());
  const [selectedType, setSelectedType] = useState<PubType | null>(null);

  const toggleTopic = (t: Topic) => {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = publications;

    // Search
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.authors.toLowerCase().includes(q) ||
          p.journal.toLowerCase().includes(q) ||
          p.abstract.toLowerCase().includes(q)
      );
    }

    // Year
    if (filterMode === "year" && selectedYear) {
      list = list.filter((p) => p.year === selectedYear);
    }

    // Topic
    if (filterMode === "topic" && selectedTopics.size > 0) {
      list = list.filter((p) => p.topics.some((t) => selectedTopics.has(t)));
    }

    // Type
    if (filterMode === "type" && selectedType) {
      list = list.filter((p) => p.type === selectedType);
    }

    // Sort newest first
    return [...list].sort((a, b) => b.year - a.year);
  }, [query, filterMode, selectedYear, selectedTopics, selectedType]);

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
            Publications
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
          >
            200+ peer-reviewed publications spanning drug discovery, biomedical AI, knowledge
            engineering, and translational informatics.
          </motion.p>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02] dark:opacity-[0.04]" />
      </section>

      {/* Filters */}
      <section className="sticky top-0 z-20 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 py-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, journal, or keyword..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mode pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400 mr-1" />
            {(["all", "year", "topic", "type"] as FilterMode[]).map((m) => (
              <Pill
                key={m}
                label={m === "all" ? "All" : m === "year" ? "By Year" : m === "topic" ? "By Topic" : "By Type"}
                active={filterMode === m}
                onClick={() => {
                  setFilterMode(m);
                  setSelectedYear(null);
                  setSelectedTopics(new Set());
                  setSelectedType(null);
                }}
              />
            ))}
          </div>

          {/* Contextual sub-filters */}
          <AnimatePresence mode="wait">
            {filterMode === "year" && (
              <motion.div
                key="year"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-500">Year:</label>
                  <select
                    value={selectedYear ?? ""}
                    onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
                    className="rounded-md border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All years</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}

            {filterMode === "topic" && (
              <motion.div
                key="topic"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {allTopics.map((t) => (
                    <Pill key={t} label={t} active={selectedTopics.has(t)} onClick={() => toggleTopic(t)} />
                  ))}
                </div>
              </motion.div>
            )}

            {filterMode === "type" && (
              <motion.div
                key="type"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2">
                  {allTypes.map((t) => (
                    <Pill key={t} label={t} active={selectedType === t} onClick={() => setSelectedType(selectedType === t ? null : t)} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Results count */}
      <div className="mx-auto max-w-6xl px-6 pt-8 pb-2">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{filtered.length}</span>{" "}
          publication{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Publication grid */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-400 dark:text-slate-500">No publications match your filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 mt-4">
            {filtered.map((pub, i) => (
              <PublicationCard key={pub.id} pub={pub} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
