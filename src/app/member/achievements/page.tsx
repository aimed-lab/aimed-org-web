'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Trophy,
  BookOpen,
  Code2,
  FileText,
  ExternalLink,
  ShieldAlert,
  Send,
  CheckCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Publication {
  id: number;
  title: string;
  authors: string;
  year: number;
  journal: string | null;
  doi: string | null;
}

interface Patent {
  id: number;
  title: string;
  year: number | null;
  inventors: string | null;
  filingInfo: string | null;
}

interface Software {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  githubUrl: string | null;
  category: string | null;
}

interface MemberInfo {
  name: string;
  email: string;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [software, setSoftware] = useState<Software[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'publications' | 'software' | 'patents'>('publications');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  async function submitToLab(contentType: string, title: string, data: Record<string, unknown>, itemKey: string) {
    if (!confirm(`Submit "${title}" for admin review to be published on the public website?`)) return;
    setSubmittingId(itemKey);
    try {
      const res = await fetch('/api/member/submit-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, title, data }),
      });
      if (res.ok) {
        setSubmittedId(itemKey);
        setTimeout(() => setSubmittedId(null), 3000);
      } else {
        const d = await res.json();
        alert(d.error || 'Submission failed');
      }
    } catch {
      alert('Submission failed');
    } finally {
      setSubmittingId(null);
    }
  }

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/achievements').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, a]) => {
        if (!m) {
          setError('Not authenticated');
          return;
        }
        setMember(m);
        if (a) {
          setPublications(a.publications || []);
          setPatents(a.patents || []);
          setSoftware(a.software || []);
        }
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">Authentication required.</p>
        <button
          onClick={() => router.push('/member/activate')}
          className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Go to Activation
        </button>
      </div>
    );
  }

  const tabs = [
    { key: 'publications' as const, label: 'Publications', icon: BookOpen, count: publications.length },
    { key: 'software' as const, label: 'Software', icon: Code2, count: software.length },
    { key: 'patents' as const, label: 'Patents', icon: FileText, count: patents.length },
  ];

  return (
    <PortalLayout role="member" userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <Trophy className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Achievements</h2>
        </div>

        {/* Lab Contributions header */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">Lab Contributions</h3>
          <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
            These achievements are auto-matched from the lab&apos;s public database based on your name.
            Publications link to the lab&apos;s{' '}
            <a href="/publications" className="underline hover:text-emerald-900 dark:hover:text-emerald-100">publications page</a>,
            patents to the lab records, and software to the{' '}
            <a href="/software" className="underline hover:text-emerald-900 dark:hover:text-emerald-100">software page</a>.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-zinc-700">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Publications */}
        {activeTab === 'publications' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {publications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <BookOpen className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No publications found matching your name.
                </p>
              </div>
            ) : (
              publications.map((pub) => {
                const itemKey = `pub-${pub.id}`;
                return (
                  <div
                    key={pub.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{pub.title}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{pub.authors}</p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {pub.journal && <span>{pub.journal}</span>}
                          <span>{pub.year}</span>
                          {pub.doi && (
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-emerald-600 hover:underline dark:text-emerald-400"
                            >
                              <ExternalLink className="h-3 w-3" />
                              DOI
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => submitToLab('PUBLICATION', pub.title, { title: pub.title, authors: pub.authors, year: pub.year, journal: pub.journal, doi: pub.doi }, itemKey)}
                        disabled={submittingId === itemKey}
                        className={`rounded p-1.5 shrink-0 transition-colors ${
                          submittedId === itemKey
                            ? 'text-emerald-500'
                            : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20'
                        }`}
                        title="Submit to Lab"
                      >
                        {submittedId === itemKey ? <CheckCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Software */}
        {activeTab === 'software' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {software.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <Code2 className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No software tools found.
                </p>
              </div>
            ) : (
              software.map((sw) => {
                const itemKey = `sw-${sw.id}`;
                return (
                  <div
                    key={sw.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{sw.name}</p>
                        {sw.description && (
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {sw.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => submitToLab('SOFTWARE', sw.name, { name: sw.name, description: sw.description, url: sw.url, githubUrl: sw.githubUrl, category: sw.category }, itemKey)}
                          disabled={submittingId === itemKey}
                          className={`rounded p-1.5 transition-colors ${
                            submittedId === itemKey
                              ? 'text-emerald-500'
                              : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20'
                          }`}
                          title="Submit to Lab"
                        >
                          {submittedId === itemKey ? <CheckCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                        </button>
                        {sw.url && (
                          <a
                            href={sw.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {sw.githubUrl && (
                          <a
                            href={sw.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                          >
                            <Code2 className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                    {sw.category && (
                      <span className="mt-2 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {sw.category}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* Patents */}
        {activeTab === 'patents' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {patents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
                <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  No patents found matching your name.
                </p>
              </div>
            ) : (
              patents.map((pat) => {
                const itemKey = `pat-${pat.id}`;
                return (
                  <div
                    key={pat.id}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{pat.title}</p>
                        {pat.inventors && (
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                            {pat.inventors}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {pat.year && <span>{pat.year}</span>}
                          {pat.filingInfo && <span>{pat.filingInfo}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => submitToLab('PATENT', pat.title, { title: pat.title, year: pat.year, inventors: pat.inventors, filingInfo: pat.filingInfo }, itemKey)}
                        disabled={submittingId === itemKey}
                        className={`rounded p-1.5 shrink-0 transition-colors ${
                          submittedId === itemKey
                            ? 'text-emerald-500'
                            : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20'
                        }`}
                        title="Submit to Lab"
                      >
                        {submittedId === itemKey ? <CheckCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}
