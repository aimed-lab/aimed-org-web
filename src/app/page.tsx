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
  MapPin,
  Building2,
  Briefcase,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Static data                                                       */
/* ------------------------------------------------------------------ */

const announcements = [
  "Now recruiting PhD students for AI-driven drug discovery research — Apply now",
];

const currentPositions = [
  {
    role: "Triton Endowed Professor",
    dept: "Biomedical Informatics & Data Science",
    org: "UAB School of Medicine",
    period: "2023–present",
  },
  {
    role: "Founding Director",
    dept: "Systems Pharmacology AI Research Center (SPARC)",
    org: "UAB School of Medicine",
    period: "2023–present",
  },
  {
    role: "Professor (secondary)",
    dept: "Computer & Information Sciences",
    org: "UAB College of Arts & Sciences",
    period: "2017–present",
  },
  {
    role: "Professor (secondary)",
    dept: "Biomedical Engineering",
    org: "UAB College of Engineering",
    period: "2018–present",
  },
  {
    role: "Faculty, Graduate Program in Immunology",
    dept: "",
    org: "UAB School of Medicine",
    period: "2019–present",
  },
];

const pastLeadership = [
  {
    role: "Chief Bioinformatics Officer & Associate Director",
    org: "Informatics Institute, UAB",
    period: "2016–2023",
  },
  {
    role: "Contact MPI, CONNECT (NIH U54)",
    org: "National AI-infrastructure initiative",
    period: "2024–2029",
  },
  {
    role: "MPI, Bridge2AI (NIH OT2)",
    org: "NIH Common Fund Program",
    period: "2022–2026",
  },
  {
    role: "Past President",
    org: "Mid-South Computational Biology & Bioinformatics Society (MCBIOS)",
    period: "2021–2022",
  },
  {
    role: "Founding Director, Indiana Center for Systems Biology and Personalized Medicine",
    org: "Indiana University–Purdue University",
    period: "2007–2016",
  },
  {
    role: "Founder & Chairman, MedeoLinx, LLC",
    org: "Indianapolis, IN",
    period: "2006–2016",
  },
  {
    role: "Co-founder & Chief Informatics Officer, Predictive Physiology and Medicine, Inc.",
    org: "Bloomington, IN (raised >$6M in venture funding)",
    period: "2006–2008",
  },
  {
    role: "Head of Computational Proteomics & Principal Bioinformatics Scientist",
    org: "Myriad Proteomics (Prolexys Pharmaceuticals), Salt Lake City, UT",
    period: "2002–2003",
  },
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

const honors = [
  "ACM Distinguished Scientist",
  "AIMBE Fellow",
  "AMIA Fellow",
  "ACMI Fellow",
  "Top 100 AI Leaders in Drug Discovery",
  "CAST-USA Pioneer Award",
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
      {/* Announcement Strip */}
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
      {/*  Hero: Photo + Bio                                            */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:64px_64px] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-20 md:flex-row md:items-start md:gap-16 md:pt-28"
        >
          {/* Photo */}
          <motion.div variants={fadeUp} custom={0} className="shrink-0">
            <div className="relative">
              <div className="h-56 w-56 overflow-hidden rounded-2xl border-4 border-white shadow-xl dark:border-zinc-800 md:h-64 md:w-64">
                <img
                  src="/jake-chen-headshot.jpg"
                  alt="Prof. Jake Y. Chen"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                <MapPin className="mr-1 inline h-3 w-3" />
                UAB, Birmingham AL
              </div>
            </div>
          </motion.div>

          {/* Bio text */}
          <div className="flex-1 text-center md:text-left">
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
            >
              Jake Y. Chen, Ph.D.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-3 text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg"
            >
              Triton Endowed Professor of Biomedical Informatics &amp; Data Science
              &nbsp;&middot;&nbsp; Founding Director, SPARC &nbsp;&middot;&nbsp; UAB School of Medicine
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={3}
              className="mt-5 text-base leading-relaxed text-slate-700 dark:text-slate-300"
            >
              Over 25 years advancing AI-driven biomedical informatics, network/systems biology,
              and computational drug discovery. Developing systems pharmacology models, multi-omics
              AI frameworks, and digital twin simulations that integrate clinical, genomic, and
              real-world data for precision medicine. 200+ peer-reviewed publications and 200+
              invited talks worldwide.
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={4}
              className="mt-4 text-base leading-relaxed text-slate-700 dark:text-slate-300"
            >
              Contact MPI for CONNECT, an NIH U54-funded national AI-infrastructure initiative
              building AI-ready biomedical knowledge networks. Fellow of ACMI, AIMBE, and AMIA;
              ACM Distinguished Member; named among the &ldquo;Top 100 AI Leaders in Drug Discovery
              and Healthcare&rdquo; (2019).
            </motion.p>

            {/* Evidence bar */}
            <motion.div
              variants={fadeUp}
              custom={5}
              className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 md:justify-start"
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
              custom={6}
              className="mt-8 flex flex-col gap-4 sm:flex-row md:justify-start justify-center"
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
          </div>
        </motion.div>
      </section>

      {/* ============================================================ */}
      {/*  Positions & Leadership                                       */}
      {/* ============================================================ */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-20 dark:border-slate-800/50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Current Positions */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} custom={0} className="mb-6 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-bold tracking-tight">Current Positions</h2>
              </motion.div>
              <div className="space-y-4">
                {currentPositions.map((pos, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i + 1}
                    className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {pos.role}
                    </p>
                    {pos.dept && (
                      <p className="text-sm text-slate-600 dark:text-slate-400">{pos.dept}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      {pos.org} &middot; {pos.period}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Leadership */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={stagger}
            >
              <motion.div variants={fadeUp} custom={0} className="mb-6 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <h2 className="text-2xl font-bold tracking-tight">Selected Leadership</h2>
              </motion.div>
              <div className="space-y-4">
                {pastLeadership.map((pos, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i + 1}
                    className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {pos.role}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                      {pos.org} &middot; {pos.period}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/*  Research Pillars                                             */}
      {/* ============================================================ */}
      <section className="py-28">
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
      {/*  Honors Rail                                                  */}
      {/* ============================================================ */}
      <section className="overflow-hidden border-t border-slate-100 py-20 dark:border-slate-800/50">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
            Honors & Recognition
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Distinctions
          </h2>
        </div>

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

        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 30s linear infinite;
          }
        `}</style>
      </section>

      {/* ============================================================ */}
      {/*  Training & Mentorship                                        */}
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
              {[
                "Direct mentorship from a globally recognized leader with 25+ years of experience bridging AI and biomedicine.",
                "Access to cutting-edge multi-omics datasets, high-performance computing, and deep industry collaborations.",
                "A proven track record of placing graduates in top academic, pharma, and tech positions worldwide.",
              ].map((point) => (
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
      {/*  Footer CTA                                                   */}
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
              Explore our research or join the lab to shape the future of biomedical AI.
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
