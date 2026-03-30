"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
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
  Building,
  MapPin,
  FileText,
  Award,
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

const currentMembers = [
  {
    name: "Huu Phong Nguyen, PhD",
    role: "Postdoctoral Fellow",
    photo: null,
  },
  {
    name: "Fuad Al Abir",
    role: "PhD Student, Biomedical Informatics & Data Science",
    photo: "/members/fuad-al-abir.jpg",
  },
  {
    name: "Delower Hossain",
    role: "PhD Student, Computer Science",
    photo: "/members/delower-hossain.jpg",
  },
  {
    name: "John Haoyuan Cheng",
    role: "Research Staff",
    photo: null,
  },
  {
    name: "Nikhil Kurmachalam",
    role: "Research Staff",
    photo: null,
  },
  {
    name: "Geetanjali Oishe",
    role: "PhD Student",
    photo: null,
  },
];

const traineeTypes = [
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
  {
    icon: FlaskConical,
    title: "PhD Students",
    color: "from-emerald-600 to-teal-600",
    items: [
      "World-class mentorship with individualized research plans",
      "Deep research in cutting-edge computational biomedicine",
      "Publication track in top-tier journals and conferences",
      "Conference travel support (AMIA, ACM BCB, ISMB, etc.)",
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
];

const courses = [
  {
    school: "University of Alabama at Birmingham",
    list: [
      "INFO 603/703 - Biological Data Management",
      "INFO 693/793 - Bioinformatics Journal Club",
      "INFO 510 - Programming for Biologists",
    ],
  },
  {
    school: "Indiana University / Purdue University",
    list: [
      "INFO I519 - Introduction to Bioinformatics",
      "INFO I646 - Topics in Computational Systems Biology",
      "INFO I556 - Biological Database Management",
      "INFO I501 - Introduction to Informatics",
      "INFO I690 - Seminars in Bioinformatics",
      "CSCI 443 - Biological Database Management",
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

type Trainee = {
  name: string;
  degree: string;
  years: string;
  current: boolean;
  role: string;
  pubCount: number;
};

const traineeCategories: {
  label: string;
  icon: typeof Briefcase;
  color: string;
  trainees: Trainee[];
}[] = [
  {
    label: "Postdoctoral Fellows & K-Award Scholars",
    icon: Briefcase,
    color: "from-purple-500 to-violet-500",
    trainees: [
      { name: "Huu Phong Nguyen", degree: "PhD, Computer Science, U. of Coimbra", years: "2025-present", current: true, role: "Postdoc", pubCount: 1 },
      { name: "Rahul Sharma", degree: "PhD, Machine Learning, U. of Coimbra", years: "2021-2023", current: false, role: "Postdoc", pubCount: 2 },
      { name: "Ehsan Saghapour", degree: "PhD, Biomedical Engineering, Isfahan U.", years: "2021-2023", current: false, role: "Postdoc", pubCount: 6 },
      { name: "Zongliang Yue", degree: "PhD, General Biological Sciences, UAB", years: "2020-2023", current: false, role: "Postdoc", pubCount: 24 },
      { name: "Thanh Nguyen", degree: "PhD, Computer Science, Purdue", years: "2018-2021", current: false, role: "Postdoc", pubCount: 20 },
      { name: "Michael Falola", degree: "K23 Fellow, Psychiatry, UAB", years: "2018-2023", current: false, role: "Postdoc", pubCount: 0 },
      { name: "Noha Sharafeldin", degree: "K33 Fellow, Cancer Outcomes, UAB", years: "2017-2021", current: false, role: "Postdoc", pubCount: 0 },
      { name: "Syed Aun Muhammad", degree: "PhD, Biotechnology, Quaid-i-Azam U.", years: "2015", current: false, role: "Postdoc", pubCount: 6 },
      { name: "Jieun Jeong", degree: "PhD, Computer Science, Penn State", years: "2008-2009", current: false, role: "Postdoc", pubCount: 2 },
      { name: "Scott Harrison", degree: "PhD, Microbiology, Michigan State", years: "2007-2009", current: false, role: "Postdoc", pubCount: 3 },
      { name: "Sudipto Saha", degree: "PhD, Bioinformatics, JNU India", years: "2007-2008", current: false, role: "Postdoc", pubCount: 2 },
    ],
  },
  {
    label: "PhD Students (Advisor/Chair)",
    icon: FlaskConical,
    color: "from-emerald-600 to-teal-600",
    trainees: [
      { name: "Fuad Al Abir", degree: "PhD, Biomedical Informatics & Data Science, UAB", years: "Current", current: true, role: "PhD", pubCount: 5 },
      { name: "Delower Hossain", degree: "PhD, Computer Science, UAB", years: "Current", current: true, role: "PhD", pubCount: 6 },
      { name: "Geetanjali Oishe", degree: "PhD, UAB", years: "Current", current: true, role: "PhD", pubCount: 0 },
      { name: "Kevin Song", degree: "PhD, Biomedical Engineering, UAB", years: "2023-2025", current: false, role: "PhD", pubCount: 6 },
      { name: "Radomir Slominski", degree: "MD/PhD, Genetics & Bioinformatics, UAB", years: "2022-2023", current: false, role: "PhD", pubCount: 6 },
      { name: "Samuel Bharti", degree: "PhD, Biomedical Engineering, UAB", years: "2021-2022", current: false, role: "PhD", pubCount: 2 },
      { name: "Zongliang Yue", degree: "PhD, Genetics & Bioinformatics, UAB", years: "2020", current: false, role: "PhD", pubCount: 24 },
      { name: "Zhenyu Weng", degree: "PhD, CS & Engineering, Peking U. (co-advised)", years: "2020", current: false, role: "PhD", pubCount: 1 },
      { name: "Hui Huang", degree: "PhD, Bioinformatics, Indiana U.", years: "2014", current: false, role: "PhD", pubCount: 12 },
      { name: "Liang-Chin Huang", degree: "PhD, Bioinformatics, Indiana U.", years: "2013", current: false, role: "PhD", pubCount: 3 },
    ],
  },
  {
    label: "Master's Students (Advisor/Chair)",
    icon: GraduationCap,
    color: "from-emerald-500 to-teal-500",
    trainees: [
      { name: "Kevin Cao", degree: "MS, Bioinformatics, U. of Minnesota", years: "2017", current: false, role: "MS", pubCount: 0 },
      { name: "Nafisa Bulsara", degree: "MS, Bioinformatics, Indiana U.", years: "2017", current: false, role: "MS", pubCount: 0 },
      { name: "Madhura Kshirsagar", degree: "MS, Bioinformatics, Indiana U.", years: "2016", current: false, role: "MS", pubCount: 1 },
      { name: "Itika Arora", degree: "MS, Bioinformatics, Indiana U.", years: "2016", current: false, role: "MS", pubCount: 1 },
      { name: "Ronak P Shah", degree: "MS, Computer Science, Purdue", years: "2016", current: false, role: "MS", pubCount: 0 },
      { name: "Zongliang Yue", degree: "MS, Bioinformatics, Indiana U.", years: "2015", current: false, role: "MS", pubCount: 24 },
      { name: "Michael Neylon", degree: "MS, Bioinformatics, Indiana U.", years: "2015", current: false, role: "MS", pubCount: 4 },
      { name: "Anurag Bhattrai", degree: "MS, Bioinformatics, Indiana U.", years: "2016", current: false, role: "MS", pubCount: 0 },
      { name: "Sandeep Shantharam", degree: "MS, Bioinformatics, Indiana U.", years: "2015", current: false, role: "MS", pubCount: 0 },
      { name: "Ashish Jain", degree: "MS, Bioinformatics, Indiana U.", years: "2015", current: false, role: "MS", pubCount: 0 },
      { name: "Myron Snelson", degree: "MS, Bioinformatics, Indiana U.", years: "2014", current: false, role: "MS", pubCount: 0 },
      { name: "Chayaporn Suphavilai", degree: "MS, Computer Science, Purdue", years: "2014", current: false, role: "MS", pubCount: 3 },
      { name: "Madhankumar Sonachalam", degree: "MS, Bioinformatics, Indiana U.", years: "2012", current: false, role: "MS", pubCount: 2 },
      { name: "Prudhvi Mummaneni", degree: "MS, Bioinformatics, Indiana U.", years: "2011", current: false, role: "MS", pubCount: 0 },
      { name: "Ehsan Behnamghader", degree: "MS, Bioinformatics, Indiana U.", years: "2010", current: false, role: "MS", pubCount: 0 },
      { name: "Paul Hale", degree: "MS, Bioinformatics, Indiana U.", years: "2012", current: false, role: "MS", pubCount: 1 },
      { name: "Sudhir R. Chowbina", degree: "MS, Bioinformatics, Indiana U.", years: "2009", current: false, role: "MS", pubCount: 2 },
      { name: "Usha Katta", degree: "MS, Bioinformatics, Indiana U.", years: "2009", current: false, role: "MS", pubCount: 0 },
      { name: "Ragini Pandey", degree: "MS, Bioinformatics, Indiana U.", years: "2008", current: false, role: "MS", pubCount: 9 },
      { name: "Ramaprabha Ramamurthy", degree: "MS, Bioinformatics, Purdue", years: "2008", current: false, role: "MS", pubCount: 0 },
      { name: "Harini Kasamsetty", degree: "MS, Bioinformatics, Indiana U.", years: "2007", current: false, role: "MS", pubCount: 2 },
      { name: "Sheetal Khadke", degree: "MS, Computer Science, Purdue", years: "2007", current: false, role: "MS", pubCount: 0 },
      { name: "Lavanya Dhanapalan", degree: "MS, Computer Science, Purdue", years: "2007", current: false, role: "MS", pubCount: 2 },
      { name: "Sharmila Jothirajah", degree: "MS, Computer Science, Purdue", years: "2007", current: false, role: "MS", pubCount: 0 },
      { name: "Shailaja Taduri", degree: "MS, Computer Science, Purdue", years: "2007", current: false, role: "MS", pubCount: 1 },
      { name: "Bhanu Potugari", degree: "MS, Bioinformatics, Indiana U.", years: "2007", current: false, role: "MS", pubCount: 0 },
      { name: "Zhong Yan", degree: "MS, Bioinformatics, Indiana U.", years: "2006", current: false, role: "MS", pubCount: 3 },
      { name: "Warren Killian", degree: "MS, Computer Science, Purdue", years: "2006", current: false, role: "MS", pubCount: 0 },
      { name: "Sudharani Mamidipalli", degree: "MS, Bioinformatics, Indiana U.", years: "2006", current: false, role: "MS", pubCount: 2 },
    ],
  },
  {
    label: "Dissertation Committee Service",
    icon: Award,
    color: "from-slate-500 to-zinc-500",
    trainees: [
      { name: "Julia K. Ziebro", degree: "PhD, Cancer Biology, UAB", years: "Current", current: true, role: "PhD (committee)", pubCount: 0 },
      { name: "Kyle H. Cichos", degree: "PhD, Immunology, UAB", years: "2023", current: false, role: "PhD (committee)", pubCount: 0 },
      { name: "Eric Zhang", degree: "PhD, Biomedical Engineering, UAB", years: "2021", current: false, role: "PhD (committee)", pubCount: 6 },
      { name: "Mathew Neu", degree: "MD/PhD, Medical Scientist Training, UAB", years: "2020", current: false, role: "PhD (committee)", pubCount: 0 },
      { name: "Christian T. Stackhouse", degree: "PhD, Neuroscience, UAB", years: "2020", current: false, role: "PhD (committee)", pubCount: 2 },
      { name: "Vishal Sharma", degree: "PhD, Immunology, UAB", years: "2020", current: false, role: "PhD (committee)", pubCount: 0 },
      { name: "Deepali Jhamb", degree: "PhD, Bioinformatics, Indiana U.", years: "2014", current: false, role: "PhD (committee)", pubCount: 0 },
      { name: "Ao Zhou", degree: "PhD, Bioinformatics, Indiana U.", years: "2014", current: false, role: "PhD (committee)", pubCount: 1 },
      { name: "Jiangang Liu", degree: "PhD, Bioinformatics, Indiana U.", years: "2010", current: false, role: "PhD (committee)", pubCount: 0 },
      { name: "Joshua Heyen", degree: "PhD, Biochemistry, IU School of Medicine", years: "2010", current: false, role: "PhD (committee)", pubCount: 2 },
      { name: "Rati R. Nair", degree: "MS, Computer Science, Purdue", years: "2010", current: false, role: "MS (committee)", pubCount: 0 },
      { name: "Rini Pauly", degree: "MS, Bioinformatics, Indiana U.", years: "2010", current: false, role: "MS (committee)", pubCount: 0 },
      { name: "Uday Evani", degree: "MS, Bioinformatics, Indiana U.", years: "2010", current: false, role: "MS (committee)", pubCount: 0 },
      { name: "Mihai Stancu", degree: "MS, Health Informatics, Indiana U.", years: "2010", current: false, role: "MS (committee)", pubCount: 0 },
      { name: "Maliki Yacouba", degree: "MS, Bioinformatics, Georgetown U.", years: "2009", current: false, role: "MS (committee)", pubCount: 0 },
      { name: "Stuart Ough", degree: "MS, Human-Computer Interaction, Indiana U.", years: "2007", current: false, role: "MS (committee)", pubCount: 0 },
      { name: "Mindi Dippold", degree: "MS, Bioinformatics, Indiana U.", years: "2006", current: false, role: "MS (committee)", pubCount: 0 },
      { name: "Rakesh Dhaval", degree: "MS, Computer Science, Purdue", years: "2005", current: false, role: "MS (committee)", pubCount: 0 },
    ],
  },
  {
    label: "Undergraduate Researchers",
    icon: BookOpen,
    color: "from-amber-500 to-orange-500",
    trainees: [
      { name: "Kevin Song", degree: "Biology, Stanford University", years: "Summer 2014", current: false, role: "Undergrad", pubCount: 6 },
      { name: "Sara Ibrahim", degree: "Pre-med, IUPUI", years: "2010-2014", current: false, role: "Undergrad", pubCount: 4 },
      { name: "Thanh Nguyen", degree: "Computer Science, IUPUI", years: "2012-2013", current: false, role: "Undergrad", pubCount: 20 },
      { name: "Don Capouch", degree: "ECE, IUPUI", years: "2011-2013", current: false, role: "Undergrad", pubCount: 0 },
      { name: "Sujay Chandorkar", degree: "CIS, IUPUI", years: "2011-2012", current: false, role: "Undergrad", pubCount: 0 },
      { name: "Marianne McKenzie", degree: "Mathematics, IUPUI", years: "2010-2011", current: false, role: "Undergrad", pubCount: 1 },
      { name: "Everton Lima", degree: "Computer Science, IUPUI", years: "2010-2011", current: false, role: "Undergrad", pubCount: 0 },
      { name: "Peter Li", degree: "Computer Science, Northwestern", years: "Summer 2010-2012", current: false, role: "Undergrad", pubCount: 1 },
      { name: "Taiwo Ajumobi", degree: "Biology, DePauw University", years: "Summer 2010", current: false, role: "Undergrad", pubCount: 1 },
      { name: "Israel Aguilera-Laina", degree: "Chemistry, IUPUI", years: "Summer 2009", current: false, role: "Undergrad", pubCount: 0 },
      { name: "Alexander Scherer", degree: "Biology, Stanford University", years: "Summer 2008", current: false, role: "Undergrad", pubCount: 0 },
      { name: "Ayotunde O. Ositelu", degree: "Pre-Med, Vanderbilt University", years: "Summer 2007", current: false, role: "Undergrad", pubCount: 0 },
    ],
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
          <ChevronUp className="h-5 w-5 shrink-0 text-emerald-700" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 py-24 text-white">
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
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
              Join a training lineage spanning three decades and multiple continents -- from Peking University to UAB, we cultivate researchers who change the world.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Current Lab Members */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Current Lab Members
          </h2>
          <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
            Meet the researchers currently working in the AI.MED lab
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {currentMembers.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-4 h-28 w-28 overflow-hidden rounded-full bg-slate-100 dark:bg-zinc-800">
                {member.photo ? (
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-300 dark:text-zinc-600">
                    {member.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                )}
              </div>
              <h3 className="text-center text-base font-bold text-slate-900 dark:text-slate-100">
                {member.name}
              </h3>
              <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
                {member.role}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Institutional Lineage of the Lab Director */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Institutional Lineage of the Lab Director
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
                  <Building className="h-4 w-4 text-emerald-700" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {item.institution}
                  </h3>
                </div>
                <div className="mt-1 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {item.period}
                  </span>
                </div>
              </div>
              {i < lineage.length - 1 && (
                <div className="my-1 flex flex-col items-center text-emerald-400 dark:text-emerald-700">
                  <div className="h-6 w-0.5 bg-emerald-300 dark:bg-emerald-800" />
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
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-700" />
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

      {/* Lab Alumni & Trainees */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
            Lab Alumni &amp; Trainees
          </h2>
          <p className="mb-4 text-center text-slate-600 dark:text-slate-400">
            Over 80 researchers mentored across two decades and multiple institutions
          </p>
          <p className="mb-12 text-center text-xs text-slate-400 dark:text-slate-500">
            Publication counts reflect co-authored papers with Prof. Chen
          </p>
        </motion.div>

        <div className="space-y-10">
          {traineeCategories.map((cat, catIdx) => {
            const CatIcon = cat.icon;
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: catIdx * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Category header */}
                <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-zinc-800">
                  <div
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${cat.color} text-white`}
                  >
                    <CatIcon className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {cat.label}
                  </h3>
                  <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-zinc-800 dark:text-slate-400">
                    {cat.trainees.length}
                  </span>
                </div>

                {/* Trainee list */}
                <div className="divide-y divide-slate-50 dark:divide-zinc-800/50">
                  {[...cat.trainees].sort((a, b) => b.pubCount - a.pubCount).map((t, tIdx) => (
                    <div
                      key={`${t.name}-${tIdx}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 px-6 py-3 text-sm"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {t.name}
                        {t.current && (
                          <span className="ml-2 inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700 dark:bg-green-900/40 dark:text-green-400">
                            Current
                          </span>
                        )}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {t.degree}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {t.years}
                      </span>
                      {t.pubCount > 0 && (
                        <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          <FileText className="h-3 w-3" />
                          {t.pubCount} pub{t.pubCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* NIH T32 Training Program Participation */}
      <section className="bg-slate-50 py-20 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 text-center text-3xl font-bold text-slate-900 dark:text-slate-100">
              NIH Training Program Participation
            </h2>
            <p className="mb-12 text-center text-slate-600 dark:text-slate-400">
              Predoctoral research mentor on NIH T32 institutional training grants at UAB
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { name: "Brain Tumor Biology", status: "active" },
              { name: "Immunology", status: "active", period: "2017–present" },
              { name: "Rheumatic and Musculoskeletal Diseases", status: "active", period: "2017–present" },
              { name: "UAB-HudsonAlpha Genomic Medicine", status: "active", period: "2017–present" },
              { name: "Multifaceted Translational Approach to Mental Illness", status: "pending" },
              { name: "GeoHealth Predoctoral Training", status: "pending" },
              { name: "Research Training in Engineered Tissue Constructs and Related Technologies", status: "pending" },
              { name: "Integrating Computational Biology Analytics into Research on the Basic Mechanisms of Diabetes", status: "pending" },
            ].map((prog, i) => (
              <motion.div
                key={prog.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-3">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      NIH T32: {prog.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Predoctoral Research Mentor, UAB
                      {prog.period && <> &middot; {prog.period}</>}
                    </p>
                    <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      prog.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                    }`}>
                      {prog.status === "active" ? "Active" : "Application Pending"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional training programs */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { name: "Masters of Science Biomedical Sciences (MSBMS) Training Faculty, UAB", period: "2017–present" },
              { name: "Graduate Biomedical Sciences (GBS) Doctoral Training Program Faculty, UAB", period: "2016–present" },
              { name: "Graduate Bioinformatics Training Program, Indiana University School of Informatics and Computing", period: "2004–2016" },
            ].map((prog, i) => (
              <motion.div
                key={prog.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-3">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{prog.name}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">UAB &middot; {prog.period}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses Taught */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
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
                  <GraduationCap className="h-5 w-5 text-emerald-700" />
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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-emerald-800"
          >
            Apply to Join the Lab
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
