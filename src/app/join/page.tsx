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
  FlaskConical,
  Users,
  FileText,
  X,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Pathway Cards                                                      */
/* ------------------------------------------------------------------ */
const pathways = [
  {
    icon: GraduationCap,
    title: 'Intern or Volunteer',
    audience: 'High School, Undergraduate & Master\'s Students',
    description:
      'A limited number of internship and volunteer positions are available each year for exceptional students who demonstrate strong analytical skills, self-motivation, and a genuine commitment to biomedical AI research. Candidates must be prepared to dedicate significant time and effort; casual interest is not sufficient.',
    gradient: 'from-emerald-700 to-teal-500',
  },
  {
    icon: FlaskConical,
    title: 'Visiting Scholar',
    audience: 'Visiting Researchers & Exchange Scholars',
    description:
      'AI.MED selectively hosts visiting scholars who bring complementary expertise and a track record of peer-reviewed publications. Visiting positions are highly competitive and require a clearly defined research plan aligned with our ongoing projects. Applicants must secure their own funding or sponsorship.',
    gradient: 'from-teal-600 to-emerald-500',
  },
  {
    icon: Microscope,
    title: 'PhD Student',
    audience: 'Doctoral Applicants',
    description:
      'We accept only a small number of PhD students each cycle. Successful candidates typically hold strong quantitative backgrounds, demonstrate prior research experience, and show evidence of independent problem-solving ability. Admission is through UAB graduate programs; interest alone does not guarantee a position.',
    gradient: 'from-emerald-600 to-teal-500',
  },
  {
    icon: Users,
    title: 'Postdoc or Staff',
    audience: 'Postdoctoral Researchers & Research Staff',
    description:
      'Postdoctoral and staff positions require a proven publication record, deep technical expertise, and the ability to lead independent research streams. We hold our team to the highest standards of scientific rigor and productivity. Positions are funded and filled on a competitive, as-needed basis.',
    gradient: 'from-indigo-600 to-violet-500',
  },
  {
    icon: Handshake,
    title: 'Collaborator',
    audience: 'Academic & Industry Partners',
    description:
      'AI.MED partners selectively with investigators and organizations whose expertise complements our research mission. We prioritize collaborations that lead to high-impact publications, funded grants, or translational outcomes. Proposals should clearly articulate mutual benefit and scientific merit.',
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
    q: 'How competitive is it to join AI.MED?',
    a: 'Extremely competitive. We receive a large volume of inquiries each year and can only accommodate a small fraction. Candidates who stand out typically have strong academic records, demonstrated research experience, and a clear alignment with our ongoing projects.',
  },
  {
    q: 'What qualifications do I need to join as a PhD student?',
    a: 'We require a strong quantitative background (CS, bioinformatics, statistics, or related fields), solid programming skills in Python or R, and meaningful prior research experience. Admission is through UAB graduate programs; simply expressing interest does not guarantee consideration.',
  },
  {
    q: 'Are there remote or hybrid positions available?',
    a: 'Most positions require on-site presence at UAB. Limited hybrid arrangements may be considered for specific projects on a case-by-case basis, but only for candidates who have already demonstrated exceptional productivity and independence.',
  },
  {
    q: 'How long does it take to hear back after submitting an inquiry?',
    a: 'We review inquiries on a rolling basis. Due to the high volume of applications, only shortlisted candidates will be contacted, typically within four to six weeks. If you do not hear back, your inquiry was not selected for further consideration at this time.',
  },
  {
    q: 'Do you accept undergraduate interns during the summer?',
    a: 'A very limited number of summer internship positions (typically 10-12 weeks) are available for undergraduates with strong quantitative skills and prior lab experience. Applications open in January each year. Selection is highly competitive.',
  },
  {
    q: 'What funding opportunities are available for postdocs?',
    a: 'AI.MED postdocs are funded through a mix of NIH grants, institutional training awards, and industry partnerships. We strongly favor candidates who are pursuing or willing to pursue independent fellowships (e.g., NIH F32, K99), as this reflects the level of initiative and ambition we expect.',
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
interface UploadedFile {
  file: File;
  label: string;
}

const FILE_LABELS = ["Cover Letter", "Resume / CV", "Transcript", "Work Sample", "Other"];

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError('');
    const fd = new FormData(e.currentTarget);
    const v = validate(fd);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name')?.toString().trim(),
          email: fd.get('email')?.toString().trim(),
          role: fd.get('role')?.toString(),
          interestArea: fd.get('interest')?.toString(),
          message: fd.get('message')?.toString().trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setSubmitError(data.error || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 to-teal-800 py-16 sm:py-20 md:py-24 text-white">
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
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Opportunities at AI.MED</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-emerald-100">
              AI.MED attracts exceptional talent committed to advancing biomedical AI at the
              highest level. We set a high bar for excellence -- only a select number of
              positions are available each year for interns, volunteers, visiting scholars,
              PhD students, postdocs, staff, and collaborators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pathways */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Opportunity Categories
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
                <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  {p.audience}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {p.description}
                </p>
                <button
                  onClick={scrollToForm}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
                >
                  Submit Inquiry
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
              Submit an Inquiry
            </h2>
            <p className="mb-10 text-center text-slate-600 dark:text-slate-400">
              All inquiries undergo a selective review process. Please provide thorough and
              accurate information. Only shortlisted candidates will be contacted.
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
                  Thank you for your interest in AI.MED. Your inquiry will be reviewed
                  carefully. Only shortlisted candidates will be contacted.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                  >
                    <option value="" disabled>
                      Select your role...
                    </option>
                    <option>High School Student</option>
                    <option>Undergraduate</option>
                    <option>Master&apos;s Student</option>
                    <option>PhD Applicant</option>
                    <option>Intern</option>
                    <option>Volunteer</option>
                    <option>Visiting Scholar</option>
                    <option>Postdoc</option>
                    <option>Staff</option>
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                    placeholder="Tell us about your background, goals, and how you would like to contribute..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* Supporting Documents */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Supporting Documents
                  </label>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/20 mb-3">
                    <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
                      <strong>Tip:</strong> Serious inquirers should include a <strong>cover letter</strong>, a <strong>resume / CV</strong>, and <strong>up-to-date undergraduate or graduate transcripts</strong>. You may also attach work samples such as publications, code portfolios, or project reports.
                    </p>
                  </div>

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-3 space-y-2">
                      {uploadedFiles.map((uf, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800"
                        >
                          <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="flex-1 truncate text-sm text-slate-700 dark:text-slate-300">
                            {uf.file.name}
                          </span>
                          <select
                            value={uf.label}
                            onChange={(e) => {
                              const updated = [...uploadedFiles];
                              updated[idx] = { ...uf, label: e.target.value };
                              setUploadedFiles(updated);
                            }}
                            className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700 dark:border-zinc-600 dark:bg-zinc-700 dark:text-slate-300"
                          >
                            {FILE_LABELS.map((l) => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            aria-label="Remove file"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add files button */}
                  <div className="flex items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800">
                    <Upload className="h-5 w-5 text-slate-400" />
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        const newFiles = files.map((f) => {
                          const name = f.name.toLowerCase();
                          let label = "Other";
                          if (name.includes("cover") || name.includes("letter")) label = "Cover Letter";
                          else if (name.includes("resume") || name.includes("cv")) label = "Resume / CV";
                          else if (name.includes("transcript")) label = "Transcript";
                          else if (name.includes("sample") || name.includes("portfolio") || name.includes("paper")) label = "Work Sample";
                          return { file: f, label };
                        });
                        setUploadedFiles((prev) => [...prev, ...newFiles]);
                        e.target.value = "";
                      }}
                      className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-emerald-700 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-800 dark:text-slate-400"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    PDF, DOC, or DOCX (max 10 MB each). You may upload multiple files.
                  </p>
                </div>

                {/* Submit Error */}
                {submitError && (
                  <p className="text-sm text-red-500">{submitError}</p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      Submit Inquiry
                      <Send className="h-4 w-4" />
                    </>
                  )}
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
