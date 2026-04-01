'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Radar,
  Pencil,
  Trash2,
  ShieldAlert,
  User,
  Search,
  BookOpen,
  FolderGit,
  Wrench,
  Database,
  Eye,
  EyeOff,
  Clock,
  BarChart3,
  Info,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Watch {
  id: number;
  name: string;
  watchType: string;
  query: string;
  source: string;
  frequency: string;
  lastChecked: string | null;
  resultCount: number;
  enabled: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberInfo {
  name: string;
  email: string;
}

const WATCH_TYPE_LABELS: Record<string, string> = {
  AUTHOR: 'Author',
  KEYWORD: 'Keyword',
  JOURNAL: 'Journal',
  GITHUB_REPO: 'GitHub Repo',
  TOOL: 'Tool',
  DATASET: 'Dataset',
};

const WATCH_TYPE_COLORS: Record<string, string> = {
  AUTHOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  KEYWORD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  JOURNAL: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  GITHUB_REPO: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  TOOL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  DATASET: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
};

const WATCH_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  AUTHOR: User,
  KEYWORD: Search,
  JOURNAL: BookOpen,
  GITHUB_REPO: FolderGit,
  TOOL: Wrench,
  DATASET: Database,
};

const SOURCE_LABELS: Record<string, string> = {
  PUBMED: 'PubMed',
  SCHOLAR: 'Scholar',
  ARXIV: 'arXiv',
  GITHUB: 'GitHub',
  CUSTOM_URL: 'Custom URL',
};

const SOURCE_COLORS: Record<string, string> = {
  PUBMED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  SCHOLAR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  ARXIV: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  GITHUB: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  CUSTOM_URL: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
};

const FREQUENCY_COLORS: Record<string, string> = {
  DAILY: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  WEEKLY: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  MONTHLY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

export default function IntelligencePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [watches, setWatches] = useState<Watch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingWatch, setEditingWatch] = useState<Watch | null>(null);

  // Form
  const [name, setName] = useState('');
  const [watchType, setWatchType] = useState('KEYWORD');
  const [query, setQuery] = useState('');
  const [source, setSource] = useState('PUBMED');
  const [frequency, setFrequency] = useState('WEEKLY');
  const [notes, setNotes] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/watches').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, w]) => {
        if (!m) { setError('Not authenticated'); return; }
        setMember(m);
        setWatches(w || []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName(''); setWatchType('KEYWORD'); setQuery(''); setSource('PUBMED');
    setFrequency('WEEKLY'); setNotes(''); setEnabled(true); setEditingWatch(null);
  }

  function openAdd() { resetForm(); setShowModal(true); }

  function openEdit(watch: Watch) {
    setEditingWatch(watch);
    setName(watch.name); setWatchType(watch.watchType); setQuery(watch.query);
    setSource(watch.source); setFrequency(watch.frequency); setNotes(watch.notes || '');
    setEnabled(watch.enabled);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !query.trim()) return;
    setSubmitting(true);

    const payload = {
      name: name.trim(), watchType, query: query.trim(), source, frequency,
      notes: notes.trim() || null, enabled,
    };

    try {
      if (editingWatch) {
        const res = await fetch(`/api/member/watches/${editingWatch.id}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setWatches((prev) => prev.map((w) => (w.id === editingWatch.id ? updated : w)));
          setShowModal(false); resetForm();
        }
      } else {
        const res = await fetch('/api/member/watches', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
        });
        if (res.ok) {
          const watch = await res.json();
          setWatches((prev) => [watch, ...prev]);
          setShowModal(false); resetForm();
        }
      }
    } catch { /* ignore */ }
    setSubmitting(false);
  }

  async function toggleEnabled(watch: Watch) {
    try {
      const res = await fetch(`/api/member/watches/${watch.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !watch.enabled }),
      });
      if (res.ok) {
        const updated = await res.json();
        setWatches((prev) => prev.map((w) => (w.id === watch.id ? updated : w)));
      }
    } catch { /* ignore */ }
  }

  async function deleteWatch(id: number) {
    if (!confirm('Delete this watch?')) return;
    try {
      const res = await fetch(`/api/member/watches/${id}`, { method: 'DELETE' });
      if (res.ok) setWatches((prev) => prev.filter((w) => w.id !== id));
    } catch { /* ignore */ }
  }

  const activeCount = watches.filter((w) => w.enabled).length;
  const totalResults = watches.reduce((sum, w) => sum + w.resultCount, 0);

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
        <button onClick={() => router.push('/member/activate')} className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800">Go to Activation</button>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (member as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Radar className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Intelligence</h2>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" /> Add Watch
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Radar className="h-4 w-4" />
              <span className="text-xs font-medium">Total Watches</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{watches.length}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Eye className="h-4 w-4" />
              <span className="text-xs font-medium">Active</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Results</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalResults}</p>
          </div>
        </div>

        {/* Watch cards */}
        <div className="space-y-3">
          {watches.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <Radar className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No watches configured. Add your first watch to start tracking.</p>
            </div>
          ) : (
            watches.map((watch) => {
              const TypeIcon = WATCH_TYPE_ICONS[watch.watchType] || Search;
              return (
                <motion.div key={watch.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg border bg-white p-4 shadow-sm dark:bg-zinc-900 ${
                    watch.enabled
                      ? 'border-slate-200 dark:border-zinc-800'
                      : 'border-slate-200 opacity-60 dark:border-zinc-800'
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <TypeIcon className="h-4 w-4 text-slate-500 dark:text-slate-400 shrink-0" />
                        <p className="font-medium text-slate-900 dark:text-slate-100">{watch.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${WATCH_TYPE_COLORS[watch.watchType]}`}>
                          {WATCH_TYPE_LABELS[watch.watchType]}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_COLORS[watch.source]}`}>
                          {SOURCE_LABELS[watch.source]}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${FREQUENCY_COLORS[watch.frequency]}`}>
                          {watch.frequency}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-zinc-800 rounded px-2 py-1 inline-block">
                        {watch.query}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                        {watch.lastChecked && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Last checked: {new Date(watch.lastChecked).toLocaleDateString()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {watch.resultCount} results
                        </span>
                      </div>
                      {watch.notes && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{watch.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleEnabled(watch)}
                        title={watch.enabled ? 'Disable' : 'Enable'}
                        className={`rounded p-1.5 ${
                          watch.enabled
                            ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                            : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {watch.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => openEdit(watch)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteWatch(watch.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Future note */}
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Automated monitoring coming soon</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Currently serves as a tracking list for your research interests.
                Automated monitoring with alerts will be available in a future release.
              </p>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => { setShowModal(false); resetForm(); }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {editingWatch ? 'Edit Watch' : 'Add Watch'}
                  </h3>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Name *</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Watch name" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Watch Type</label>
                    <select value={watchType} onChange={(e) => setWatchType(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                      <option value="AUTHOR">Author</option>
                      <option value="KEYWORD">Keyword</option>
                      <option value="JOURNAL">Journal</option>
                      <option value="GITHUB_REPO">GitHub Repo</option>
                      <option value="TOOL">Tool</option>
                      <option value="DATASET">Dataset</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Query *</label>
                    <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Search term, author name, repo URL..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
                      <select value={source} onChange={(e) => setSource(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="PUBMED">PubMed</option>
                        <option value="SCHOLAR">Google Scholar</option>
                        <option value="ARXIV">arXiv</option>
                        <option value="GITHUB">GitHub</option>
                        <option value="CUSTOM_URL">Custom URL</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Frequency</label>
                      <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="DAILY">Daily</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="MONTHLY">Monthly</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Notes about this watch" />
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="peer sr-only" />
                      <div className="h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-emerald-600 peer-checked:after:translate-x-full dark:bg-zinc-600 dark:peer-checked:bg-emerald-500" />
                    </label>
                    <span className="text-sm text-slate-700 dark:text-slate-300">Enabled</span>
                  </div>
                  <button type="submit" disabled={submitting || !name.trim() || !query.trim()}
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                    {submitting ? 'Saving...' : editingWatch ? 'Update Watch' : 'Add Watch'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PortalLayout>
  );
}
