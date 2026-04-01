'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Check,
  X,
  MessageSquare,
  BookOpen,
  Trophy,
  Code2,
  FileText,
  Newspaper,
  User,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface ContentSubmission {
  id: number;
  memberId: number;
  contentType: string;
  title: string;
  data: string;
  status: string;
  reviewNotes: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  member: {
    id: number;
    name: string;
    email: string;
    headshot: string | null;
    role: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  REVISION_REQUESTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
};

const CONTENT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  PUBLICATION: BookOpen,
  HONOR: Trophy,
  SOFTWARE: Code2,
  PATENT: FileText,
  NEWS: Newspaper,
};

const CONTENT_TYPE_COLORS: Record<string, string> = {
  PUBLICATION: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  HONOR: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  SOFTWARE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  PATENT: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  NEWS: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
};

const FILTER_TABS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED'] as const;

export default function AdminContentReviewPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<ContentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<string>('PENDING');
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<Record<string, string>>({});

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content-review');
      if (res.ok) {
        setSubmissions(await res.json());
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }
    } catch {
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  function openExpanded(sub: ContentSubmission) {
    if (expandedId === sub.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sub.id);
    setReviewNotes(sub.reviewNotes || '');
    // Initialize edited data from submission data
    try {
      const parsed = JSON.parse(sub.data);
      const stringified: Record<string, string> = {};
      for (const [key, val] of Object.entries(parsed)) {
        stringified[key] = val != null ? String(val) : '';
      }
      setEditedData(stringified);
    } catch {
      setEditedData({});
    }
  }

  async function handleAction(id: number, action: 'APPROVE' | 'REJECT' | 'REVISION_REQUESTED') {
    setActionLoading(id);
    try {
      const body: Record<string, unknown> = { id, action, reviewNotes };
      if (action === 'APPROVE' && Object.keys(editedData).length > 0) {
        body.editedData = JSON.stringify(editedData);
      }
      const res = await fetch('/api/admin/content-review', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await fetchSubmissions();
        setExpandedId(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Action failed');
      }
    } catch {
      alert('Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  if (authenticated === null || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">Login required</h2>
        <button
          onClick={() => router.push('/admin')}
          className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Go to Login
        </button>
      </div>
    );
  }

  const pendingCount = submissions.filter((s) => s.status === 'PENDING').length;

  const filtered = activeTab === 'ALL'
    ? submissions
    : submissions.filter((s) => s.status === activeTab);

  function renderDataFields(data: Record<string, string>, contentType: string, editable: boolean) {
    // Show fields relevant to the content type
    const fieldLabels: Record<string, Record<string, string>> = {
      PUBLICATION: { title: 'Title', authors: 'Authors', year: 'Year', journal: 'Journal', doi: 'DOI', abstract: 'Abstract', tags: 'Tags' },
      HONOR: { awardName: 'Award Name', year: 'Year', category: 'Category', issuer: 'Issuer', description: 'Description' },
      SOFTWARE: { name: 'Name', description: 'Description', url: 'URL', githubUrl: 'GitHub URL', category: 'Category' },
      PATENT: { title: 'Title', year: 'Year', inventors: 'Inventors', filingInfo: 'Filing Info', relatedResearch: 'Related Research' },
      NEWS: { headline: 'Headline', summary: 'Summary', imageUrl: 'Image URL', link: 'Link', date: 'Date' },
    };

    const labels = fieldLabels[contentType] || {};
    const keys = Object.keys(labels).length > 0 ? Object.keys(labels) : Object.keys(data);

    return (
      <div className="space-y-2">
        {keys.map((key) => {
          const label = labels[key] || key;
          const value = data[key] || '';
          const isLongField = ['abstract', 'description', 'summary'].includes(key);

          return (
            <div key={key}>
              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-0.5">{label}</label>
              {editable ? (
                isLongField ? (
                  <textarea
                    value={editedData[key] || ''}
                    onChange={(e) => setEditedData({ ...editedData, [key]: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                  />
                ) : (
                  <input
                    type="text"
                    value={editedData[key] || ''}
                    onChange={(e) => setEditedData({ ...editedData, [key]: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                  />
                )
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-300">{value || '-'}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <PortalLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Content Review</h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 flex-wrap rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 w-fit">
          {FILTER_TABS.map((tab) => {
            const count = tab === 'ALL' ? submissions.length : submissions.filter((s) => s.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab === 'REVISION_REQUESTED' ? 'Revision' : tab.charAt(0) + tab.slice(1).toLowerCase()} ({count})
              </button>
            );
          })}
        </div>

        {/* Submissions list */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <FileCheck className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No {activeTab !== 'ALL' ? activeTab.toLowerCase() : ''} content submissions.
              </p>
            </div>
          ) : (
            filtered.map((sub) => {
              const expanded = expandedId === sub.id;
              const TypeIcon = CONTENT_TYPE_ICONS[sub.contentType] || FileText;
              const isPending = sub.status === 'PENDING';

              return (
                <motion.div
                  key={sub.id}
                  layout
                  className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                    onClick={() => openExpanded(sub)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{sub.title}</p>
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${CONTENT_TYPE_COLORS[sub.contentType] || ''}`}>
                            <TypeIcon className="h-3 w-3" />
                            {sub.contentType}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <User className="h-3 w-3" />
                          <span>{sub.member.name}</span>
                          <span className="text-slate-300 dark:text-zinc-600">|</span>
                          <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 ${STATUS_COLORS[sub.status] || 'bg-slate-100 text-slate-600'}`}>
                      {sub.status === 'REVISION_REQUESTED' ? 'REVISION' : sub.status}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  <AnimatePresence>
                    {expanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-200 dark:border-zinc-800"
                      >
                        <div className="p-4 space-y-4">
                          {/* Member info */}
                          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3 dark:bg-zinc-800/50">
                            <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-sm font-bold text-emerald-700 dark:text-emerald-400">
                              {sub.member.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{sub.member.name}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{sub.member.email} - {sub.member.role}</p>
                            </div>
                          </div>

                          {/* Data preview / edit */}
                          <div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Content Data</p>
                            {renderDataFields(editedData, sub.contentType, isPending)}
                          </div>

                          {/* Review notes */}
                          {isPending && (
                            <div>
                              <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Review Notes</label>
                              <textarea
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                                placeholder="Feedback for the member..."
                              />
                            </div>
                          )}

                          {/* Existing review info */}
                          {sub.reviewNotes && !isPending && (
                            <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-800/50">
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Review Notes</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{sub.reviewNotes}</p>
                              {sub.reviewedBy && (
                                <p className="text-[10px] text-slate-400 mt-1">
                                  Reviewed by {sub.reviewedBy} on {sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleString() : ''}
                                </p>
                              )}
                            </div>
                          )}

                          {/* Action buttons */}
                          {isPending && (
                            <div className="flex items-center gap-2 pt-2">
                              <button
                                onClick={() => handleAction(sub.id, 'APPROVE')}
                                disabled={actionLoading === sub.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Approve & Publish
                              </button>
                              <button
                                onClick={() => handleAction(sub.id, 'REJECT')}
                                disabled={actionLoading === sub.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                <X className="h-3.5 w-3.5" />
                                Reject
                              </button>
                              <button
                                onClick={() => handleAction(sub.id, 'REVISION_REQUESTED')}
                                disabled={actionLoading === sub.id}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 px-4 py-2 text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-60 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                                Request Revision
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
