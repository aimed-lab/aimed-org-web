'use client';

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Microscope,
  Handshake,
  Megaphone,
  ChevronDown,
  CheckCircle2,
  Upload,
  Send,
  Sparkles,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Pathway Cards                                                      */
/* ------------------------------------------------------------------ */
const pathways = [
  {
    icon: GraduationCap,
    title: 'Prospective Students',
    audience: 'High School, Undergraduate, Master\'s & PhD',
    description:
      'Join AI.MED as a research trainee or graduate student. We welcome motivated students at every level who are passionate about applying AI to solve biomedical challenges. Gain hands-on experience with cutting-edge computational methods.',
    gradient: 'from-blue-600 to-cyan-500',
  },
  {
    icon: Microscope,
    title: 'Postdocs & Medical Students',
    audience: 'Postdoctoral Researchers & MD Students',
    description:
      'Pursue independent and collaborative research in a highly interdisciplinary environment. Our postdocs lead projects spanning knowledge graphs, multi-omics, drug discovery, and clinical informatics.',
    gradient: 'from-emerald-600 to-teal-500',
  },
  {
    icon: Handshake,
    title: 'Collaborators & Faculty',
    audience: 'Academic & Industry Partners',
    description:
      'Partner with AI.MED on grants, joint publications, or translational projects. We actively seek collaborators across biomedicine, computer science, pharmacy, and data science to tackle grand challenges.',
    gradient: 'from-purple-600 to-pink-500',
  },
  {
    icon: Megaphone,
    title: 'Media & Speaking Invitations',
    audience: 'Press, Conferences & Panels',
    description:
      'Invite Prof. Chen or AI.MED members for keynotes, panel discussions, media interviews, or podcast appearances on AI in healthcare, precision medicine, and drug discovery.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */
const faqs = [
  {
    q: 'What qualifications do I need to join as a PhD student?',
    a: 'We look for strong quantitative backgrounds (CS, bioinformatics, statistics, or related fields), programming skills in Python or R, and genuine curiosity about biomedical problems. Prior research experience is a plus but not mandatory.',
  },
  {
    q: 'Are there remote or hybrid positions available?',
    a: 'Some research roles can be performed in a hybrid format depending on the project. Please mention your location preference in the inquiry form and we will discuss options.',
  },
  {
    q: 'How long does it take to hear back after submitting an inquiry?',
    a: 'We review inquiries on a rolling basis and aim to respond within two weeks. High-volume periods (e.g., fall admissions season) may take slightly longer.',
  },
  {
    q: 'Do you accept undergraduate interns during the summer?',
    a: 'Yes! We offer summer research experiences for undergraduates, typically 10-12 weeks. Applications open in January each year. International students with appropriate visa status are welcome.',
  },
  {
    q: 'What funding opportunities are available for postdocs?',
    a: 'AI.MED postdocs are funded through a mix of NIH grants, institutional training awards, and industry partnerships. We also support applicants pursuing independent fellowships (e.g., NIH F32, K99).',
  },
];

/* ------------------------------------------------------------------ */
/*  Animations                                                         */
/* ------------------------------------------------------------------ */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */
export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function scrollToForm() {
    document.getElementById('inquiry-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  function validate(form: FormData): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.get('name')?.toString().trim()) errs.name = 'Name is required.';
    const email = form.get('email')?.toString().trim() ?? '';
    if (!email) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email.';
    if (!form.get('role')?.toString()) errs.role = 'Please select a role.';
    if (!form.get('interest')?.toString()) errs.interest = 'Please select an interest area.';
    if (!form.get('message')?.toString().trim()) errs.message = 'Message is required.';
    return errs;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v = validate(fd);
    setErrors(v);
    if (Object.keys(v).length === 0) {
      setSubmitted(true);
    }
  }

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
            <Sparkles className="mx-auto mb-4 h-12 w-12 opacity-80" />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Join AI.MED</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
              We are on a mission to transform biomedicine through artificial intelligence.
              Whether you are a student, researcher, clinician, or collaborator -- there is a
              place for you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pathways */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Find Your Path
        </h2>
        <div className="grid gap-8 md:grid-cols-2">
          {pathways.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                variants={fadeUp}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.gradient}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                  {p.audience}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {p.description}
                </p>
                <button
                  onClick={scrollToForm}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Start Inquiry
                  <Send className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Inquiry Form */}
      <section
        id="inquiry-form"
        className="border-t border-slate-200 bg-slate-50 py-20 dark:border-zinc-800 dark:bg-zinc-900/50"
      >
        <div className="mx-auto max-w-2xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Contact &amp; Inquiry
            </h2>
            <p className="mb-10 text-center text-slate-600 dark:text-slate-400">
              Fill out the form below and we will get back to you shortly.
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 rounded-2xl border border-green-200 bg-green-50 p-12 text-center dark:border-green-900 dark:bg-green-950/40"
              >
                <CheckCircle2 className="h-14 w-14 text-green-600 dark:text-green-400" />
                <h3 className="text-2xl font-semibold text-green-800 dark:text-green-200">
                  Inquiry Submitted!
                </h3>
                <p className="text-green-700 dark:text-green-300">
                  Thank you for your interest in AI.MED. We will review your inquiry and
                  respond within two weeks.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Submit another inquiry
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                {/* Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    defaultValue=""
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                  >
                    <option value="" disabled>
                      Select your role...
                    </option>
                    <option>High School Student</option>
                    <option>Undergraduate</option>
                    <option>Master&apos;s Student</option>
                    <option>PhD Applicant</option>
                    <option>Postdoc</option>
                    <option>Faculty/Collaborator</option>
                    <option>Media/Press</option>
                    <option>Other</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-red-500">{errors.role}</p>
                  )}
                </div>

                {/* Interest Area */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Interest Area <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="interest"
                    defaultValue=""
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                  >
                    <option value="" disabled>
                      Select an interest area...
                    </option>
                    <option>Drug Discovery</option>
                    <option>Knowledge Networks</option>
                    <option>Multi-omics</option>
                    <option>AI/ML</option>
                    <option>Digital Twins</option>
                    <option>Data Infrastructure</option>
                    <option>Other</option>
                  </select>
                  {errors.interest && (
                    <p className="mt-1 text-xs text-red-500">{errors.interest}</p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                    placeholder="Tell us about your background, goals, and how you would like to contribute..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* Resume / CV Upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Resume / CV Upload
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <input
                      name="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700 dark:text-slate-400"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">PDF, DOC, or DOCX (max 10 MB)</p>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Submit Inquiry
                  <Send className="h-4 w-4" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="rounded-xl border border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left"
                >
                  <span className="pr-4 text-sm font-medium text-slate-900 dark:text-slate-100">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
