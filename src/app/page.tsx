"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Microscope,
  Network,
  Brain,
  Users,
  Database,
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Award,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Static data (to be replaced with DB queries later)                */
/* ------------------------------------------------------------------ */

const announcements = [
  "Now recruiting PhD students for AI-driven drug discovery research — Apply now",
];

const researchPillars = [
  {
    icon: Microscope,
    title: "Systems Pharmacology & Drug Discovery",
    description:
      "Computational approaches for drug target identification, molecular modeling, and therapeutic development.",
  },
  {
    icon: Network,
    title: "Biomedical Knowledge Networks",
    description:
      "Large-scale biomedical data ecosystems, knowledge graphs, and semantic data integration.",
  },
  {
    icon: Brain,
    title: "Multi-omics & Interpretable AI",
    description:
      "Visualization, interpretable machine learning, and multi-scale biological data analysis.",
  },
  {
    icon: Users,
    title: "Digital Twins & Precision Medicine",
    description:
      "Patient-level computational models for personalized therapeutic strategies.",
  },
  {
    icon: Database,
    title: "Translational Data Infrastructure",
    description:
      "Scalable data platforms, clinical informatics pipelines, and research-to-bedside tools.",
  },
];

const timelineSteps = [
  { year: "1994", label: "Peking University", detail: "B.S." },
  { year: "2000", label: "University of Minnesota", detail: "Ph.D." },
  { year: "2000s", label: "Indiana / Purdue", detail: "Faculty" },
  { year: "2010s", label: "Wenzhou Medical University", detail: "Dean" },
  { year: "Now", label: "UAB", detail: "Endowed Professor" },
];

const honors = [
  "ACM Distinguished Scientist",
  "AIMBE Fellow",
  "AMIA Fellow",
  "ACMI Fellow",
  "CAST-USA Pioneer Award",
  "Top 100 AI Leaders in Drug Discovery",
];

const mentorshipPoints = [
  "Direct mentorship from a globally recognized leader with 25+ years of experience bridging AI and biomedicine.",
  "Access to cutting-edge multi-omics datasets, high-performance computing, and deep industry collaborations.",
  "A proven track record of placing graduates in top academic, pharma, and tech positions worldwide.",
];

/* ------------------------------------------------------------------ */
/*  Animation variants                                                */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.07 } },
};

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  /* rotating announcement index */
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  useEffect(() => {
    if (announcements.length <= 1) return;
    const id = setInterval(
      () => setAnnouncementIdx((i) => (i + 1) % announcements.length),
      5000,
    );
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-zinc-950 dark:text-slate-100">
      {/* ============================================================ */}
      {/*  1. Announcement Strip                                       */}
      {/* ============================================================ */}
      <div className="relative z-30 overflow-hidden border-b border-blue-600/20 bg-blue-600 text-white">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-center px-4 text-xs font-medium tracking-wide sm:text-sm">
          <Link href="/join" className="flex items-center gap-1.5 transition hover:opacity-80">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{announcements[announcementIdx]}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  2. Hero Section                                             */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        {/* subtle grid background */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-24 pt-28 text-center sm:pt-36 lg:pt-44"
        >
          {/* name */}
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl"
          >
            Jake Y. Chen
          </motion.h1>

          {/* title stack */}
          <motion.p
            variants={fadeUp}
            custom={1}
            className="mt-5 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg"
          >
            Triton Endowed Professor of Biomedical Informatics &amp; Data Science
            &nbsp;&middot;&nbsp; Founding Director, SPARC &nbsp;&middot;&nbsp; UAB
          </motion.p>

          {/* mission */}
          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-6 max-w-3xl text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-300 sm:text-xl"
          >
            Building next-generation computational frameworks for drug discovery,
            disease modeling, multi-omics interpretation, and AI-enabled
            translational medicine.
          </motion.p>

          {/* evidence bar */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400"
          >
            {[
              "200+ Publications",
              "200+ Invited Talks",
              ">$100M in Grants",
              "25+ Years",
            ].map((stat) => (
              <span key={stat} className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                {stat}
              </span>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-12 flex flex-col gap-4 sm:flex-row"
          >
            <Link
              href="/research"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
            >
              Explore Research
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/join"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-zinc-800"
            >
              Join the Lab
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  3. Research Pillars                                         */}
      {/* ============================================================ */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-28 dark:border-slate-800/50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-semibold uppercase tracking-widest text-blue-600"
            >
              Research Focus
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Five Pillars of AI.MED
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {researchPillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  variants={fadeUp}
                  custom={i}
                  className="group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-zinc-900"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  4. Featured Paper                                           */}
      {/* ============================================================ */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white shadow-sm dark:border-slate-800 dark:from-zinc-900 dark:to-zinc-950"
          >
            <div className="p-8 sm:p-10">
              <motion.p
                variants={fadeUp}
                custom={0}
                className="text-xs font-semibold uppercase tracking-widest text-blue-600"
              >
                Featured Publication
              </motion.p>
              <motion.h3
                variants={fadeUp}
                custom={1}
                className="mt-4 text-2xl font-bold leading-snug tracking-tight sm:text-3xl"
              >
                AI-Enabled Drug Discovery: Recent Advances and Future Directions
              </motion.h3>
              <motion.p
                variants={fadeUp}
                custom={2}
                className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400"
              >
                Nature Reviews Drug Discovery, 2024
              </motion.p>
              <motion.p
                variants={fadeUp}
                custom={3}
                className="mt-5 text-base leading-relaxed text-slate-600 dark:text-slate-400"
              >
                A comprehensive review surveying the landscape of artificial
                intelligence applications in modern drug discovery pipelines,
                covering molecular generation, target identification, ADMET
                prediction, and clinical trial optimization. The paper outlines a
                roadmap for integrating foundation models, multi-omics data, and
                digital-twin technology to accelerate therapeutic development.
              </motion.p>
              <motion.div variants={fadeUp} custom={4} className="mt-6">
                <Link
                  href="/publications"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Read more <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  5. Lineage Timeline Teaser                                  */}
      {/* ============================================================ */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-28 dark:border-slate-800/50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              custom={0}
              className="text-sm font-semibold uppercase tracking-widest text-blue-600"
            >
              Academic Lineage
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              A Career Spanning Continents
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={stagger}
            className="mt-14 flex gap-0 overflow-x-auto pb-4 scrollbar-hide"
          >
            {timelineSteps.map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeUp}
                custom={i}
                className="relative flex min-w-[180px] flex-1 flex-col items-center text-center"
              >
                {/* connector line */}
                {i < timelineSteps.length - 1 && (
                  <div className="absolute left-1/2 top-4 h-0.5 w-full bg-gradient-to-r from-blue-600 to-blue-400" />
                )}
                {/* dot */}
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-600 bg-white dark:bg-zinc-950">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                </div>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-blue-600">
                  {step.year}
                </p>
                <p className="mt-1 text-sm font-semibold">{step.label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {step.detail}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  6. Prestige Rail                                            */}
      {/* ============================================================ */}
      <section className="overflow-hidden py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Honors & Recognition
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Distinctions
          </h2>
        </div>

        {/* scrolling badges (CSS animation) */}
        <div className="relative mt-12">
          <div className="flex animate-marquee gap-4 whitespace-nowrap">
            {[...honors, ...honors].map((honor, i) => (
              <span
                key={`${honor}-${i}`}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium shadow-sm dark:border-slate-800 dark:bg-zinc-900"
              >
                <Award className="h-4 w-4 text-blue-600" />
                {honor}
              </span>
            ))}
          </div>
        </div>

        {/* inline marquee keyframe */}
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}</style>
      </section>

      {/* ============================================================ */}
      {/*  7. Training & Mentorship Teaser                             */}
      {/* ============================================================ */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-28 dark:border-slate-800/50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.div
              variants={fadeUp}
              custom={0}
              className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600"
            >
              <GraduationCap className="h-6 w-6" />
            </motion.div>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Why Students Join AI.MED
            </motion.h2>
            <motion.ul
              variants={fadeUp}
              custom={2}
              className="mt-8 space-y-5 text-left text-base leading-relaxed text-slate-600 dark:text-slate-400"
            >
              {mentorshipPoints.map((point) => (
                <li key={point} className="flex gap-3">
                  <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-blue-600" />
                  <span>{point}</span>
                </li>
              ))}
            </motion.ul>
            <motion.div variants={fadeUp} custom={3} className="mt-10">
              <Link
                href="/join"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                Apply to Join <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  8. Footer CTA                                               */}
      {/* ============================================================ */}
      <section className="py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={stagger}
          >
            <motion.h2
              variants={fadeUp}
              custom={0}
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
            >
              Ready to advance AI-driven medicine?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-xl text-lg text-slate-500 dark:text-slate-400"
            >
              Explore our research or join the lab to shape the future of
              biomedical AI.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                href="/research"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                Explore Research
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/join"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-zinc-900 dark:text-slate-100 dark:hover:border-slate-700 dark:hover:bg-zinc-800"
              >
                Apply Now
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
