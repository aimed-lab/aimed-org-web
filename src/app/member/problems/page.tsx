'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  Lightbulb,
  Pencil,
  Trash2,
  Search,
  Image,
  Mic,
  FileText,
  Link2,
  Globe,
  Lock,
  Unlock,
  ThumbsUp,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Problem {
  id: number;
  title: string;
  description: string | null;
  sourceType: string;
  sourceUrl: string | null;
  visibility: string;
  status: string;
  tags: string | null;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  authorName?: string;
}

interface MemberInfo {
  name: string;
  email: string;
  isAdmin?: boolean;
}

const SOURCE_TYPE_LABELS: Record<string, string> = {
  TEXT: 'Text Note',
  WHITEBOARD: 'Whiteboard Sketch',
  AUDIO: 'Audio Recording',
  DOCUMENT: 'Document',
  URL: 'Web Link',
};

const SOURCE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  TEXT: FileText,
  WHITEBOARD: Image,
  AUDIO: Mic,
  DOCUMENT: FileText,
  URL: Globe,
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  TEXT: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  WHITEBOARD: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  AUDIO: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  DOCUMENT: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  URL: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

const STATUS_COLORS: Record<string, string> = {
  IDEA: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  EXPLORING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  IN_PROGRESS: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PAUSED: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-400',
  RESOLVED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

// Mock problems for display — will be replaced by API integration
const MOCK_PROBLEMS: Problem[] = [];

export default function ProblemsPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [problems, setProblems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProblem, setEditingProblem] = useState<Problem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sourceType, setSourceType] = useState('TEXT');
  const [sourceUrl, setSourceUrl] = useState('');
  const [visibility, setVisibility] = useState('GROUP');
  const [status, setStatus] = useState('IDEA');
  const [tags, setTags] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/member/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((m) => {
        if (!m) {
          router.push('/member/activate');
          return;
        }
        setMember(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setTitle(''); setDescription(''); setSourceType('TEXT'); setSourceUrl('');
    setVisibility('GROUP'); setStatus('IDEA'); setTags(''); setEditingProblem(null);
  }

  function openAdd() { resetForm(); setShowModal(true); }

  function openEdit(p: Problem) {
    setEditingProblem(p);
    setTitle(p.title); setDescription(p.description || ''); setSourceType(p.sourceType);
    setSourceUrl(p.sourceUrl || ''); setVisibility(p.visibility); setStatus(p.status);
    setTags(p.tags || '');
    setShowModal(true);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);

    const newProblem: Problem = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim() || null,
      sourceType,
      sourceUrl: sourceUrl.trim() || null,
      visibility,
      status,
      tags: tags.trim() || null,
      likes: 0,
      comments: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      authorName: member?.name,
    };

    if (editingProblem) {
      setProblems((prev) => prev.map((p) => p.id === editingProblem.id ? { ...newProblem, id: editingProblem.id } : p));
    } else {
      setProblems((prev) => [newProblem, ...prev]);
    }

    setShowModal(false);
    resetForm();
    setSubmitting(false);
  }

  function deleteProblem(id: number) {
    if (!confirm('Delete this problem?')) return;
    setProblems((prev) => prev.filter((p) => p.id !== id));
  }

  const FILTER_TABS = ['ALL', 'IDEA', 'EXPLORING', 'IN_PROGRESS', 'RESOLVED'] as const;

  const filtered = problems.filter((p) => {
    if (activeFilter !== 'ALL' && p.status !== activeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.tags?.toLowerCase().includes(q);
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

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting...</p>
      </div>
    );
  }

  const portalRole = member?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Problems</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ideas, research questions, and brainstorms</p>
            </div>
          </div>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800">
            <Plus className="h-4 w-4" /> New Problem
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
          />
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto">
          {FILTER_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveFilter(s)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === s
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Problems list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <Lightbulb className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No problems yet. Capture your first research idea or question.
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Problems can come from whiteboard sketches, audio notes, documents, or web links.
              </p>
            </div>
          ) : (
            filtered.map((problem) => {
              const SourceIcon = SOURCE_TYPE_ICONS[problem.sourceType] || FileText;
              return (
                <motion.div
                  key={problem.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-slate-900 dark:text-slate-100">{problem.title}</p>
                        {problem.visibility === 'PRIVATE' && (
                          <span title="Private"><Lock className="h-3.5 w-3.5 text-slate-400" /></span>
                        )}
                      </div>
                      {problem.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{problem.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${SOURCE_TYPE_COLORS[problem.sourceType]}`}>
                          <SourceIcon className="h-3 w-3" />
                          {SOURCE_TYPE_LABELS[problem.sourceType]}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${STATUS_COLORS[problem.status]}`}>
                          {problem.status.replace(/_/g, ' ')}
                        </span>
                        {problem.authorName && (
                          <span className="text-slate-400 dark:text-slate-500">by {problem.authorName}</span>
                        )}
                      </div>
                      {problem.tags && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {problem.tags.split(',').map((tag, i) => (
                            <span key={i} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="flex items-center gap-0.5 text-slate-400 mr-2">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="text-xs">{problem.likes}</span>
                      </div>
                      {problem.sourceUrl && (
                        <a href={problem.sourceUrl} target="_blank" rel="noopener noreferrer" title="Source" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button onClick={() => openEdit(problem)} className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => deleteProblem(problem.id)} className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20" title="Delete">
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => { setShowModal(false); resetForm(); }}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {editingProblem ? 'Edit Problem' : 'New Problem'}
                  </h3>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="What's the research problem or idea?" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Describe the problem, context, and potential approaches..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Source Type</label>
                      <select value={sourceType} onChange={(e) => setSourceType(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="TEXT">Text Note</option>
                        <option value="WHITEBOARD">Whiteboard Sketch</option>
                        <option value="AUDIO">Audio Recording</option>
                        <option value="DOCUMENT">Document</option>
                        <option value="URL">Web Link</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="IDEA">Idea</option>
                        <option value="EXPLORING">Exploring</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="PAUSED">Paused</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Source URL / File Link</label>
                    <input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Link to whiteboard photo, audio, document..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Visibility</label>
                      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                        <option value="GROUP">Shared with Group</option>
                        <option value="PRIVATE">Private</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Tags</label>
                      <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                        placeholder="comma, separated, tags" />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting || !title.trim()}
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">
                    {submitting ? 'Saving...' : editingProblem ? 'Update Problem' : 'Add Problem'}
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
