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
    title: "Embracing The New Frontier: Artificial Intelligence in Research",
    venue: "2025 CCTS Translational Science Symposium",
    location: "Gulf Shores, AL, USA",
    date: "October 2025",
    year: 2025,
    topic: "Drug Discovery",
  },
  {
    title: "Decentralizing AI-accelerated Drug Discovery",
    venue: "AMIA Annual Symposium",
    location: "Atlanta, GA, USA",
    date: "November 2025",
    year: 2025,
    topic: "Drug Discovery",
  },
  {
    title: "Cell Maps for AI",
    venue: "AMIA Annual Symposium, Session on the Bridge2AI Consortium",
    location: "Atlanta, GA, USA",
    date: "November 2025",
    year: 2025,
    topic: "Bioinformatics",
  },
  {
    title: "Programmable Medicine with Digital Functional Genomics Imaging",
    venue: "Festival of Biologics Meeting",
    location: "San Diego, CA, USA",
    date: "April 2025",
    year: 2025,
    topic: "Precision Medicine",
  },
  {
    title: "The AI Drug Discovery Initiative at UAB",
    venue: "AI in Medicine and Nursing Symposium",
    location: "Birmingham, AL, USA",
    date: "October 2024",
    year: 2024,
    topic: "Drug Discovery",
  },
  {
    title: "Programmable Medicine as a New Paradigm in Managing and Treating Chronic Diseases",
    venue: "BiotechX Europe 2024 Annual Conference",
    location: "Basel, Switzerland",
    date: "October 2024",
    year: 2024,
    topic: "Precision Medicine",
  },
  {
    title: "Igniting the SPARC of AI-Enabled Drug Discovery",
    venue: "Southeast Clinical and Translational Science Alliances (CTSA) Annual Conference",
    location: "Pine Mountain, GA, USA",
    date: "February 2024",
    year: 2024,
    topic: "Drug Discovery",
  },
  {
    title: "Artificial Intelligence and Mental Healthcare",
    venue: "2023 Alabama Behavioral Healthcare Conference",
    location: "Birmingham, AL, USA",
    date: "November 2023",
    year: 2023,
    topic: "Precision Medicine",
  },
  {
    title: "Is there a role of AI in Precision Oncology?",
    venue: "Grand Round, Atrium Health-Wake Forest Baptist Comprehensive Cancer Center",
    location: "Winston-Salem, NC, USA",
    date: "September 2023",
    year: 2023,
    topic: "Precision Medicine",
  },
  {
    title: "PAGER-CoV: An Online Curated Gene Signature Database Resource for Coronavirus Disease Functional Genomic Studies",
    venue: "19th International Workshop on Data Mining in Bioinformatics (BIOKDD), 2020 Annual ACM KDD Conference",
    location: "San Diego, CA, USA (virtual)",
    date: "August 2020",
    year: 2020,
    topic: "Bioinformatics",
  },
  {
    title: "Modeling Networks to Accelerate Biomedical Discoveries in Translational Medicine",
    venue: "2nd International Translational and Regenerative Medicine Conference",
    location: "Valencia, Spain",
    date: "May 2019",
    year: 2019,
    topic: "Translational Informatics",
  },
  {
    title: "Network Biology Modeling in Translational Bioinformatics",
    venue: "Workshop on Knowledge Discovery and Data Mining in Bioinformatics (BIOKDD), 2018 Annual ACM KDD Conference",
    location: "London, UK",
    date: "August 2018",
    year: 2018,
    topic: "Bioinformatics",
  },
  {
    title: "Unravel Complex Patterns in Omics Data with Integrative GNPA Tools",
    venue: "6th Annual LA Conference on Computational Biology & Bioinformatics",
    location: "Baton Rouge, LA, USA",
    date: "April 2018",
    year: 2018,
    topic: "Bioinformatics",
  },
  {
    title: "Modeling Drug Efficacy Using Network Pharmacology",
    venue: "Annual Cambridge Health Institute Molecular Medicine Tri-conference",
    location: "San Francisco, CA, USA",
    date: "February 2012",
    year: 2012,
    topic: "Drug Discovery",
  },
  {
    title: "Translational Bioinformatics: Power Tools for Predictive and Personalized Medicine",
    venue: "International Symposium on Biocomputing",
    location: "Calicut, Kerala, India",
    date: "February 2010",
    year: 2010,
    topic: "Precision Medicine",
  },
  {
    title: "ProteoLens: a Visual Analytic Tool for Multi-scale Database-driven Biological Network Data Mining",
    venue: "Fifth Annual Conference of the MidSouth Computational Biology and Bioinformatics Society",
    location: "Oklahoma City, OK, USA",
    date: "February 2008",
    year: 2008,
    topic: "Bioinformatics",
  },
];

const honors = [
  {
    title: "Grand Prize, NIH Bridge2AI Program Theme Song Competition",
    org: "National Institutes of Health",
    year: 2024,
    description:
      "Won the Grand Prize in the NIH Bridge2AI Program Theme Song Competition.",
  },
  {
    title: "Triton Endowed Professorship",
    org: "University of Alabama Board of Trustees",
    year: 2023,
    description:
      "Awarded the Triton Endowed Professorship in Biomedical Informatics and Data Science at UAB School of Medicine.",
  },
  {
    title: "ACM Distinguished Scientist",
    org: "Association for Computing Machinery",
    year: 2021,
    description:
      "Recognized as a Distinguished Scientist for significant contributions to the computing field.",
  },
  {
    title: "Elected Fellow, AIMBE",
    org: "American Institute for Medical and Biological Engineering",
    year: 2021,
    description:
      "Elected as a Fellow for outstanding contributions to medical and biological engineering research and education.",
  },
  {
    title: "UAB School of Medicine Featured Discovery Award",
    org: "University of Alabama at Birmingham",
    year: 2021,
    description:
      "Recognized for a featured discovery in the UAB School of Medicine.",
  },
  {
    title: "Elected Fellow, AMIA",
    org: "American Medical Informatics Association",
    year: 2020,
    description:
      "Honored as a Fellow for outstanding contributions to biomedical and health informatics.",
  },
  {
    title: "Top 100 AI Leaders in Drug Discovery and Advanced Healthcare",
    org: "Deep Knowledge Analytics",
    year: 2019,
    description:
      "Recognized among the 100 most influential AI leaders shaping the future of drug discovery and healthcare.",
  },
  {
    title: "Elected Fellow, ACMI",
    org: "American College of Medical Informatics",
    year: 2019,
    description:
      "Elected as a Fellow for significant and sustained contributions to biomedical and health informatics.",
  },
  {
    title: "ISCB Senior Member",
    org: "International Society of Computational Biology",
    year: 2019,
    description:
      "Recognized as a Senior Member of the International Society of Computational Biology.",
  },
  {
    title: "Innocentive.com Grand Challenge Award Winner",
    org: "Innocentive.com",
    year: 2012,
    description:
      "Won the Grand Challenge among >250,000 scientists for solving the Cancer Cell Drug Discovery challenge.",
  },
];

const years = [2025, 2024, 2023, 2020, 2019, 2018, 2012, 2010, 2008];
const topics = ["All", "Drug Discovery", "Precision Medicine", "Bioinformatics", "Translational Informatics"];

const topicColors: Record<string, string> = {
  "Drug Discovery": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  "Precision Medicine": "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  Bioinformatics: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300",
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
