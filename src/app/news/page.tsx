'use client';

import { motion } from 'framer-motion';
import {
  Newspaper,
  Calendar,
  ArrowRight,
  Camera,
  Users,
  Beaker,
  Award,
  PartyPopper,
} from 'lucide-react';

const newsItems = [
  {
    id: 1,
    date: '2024-03-15',
    headline: 'AI.MED Lab Receives NIH R01 Grant for Digital Twin Research',
    summary:
      'The National Institutes of Health has awarded a five-year R01 grant to support our pioneering work on patient-specific digital twins for precision oncology, enabling computational modeling of treatment response at an individual level.',
    category: 'Funding',
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    id: 2,
    date: '2024-02-28',
    headline: 'PhD Student Wins Best Paper Award at AMIA Annual Symposium',
    summary:
      'Congratulations to our PhD candidate for receiving the Best Paper Award at AMIA 2024 for work on knowledge-graph-augmented clinical decision support systems leveraging large language models.',
    category: 'Award',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 3,
    date: '2024-01-10',
    headline: 'New Publication in Nature Methods on Multi-omics Integration',
    summary:
      'Our latest paper presents a novel deep learning framework for integrating transcriptomic, proteomic, and metabolomic data to uncover disease-specific molecular signatures across cancer subtypes.',
    category: 'Publication',
    gradient: 'from-emerald-600 to-teal-500',
  },
  {
    id: 4,
    date: '2023-11-20',
    headline: 'Prof. Chen Named Top 100 AI Leaders in Drug Discovery',
    summary:
      'Professor Jake Chen has been recognized among the Top 100 AI Leaders in Drug Discovery by Deep Pharma Intelligence for contributions to AI-driven biomedical knowledge mining and translational informatics.',
    category: 'Recognition',
    gradient: 'from-purple-600 to-pink-500',
  },
  {
    id: 5,
    date: '2023-09-01',
    headline: 'Lab Opens New Computational Core at SPARC',
    summary:
      'AI.MED has inaugurated a new high-performance computational core within the Systems, Precision Analytics, and Research Center (SPARC), expanding GPU capacity for large-scale biomedical AI training.',
    category: 'Infrastructure',
    gradient: 'from-slate-600 to-zinc-500',
  },
];

const galleryItems = [
  {
    caption: 'AMIA 2024 Annual Symposium - Team Presentation',
    gradient: 'from-blue-500 to-indigo-600',
    icon: Users,
  },
  {
    caption: 'Lab Retreat - Brainstorming Session',
    gradient: 'from-emerald-500 to-teal-600',
    icon: Beaker,
  },
  {
    caption: 'NIH Study Section Review Panel',
    gradient: 'from-amber-500 to-orange-600',
    icon: Award,
  },
  {
    caption: 'PhD Candidate Defense Celebration',
    gradient: 'from-pink-500 to-rose-600',
    icon: PartyPopper,
  },
  {
    caption: 'Guest Lecture at Peking University',
    gradient: 'from-purple-500 to-violet-600',
    icon: Users,
  },
  {
    caption: 'SPARC Grand Opening Ceremony',
    gradient: 'from-cyan-500 to-blue-600',
    icon: Camera,
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 py-24 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Newspaper className="mx-auto mb-4 h-12 w-12 opacity-80" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              News &amp; Updates
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              The latest from AI.MED -- grants, publications, awards, and milestones
              shaping the future of AI-driven biomedical research.
            </p>
          </motion.div>
        </div>
      </section>

      {/* News Grid */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {newsItems.map((item, i) => (
            <motion.article
              key={item.id}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              variants={fadeUp}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              {/* Image placeholder */}
              <div
                className={`relative h-44 bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
              >
                <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                  {item.category}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  {formatDate(item.date)}
                </div>
                <h3 className="mb-2 text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
                  {item.headline}
                </h3>
                <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {item.summary}
                </p>
                <a
                  href="#"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Read more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Media & Life Gallery */}
      <section className="border-t border-slate-200 bg-slate-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <Camera className="mx-auto mb-3 h-8 w-8 text-blue-600 dark:text-blue-400" />
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Media &amp; Life
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-slate-600 dark:text-slate-400">
              Conference moments, lab activities, and celebrations from the AI.MED community.
            </p>
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {galleryItems.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  custom={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-20px' }}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-xl"
                >
                  <div
                    className={`flex h-56 items-center justify-center bg-gradient-to-br ${item.gradient}`}
                  >
                    <Icon className="h-16 w-16 text-white/30" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-10">
                    <p className="text-sm font-medium text-white">{item.caption}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
