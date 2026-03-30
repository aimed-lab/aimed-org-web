"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Award,
  MapPin,
  Calendar,
  Tag,
  ChevronDown,
  Trophy,
  Star,
} from "lucide-react";

const talks = [
  {
    title: "AI-Driven Drug Repurposing Using Biomedical Knowledge Graphs",
    venue: "Gordon Research Conference on Computational Chemistry",
    location: "Barcelona, Spain",
    date: "July 2024",
    year: 2024,
    topic: "Drug Discovery",
  },
  {
    title: "Digital Twins for Precision Oncology: Challenges and Opportunities",
    venue: "AMIA Annual Symposium",
    location: "San Francisco, CA, USA",
    date: "November 2023",
    year: 2023,
    topic: "Precision Medicine",
  },
  {
    title: "Multi-Omics Integration for Patient Stratification",
    venue: "ACM Conference on Bioinformatics, Computational Biology, and Health Informatics (ACM BCB)",
    location: "Houston, TX, USA",
    date: "September 2022",
    year: 2022,
    topic: "Bioinformatics",
  },
  {
    title: "Network-Based Approaches to Understanding Drug Mechanisms",
    venue: "NIH National Library of Medicine Seminar Series",
    location: "Bethesda, MD, USA",
    date: "March 2021",
    year: 2021,
    topic: "Drug Discovery",
  },
  {
    title: "Knowledge Graph Embeddings for Biomedical Link Prediction",
    venue: "Peking University School of Computer Science",
    location: "Beijing, China",
    date: "June 2020",
    year: 2020,
    topic: "Knowledge Graphs",
  },
  {
    title: "Translational Bioinformatics: Bridging Bench to Bedside with AI",
    venue: "AMIA Translational Science Summit",
    location: "Washington, DC, USA",
    date: "April 2019",
    year: 2019,
    topic: "Translational Informatics",
  },
  {
    title: "Terrain-Based Visualization of High-Dimensional Gene Expression Data",
    venue: "IEEE International Conference on Bioinformatics and Biomedicine (BIBM)",
    location: "Madrid, Spain",
    date: "December 2018",
    year: 2018,
    topic: "Bioinformatics",
  },
  {
    title: "Protein Interaction Networks in Disease Pathway Analysis",
    venue: "University of Tokyo, Department of Computational Biology",
    location: "Tokyo, Japan",
    date: "October 2016",
    year: 2016,
    topic: "Knowledge Graphs",
  },
];

const honors = [
  {
    title: "Top 100 AI Leaders in Drug Discovery",
    org: "Deep Pharma Intelligence",
    year: 2023,
    description:
      "Recognized among the 100 most influential AI leaders shaping the future of pharmaceutical research and drug discovery worldwide.",
  },
  {
    title: "Triton Endowed Professorship",
    org: "University of Alabama at Birmingham",
    year: 2022,
    description:
      "Awarded a prestigious endowed professorship in recognition of sustained excellence in biomedical informatics research and education.",
  },
  {
    title: "AIMBE Fellow",
    org: "American Institute for Medical and Biological Engineering",
    year: 2021,
    description:
      "Elected as a Fellow for outstanding contributions to medical and biological engineering research and education.",
  },
  {
    title: "ACMI Fellow",
    org: "American College of Medical Informatics",
    year: 2020,
    description:
      "Elected as a Fellow of ACMI in recognition of significant and sustained contributions to biomedical and health informatics.",
  },
  {
    title: "ACM Distinguished Scientist",
    org: "Association for Computing Machinery",
    year: 2019,
    description:
      "Recognized as a Distinguished Scientist for significant contributions to the computing field with broad impact.",
  },
  {
    title: "AMIA Fellow",
    org: "American Medical Informatics Association",
    year: 2018,
    description:
      "Honored as a Fellow for outstanding contributions to the field of informatics through research, education, and practice.",
  },
  {
    title: "CAST-USA Pioneer Award",
    org: "Chinese Association for Science and Technology - USA",
    year: 2017,
    description:
      "Received the Pioneer Award for groundbreaking contributions to scientific research and cross-cultural technology collaboration.",
  },
];

const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010];
const topics = ["All", "Drug Discovery", "Precision Medicine", "Bioinformatics", "Knowledge Graphs", "Translational Informatics"];

const topicColors: Record<string, string> = {
  "Drug Discovery": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Precision Medicine": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Bioinformatics: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
  "Knowledge Graphs": "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  "Translational Informatics": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
};

export default function TalksPage() {
  const [activeTab, setActiveTab] = useState<"talks" | "honors">("talks");
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);

  const filteredTalks = talks.filter((t) => {
    if (selectedYear && t.year !== selectedYear) return false;
    if (selectedTopic !== "All" && t.topic !== selectedTopic) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Mic className="h-4 w-4" />
              Sharing knowledge worldwide
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Talks &amp; Honors
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              200+ invited talks worldwide
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <div className="mx-auto max-w-6xl px-6 pt-10">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 dark:bg-zinc-800">
          {(["talks", "honors"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-white text-slate-900 shadow-sm dark:bg-zinc-700 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                {tab === "talks" ? <Mic className="h-4 w-4" /> : <Award className="h-4 w-4" />}
                {tab === "talks" ? "Invited Talks" : "Honors & Awards"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-10">
        <AnimatePresence mode="wait">
          {activeTab === "talks" ? (
            <motion.div
              key="talks"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Filters */}
              <div className="mb-8 flex flex-wrap items-center gap-4">
                {/* Year dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
                  >
                    <Calendar className="h-4 w-4" />
                    {selectedYear ?? "All Years"}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                  {yearDropdownOpen && (
                    <div className="absolute left-0 z-20 mt-1 max-h-60 w-40 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                      <button
                        onClick={() => {
                          setSelectedYear(null);
                          setYearDropdownOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-zinc-700"
                      >
                        All Years
                      </button>
                      {years.map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setSelectedYear(y);
                            setYearDropdownOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-zinc-700"
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Topic pills */}
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedTopic === topic
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-400 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Talk cards */}
              <div className="grid gap-5 sm:grid-cols-2">
                {filteredTalks.map((talk, i) => (
                  <motion.div
                    key={talk.title}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold leading-snug text-slate-900 dark:text-slate-100">
                        {talk.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          topicColors[talk.topic] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {talk.topic}
                      </span>
                    </div>
                    <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                      {talk.venue}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {talk.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {talk.date}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredTalks.length === 0 && (
                <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                  No talks found for the selected filters.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="honors"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {/* Honors timeline */}
              <div className="relative ml-4 border-l-2 border-blue-200 pl-8 dark:border-blue-800">
                {honors.map((honor, i) => (
                  <motion.div
                    key={honor.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="relative mb-10 last:mb-0"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[calc(2rem+5px)] flex h-4 w-4 items-center justify-center rounded-full border-2 border-blue-600 bg-white dark:bg-zinc-950">
                      <div className="h-2 w-2 rounded-full bg-blue-600" />
                    </div>

                    {/* Year badge */}
                    <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {honor.year}
                    </span>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                      <div className="mb-1 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {honor.title}
                        </h3>
                      </div>
                      <p className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        {honor.org}
                      </p>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {honor.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
