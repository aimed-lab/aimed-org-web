"use client";

import { motion } from "framer-motion";
import {
  Building2,
  BookOpen,
  Users,
  Award,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const grantPanels = [
  {
    agency: "NIH",
    full: "National Institutes of Health",
    panels: [
      { name: "Special Emphasis Panel (various)", years: "2009–present" },
      { name: "NIDA P30 Center of Excellence Panel", years: "2026" },
      { name: "Biodata Management & Computational Modeling", years: "2025" },
      { name: "NCI Informatics Technology for Cancer Research (ITCR)", years: "2025" },
      { name: "Support for Conferences & Scientific Meetings", years: "2024" },
      { name: "NCI Genomic Data Analysis Network (U24)", years: "2021" },
      { name: "NIDA AI for Drug Discovery SBIR/STTR", years: "2021" },
      { name: "NCI Program Project (P01) Review Panel", years: "2018, 2020, 2021" },
      { name: "Trans-Omics Precision Medicine (TOPMed)", years: "2017" },
      { name: "NCI Integrative Cancer Biology Program", years: "2017" },
      { name: "Interdisciplinary Molecular Sciences SBIR/STTR", years: "2015–2016" },
      { name: "TEDDY Data Analysis Panel", years: "2015" },
      { name: "AREA: Bioengineering, Chemistry & Imaging (Chair)", years: "2013" },
      { name: "T32 Institutional Research Training Review", years: "2018" },
      { name: "Neurotechnology Study Section", years: "2011" },
    ],
  },
  {
    agency: "NSF",
    full: "National Science Foundation",
    panels: [
      { name: "National AI Institute Planning Panel", years: "2020" },
      { name: "Pathways to Open Source Systems (POSE)", years: "2022" },
    ],
  },
  {
    agency: "ASCO",
    full: "American Society of Clinical Oncology",
    panels: [
      { name: "Conquer Cancer Foundation Grants Selection Committee", years: "2022–2025" },
      { name: "Young Investigator Award (YIA) Grant Review", years: "2023–present" },
    ],
  },
  {
    agency: "AHA",
    full: "American Heart Association",
    panels: [
      { name: "Institute for Precision Cardiovascular Medicine Data Science", years: "2019" },
      { name: "Precision Medicine Data Grant Portfolio", years: "2019" },
    ],
  },
  {
    agency: "International",
    full: "International Agencies",
    panels: [
      { name: "Qatar Research, Development & Innovation (QRDI) Council", years: "2020–2024" },
      { name: "Austrian Science Fund Review Panel", years: "2017" },
      { name: "Genome Canada", years: "2012" },
      { name: "France National Institute of Health (INSERM)", years: "2022" },
    ],
  },
  {
    agency: "Other U.S.",
    full: "Other U.S. Agencies",
    panels: [
      { name: "U.S. Army Corps of Engineers ERDC Review", years: "2019" },
      { name: "Florida Department of Health Biomedical Grant Review", years: "2018" },
      { name: "Pennsylvania Department of Health Big Data Panel", years: "2013, 2018" },
    ],
  },
];

const journalEditorships = [
  { journal: "Frontiers in Big Data / Artificial Intelligence", role: "Associate Editor", years: "2020–present" },
  { journal: "BMC Bioinformatics", role: "Associate Editor", years: "2019–present" },
  { journal: "JAMIA (Journal of the American Medical Informatics Association)", role: "Editorial Board", years: "2018–present" },
  { journal: "ACM/IEEE Trans. Computational Biology & Bioinformatics", role: "Guest Editor", years: "2008–present" },
  { journal: "IEEE Journal of Biomedical & Health Informatics", role: "Associate Editor", years: "2013–2015" },
  { journal: "BMC Systems Biology", role: "Associate Editor", years: "2009–2019" },
  { journal: "Clinical Pharmacology & Therapeutics (Nature)", role: "Guest Editor", years: "2013" },
  { journal: "Personalized Medicine", role: "Editorial Board", years: "2011–2022" },
  { journal: "Int. J. Data Mining and Bioinformatics", role: "Guest Editor", years: "2009–2012" },
  { journal: "Int. J. Bioinformatics Research & Applications", role: "Editorial Board", years: "2007–2015" },
  { journal: "Proteomics Insights", role: "Editorial Board", years: "2008–2016" },
];

const conferences = [
  { name: "ACM KDD — BIOKDD Workshop", role: "Program Co-chair / General Chair", years: "2007–present" },
  { name: "ACM KDD Health Day", role: "Program Co-chair", years: "2024, 2026" },
  { name: "NIH CFDE Bi-annual Meeting", role: "General Chair", years: "2024–present" },
  { name: "ATTIS (Translational Informatics Symposium)", role: "General Chair", years: "2016–present" },
  { name: "NIH Bridge2AI Annual Meeting", role: "Program Co-chair", years: "2024" },
  { name: "MCBIOS (Mid-South Computational Biology)", role: "General/Steering Chair", years: "2019–2024" },
  { name: "BioTechX Europe / USA", role: "Session Chair", years: "2021–present" },
  { name: "Festival of Biologics", role: "Session Chair", years: "2024–2025" },
  { name: "GLBIO (Great Lakes Bioinformatics)", role: "Session Chair / PC", years: "2011–2023" },
  { name: "AAPS PharmSci 360", role: "Track Chair", years: "2021–2022" },
  { name: "AMIA Annual Symposium", role: "Session Chair / PC", years: "2018–2022" },
  { name: "AIME (AI in Medicine)", role: "Program Committee", years: "2020" },
  { name: "ISMB (Intelligent Systems for Molecular Biology)", role: "Session Chair / PC", years: "2018–2019" },
  { name: "IEEE ICCABS", role: "Program Co-chair", years: "2014" },
  { name: "IEEE BIBM", role: "Workshop Co-chair / Area Chair", years: "2009–2011" },
  { name: "ACM BCB (Bioinformatics & Computational Biology)", role: "Session Chair / PC", years: "2010–2015" },
  { name: "IEEE EIT", role: "Program Chair", years: "2012" },
  { name: "ACM SAC (Applied Computing)", role: "Track Co-chair", years: "2004–2007" },
  { name: "CSB (Computational Systems Biology)", role: "Session Chair / PC", years: "2002–2010" },
];

const committees = [
  { name: "NHLBI Progenitor Cell Translational Consortium Omics Committee", years: "2019" },
  { name: "NCI Patient-derived Models of Cancer (PDMC) Steering Committee", years: "2019" },
  { name: "AMIA Working Group Steering Committee", years: "2018–2021" },
  { name: "National Academies IOM Committee on Regulatory Systems", years: "2011–2012" },
];

/* ------------------------------------------------------------------ */
/*  Animation                                                          */
/* ------------------------------------------------------------------ */

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white dark:from-zinc-900 dark:to-zinc-950 py-16 sm:py-20 md:py-36">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-900/40 px-4 py-2 text-sm font-medium text-emerald-800 dark:text-emerald-300">
              <Users className="h-4 w-4" />
              Community leadership
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Professional Service
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
              Grant review panels, editorial boards, conference organization,
              and national committee service.
            </p>
          </motion.div>
        </div>
      </section>

      {/* National Committees */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-center gap-2">
          <Award className="h-5 w-5 text-emerald-700" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">National & International Committees</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {committees.map((c, i) => (
            <motion.div
              key={c.name}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.years}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Grant Review Panels */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-16 dark:border-zinc-800/50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-700" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Grant Review Panels</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {grantPanels.map((agency, ai) => (
              <motion.div
                key={agency.agency}
                variants={fadeUp}
                custom={ai}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-3 flex items-center gap-2">
                  <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                    {agency.agency}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{agency.full}</span>
                </div>
                <div className="space-y-2">
                  {agency.panels.map((p) => (
                    <div key={p.name} className="flex items-start justify-between gap-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">{p.name}</p>
                      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{p.years}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journal Editorial */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald-700" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Journal Editorial Boards</h2>
        </div>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Ad hoc reviewer for 50+ journals including Nature Reviews Genetics, Science Translational Medicine, PLoS Computational Biology, Nucleic Acids Research, Bioinformatics, and more.
        </p>
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Journal</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Role</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">Years</th>
              </tr>
            </thead>
            <tbody>
              {journalEditorships.map((j, i) => (
                <tr
                  key={j.journal}
                  className={`border-t border-slate-100 dark:border-zinc-800 ${
                    i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-slate-50/50 dark:bg-zinc-900/30"
                  }`}
                >
                  <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{j.journal}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      j.role === "Associate Editor"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : j.role === "Guest Editor"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300"
                        : "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300"
                    }`}>
                      {j.role}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{j.years}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Conference Organization */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-16 dark:border-zinc-800/50 dark:bg-zinc-900/40">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-700" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Conference Organization</h2>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-zinc-900">
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Conference</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-slate-100">Role</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">Years</th>
                </tr>
              </thead>
              <tbody>
                {conferences.map((c, i) => (
                  <tr
                    key={c.name}
                    className={`border-t border-slate-100 dark:border-zinc-800 ${
                      i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-slate-50/50 dark:bg-zinc-900/30"
                    }`}
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-700 dark:text-slate-300">{c.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">{c.role}</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 dark:text-slate-400">{c.years}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
