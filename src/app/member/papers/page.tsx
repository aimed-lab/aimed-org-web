'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  FileText,
  ExternalLink,
  GraduationCap,
  Pencil,
  Trash2,
  ShieldAlert,
  Search,
  BookOpen,
  Globe,
  Upload,
  Layers,
  Send,
  CheckCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Paper {
  id: number;
  title: string;
  authors: string | null;
  year: number | null;
  journal: string | null;
  url: string | null;
  doi: string | null;
  pubmedId: string | null;
  scholarUrl: string | null;
  pdfPath: string | null;
  citation: string | null;
  notes: string | null;
  tags: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

interface MemberInfo {
  name: string;
  email: string;
}

const SOURCE_LABELS: Record<string, string> = {
  MANUAL: 'Manual',
  SCHOLAR: 'Scholar',
  PDF_UPLOAD: 'PDF Upload',
  WEB_CLIPPER: 'Web Clipper',
};

const SOURCE_COLORS: Record<string, string> = {
  MANUAL: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  SCHOLAR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  PDF_UPLOAD: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  WEB_CLIPPER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const SOURCE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  MANUAL: BookOpen,
  SCHOLAR: GraduationCap,
  PDF_UPLOAD: Upload,
  WEB_CLIPPER: Layers,
};

const SOURCES = ['ALL', 'MANUAL', 'SCHOLAR', 'PDF_UPLOAD', 'WEB_CLIPPER'] as const;

export default function PapersPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [authors, setAuthors] = useState('');
  const [year, setYear] = useState('');
  const [journal, setJournal] = useState('');
  const [url, setUrl] = useState('');
  const [doi, setDoi] = useState('');
  const [scholarUrl, setScholarUrl] = useState('');
  const [citation, setCitation] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('MANUAL');
  const [submitting, setSubmitting] = useState(false);
  const [submitToLabId, setSubmitToLabId] = useState<number | null>(null);
  const [submitToLabSuccess, setSubmitToLabSuccess] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/papers').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, p]) => {
        if (!m) {
          setError('Not authenticated');
          return;
        }
        setMember(m);
        setPapers(p || []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setTitle('');
    setAuthors('');
    setYear('');
    setJournal('');
    setUrl('');
    setDoi('');
    setScholarUrl('');
    setCitation('');
    setNotes('');
    setTags('');
    setSource('MANUAL');
    setEditingPaper(null);
  }

  function openAdd() {
    resetForm();
    setShowModal(true);
  }

  function openEdit(paper: Paper) {
    setEditingPaper(paper);
    setTitle(paper.title);
    setAuthors(paper.authors || '');
    setYear(paper.year?.toString() || '');
    setJournal(paper.journal || '');
    setUrl(paper.url || '');
    setDoi(paper.doi || '');
    setScholarUrl(paper.scholarUrl || '');
    setCitation(paper.citation || '');
    setNotes(paper.notes || '');
    setTags(paper.tags || '');
    setSource(paper.source);
    setShowModal(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const payload = {
      title: title.trim(),
      authors: authors.trim() || null,
      year: year ? parseInt(year, 10) : null,
      journal: journal.trim() || null,
      url: url.trim() || null,
      doi: doi.trim() || null,
      scholarUrl: scholarUrl.trim() || null,
      citation: citation.trim() || null,
      notes: notes.trim() || null,
      tags: tags.trim() || null,
      source,
    };

    try {
      if (editingPaper) {
        const res = await fetch(`/api/member/papers/${editingPaper.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const updated = await res.json();
          setPapers((prev) => prev.map((p) => (p.id === editingPaper.id ? updated : p)));
          setShowModal(false);
          resetForm();
        }
      } else {
        const res = await fetch('/api/member/papers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const paper = await res.json();
          setPapers((prev) => [paper, ...prev]);
          setShowModal(false);
          resetForm();
        }
      }
    } catch {
      // ignore
    }
    setSubmitting(false);
  }

  async function deletePaper(id: number) {
    if (!confirm('Delete this paper?')) return;
    try {
      const res = await fetch(`/api/member/papers/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPapers((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // ignore
    }
  }

  async function submitToLab(paper: Paper) {
    if (!confirm(`Submit "${paper.title}" for admin review to be published on the public website?`)) return;
    setSubmitToLabId(paper.id);
    try {
      const res = await fetch('/api/member/submit-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType: 'PUBLICATION',
          title: paper.title,
          data: {
            title: paper.title,
            authors: paper.authors,
            year: paper.year,
            journal: paper.journal,
            doi: paper.doi,
            tags: paper.tags,
          },
        }),
      });
      if (res.ok) {
        setSubmitToLabSuccess(paper.id);
        setTimeout(() => setSubmitToLabSuccess(null), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Submission failed');
      }
    } catch {
      alert('Submission failed');
    } finally {
      setSubmitToLabId(null);
    }
  }

  const filteredPapers = papers.filter((p) => {
    if (activeFilter !== 'ALL' && p.source !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.authors?.toLowerCase().includes(q) ||
        p.journal?.toLowerCase().includes(q) ||
        p.tags?.toLowerCase().includes(q)
      );
    }
    return true;
  });

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

  return (
    <PortalLayout role="member" userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Papers</h2>
          </div>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Add Paper
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search papers..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
          />
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto">
          {SOURCES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All' : SOURCE_LABELS[s]}
              {s !== 'ALL' && (
                <span className="ml-1.5 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium dark:bg-zinc-700">
                  {papers.filter((p) => p.source === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Papers list */}
        <div className="space-y-3">
          {filteredPapers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <FileText className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No papers found. Add your first paper to start tracking.
              </p>
            </div>
          ) : (
            filteredPapers.map((paper) => {
              const SourceIcon = SOURCE_ICONS[paper.source] || BookOpen;
              return (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{paper.title}</p>
                      {paper.authors && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{paper.authors}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        {paper.journal && <span>{paper.journal}</span>}
                        {paper.year && <span>{paper.year}</span>}
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_COLORS[paper.source]}`}>
                          <SourceIcon className="h-3 w-3" />
                          {SOURCE_LABELS[paper.source]}
                        </span>
                      </div>
                      {paper.tags && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {paper.tags.split(',').map((tag, i) => (
                            <span
                              key={i}
                              className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {paper.url && (
                        <a
                          href={paper.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open URL"
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                        >
                          <Globe className="h-4 w-4" />
                        </a>
                      )}
                      {paper.scholarUrl && (
                        <a
                          href={paper.scholarUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Google Scholar"
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                        >
                          <GraduationCap className="h-4 w-4" />
                        </a>
                      )}
                      {paper.doi && (
                        <a
                          href={`https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="DOI"
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        onClick={() => submitToLab(paper)}
                        disabled={submitToLabId === paper.id}
                        className={`rounded p-1.5 transition-colors ${
                          submitToLabSuccess === paper.id
                            ? 'text-emerald-500'
                            : 'text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20'
                        }`}
                        title="Submit to Lab"
                      >
                        {submitToLabSuccess === paper.id ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : submitToLabId === paper.id ? (
                          <Send className="h-4 w-4 animate-pulse" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(paper)}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deletePaper(paper.id)}
                        className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => { setShowModal(false); resetForm(); }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {editingPaper ? 'Edit Paper' : 'Add Paper'}
                  </h3>
                  <button
                    onClick={() => { setShowModal(false); resetForm(); }}
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Paper title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Authors</label>
                    <input
                      type="text"
                      value={authors}
                      onChange={(e) => setAuthors(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Author names"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                      <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="2026"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Journal</label>
                      <input
                        type="text"
                        value={journal}
                        onChange={(e) => setJournal(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="Journal name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">URL</label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="https://..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">DOI</label>
                      <input
                        type="text"
                        value={doi}
                        onChange={(e) => setDoi(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="10.xxxx/xxxxx"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Google Scholar</label>
                      <input
                        type="url"
                        value={scholarUrl}
                        onChange={(e) => setScholarUrl(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="Scholar link"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Citation</label>
                    <textarea
                      value={citation}
                      onChange={(e) => setCitation(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Full citation text"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Personal notes"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="comma, separated, tags"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                    >
                      <option value="MANUAL">Manual Entry</option>
                      <option value="SCHOLAR">Google Scholar</option>
                      <option value="PDF_UPLOAD">PDF Upload</option>
                      <option value="WEB_CLIPPER">Web Clipper</option>
                    </select>
                    {source === 'WEB_CLIPPER' && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        Chrome extension coming in a future release.
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim()}
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {submitting ? 'Saving...' : editingPaper ? 'Update Paper' : 'Add Paper'}
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
