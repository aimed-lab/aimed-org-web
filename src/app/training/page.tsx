"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  FlaskConical,
  Briefcase,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  School,
  Building,
  MapPin,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const lineage = [
  { institution: "Peking University", location: "College of Life Sciences", period: "B.S." },
  { institution: "University of Minnesota", location: "Minneapolis, MN", period: "Ph.D." },
  { institution: "Indiana University / Purdue University", location: "Indianapolis, IN", period: "Faculty" },
  { institution: "University of Alabama at Birmingham", location: "Birmingham, AL", period: "Faculty (current)" },
];

const traineeTypes = [
  {
    icon: School,
    title: "High School Students",
    color: "from-pink-500 to-rose-500",
    items: [
      "Summer research exposure programs",
      "Introduction to computational biology concepts",
      "Hands-on coding workshops in Python / R",
      "Poster presentation at end-of-program symposium",
    ],
  },
  {
    icon: BookOpen,
    title: "Undergraduates",
    color: "from-amber-500 to-orange-500",
    items: [
      "Hands-on research with real biomedical datasets",
      "Publication opportunities as co-author",
      "Coding mentorship (Python, R, bioinformatics pipelines)",
      "Preparation for graduate school or industry careers",
    ],
  },
  {
    icon: GraduationCap,
    title: "Master's Students",
    color: "from-emerald-500 to-teal-500",
    items: [
      "Thesis-level research in AI and biomedicine",
      "Industry preparation and networking",
      "Methods training in ML, NLP, and knowledge graphs",
      "Collaborative lab environment with senior mentors",
    ],
  },
  {
    icon: FlaskConical,
    title: "PhD Students",
    color: "from-blue-500 to-indigo-500",
    items: [
      "World-class mentorship with individualized research plans",
      "Deep research in cutting-edge computational biomedicine",
      "Publication track in top-tier journals and conferences",
      "Conference travel support (AMIA, ACM BCB, ISMB, etc.)",
    ],
  },
  {
    icon: Briefcase,
    title: "Postdoctoral Researchers",
    color: "from-purple-500 to-violet-500",
    items: [
      "Collaborative research on funded projects",
      "Grant writing mentorship (K-awards, R01 preparation)",
      "Career development toward faculty or industry leadership",
      "Access to multi-institutional collaborator network",
    ],
  },
];

const courses = [
  {
    school: "University of Alabama at Birmingham",
    list: [
      "BMI 601 - Introduction to Biomedical Informatics",
      "BMI 732 - Advanced Machine Learning for Biomedicine",
      "BMI 740 - Translational Bioinformatics",
      "BMI 790 - Seminar in Biomedical Data Science",
    ],
  },
  {
    school: "Indiana University / Purdue University",
    list: [
      "INFO I501 - Introduction to Informatics",
      "INFO I519 - Introduction to Bioinformatics",
      "CSCI B565 - Data Mining",
      "INFO I590 - Topics in Biomedical Natural Language Processing",
    ],
  },
];

const faqs = [
  {
    q: "What is the typical time commitment for student researchers?",
    a: "Undergraduates are expected to contribute 10-15 hours per week during the semester. Master's and PhD students work full-time on research. Summer students participate in a structured 8-10 week program.",
  },
  {
    q: "Can I work remotely or is the position on-site?",
    a: "Most research positions are on-site at UAB to facilitate close mentorship and team collaboration. Some computational-only projects may allow partial remote work on a case-by-case basis after an initial on-site period.",
  },
  {
    q: "What prerequisites or skills do I need?",
    a: "A strong foundation in at least one programming language (Python or R preferred) is expected for graduate students. Undergrads and high schoolers can join with basic coding knowledge -- we will teach the rest. Domain knowledge in biology or medicine is helpful but not required.",
  },
  {
    q: "How does authorship on publications work?",
    a: "We follow ICMJE guidelines for authorship. All team members who make substantial intellectual contributions to a project are included as co-authors. We discuss authorship expectations early and transparently for every project.",
  },
  {
    q: "Are funded positions available?",
    a: "PhD students are typically funded through research or teaching assistantships. Postdoc positions are funded through active grants. Undergraduate and master's students should inquire about current funding availability when applying.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-200 dark:border-zinc-800">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left"
      >
        <span className="pr-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {q}
        </span>
        {open ? (
          <ChevronUp className="h-5 w-5 shrink-0 text-blue-600" />
        ) : (
          <ChevronDown className="h-5 w-5 shrink-0 text-slate-400" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400"
        >
          {a}
        </motion.div>
      )}
    </div>
  );
}

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-24 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute left-1/3 top-1/4 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <Users className="h-4 w-4" />
              Building the next generation
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Training &amp; Mentoring
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              Join a training lineage spanning three decades and multiple continents -- from Peking University to UAB, we cultivate researchers who change the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Institutional Lineage */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Institutional Lineage
          </h2>
          <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
            A journey of scholarship across institutions and borders
          </p>
        </motion.div>

        <div className="relative flex flex-col items-center gap-0">
          {lineage.map((item, i) => (
            <motion.div
              key={item.institution}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center justify-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.institution}
                  </h3>
                </div>
                <div className="mt-1 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                    {item.period}
                  </span>
                </div>
              </div>
              {i < lineage.length - 1 && (
                <div className="my-1 flex flex-col items-center text-blue-400 dark:text-blue-600">
                  <div className="h-6 w-0.5 bg-blue-300 dark:bg-blue-700" />
                  <ArrowRight className="h-4 w-4 rotate-90" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              What to Expect
            </h2>
            <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
              Tailored mentoring for every stage of your career
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {traineeTypes.map((type, i) => {
              const Icon = type.icon;
              return (
                <motion.div
                  key={type.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div
                    className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${type.color} text-white`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-slate-100">
                    {type.title}
                  </h3>
                  <ul className="space-y-2">
                    {type.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Taught */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Courses Taught
          </h2>
          <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
            Graduate and undergraduate courses across institutions
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2">
          {courses.map((school, i) => (
            <motion.div
              key={school.school}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {school.school}
                </h3>
              </div>
              <ul className="space-y-2">
                {school.list.map((course) => (
                  <li
                    key={course}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400"
                  >
                    <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                    {course}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              Frequently Asked Questions
            </h2>
            <p className="mb-10 text-center text-slate-600 dark:text-slate-400">
              Common questions from prospective trainees
            </p>
          </motion.div>

          <div className="rounded-xl border border-slate-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-900">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
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
            Ready to Join?
          </h2>
          <p className="mb-8 text-slate-600 dark:text-slate-400">
            We are always looking for passionate researchers at every career stage.
          </p>
          <Link
            href="/join"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-700"
          >
            Apply to Join the Lab
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
