'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  ChevronDown,
  ChevronRight,
  Mail,
  FileText,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  RefreshCw,
  Save,
  Paperclip,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Inquiry {
  id: number;
  name: string;
  email: string;
  role: string | null;
  interestArea: string | null;
  message: string | null;
  attachmentUrl: string | null;
  attachments: string | null;
  status: string;
  notes: string | null;
  aiScore: number | null;
  aiScoreBreakdown: string | null;
  aiAnalysis: string | null;
  aiScoredAt: string | null;
  manualScore: number | null;
  manualNotes: string | null;
  priority: string | null;
  createdAt: string;
}

interface ScoreBreakdown {
  communication: number;
  resilience: number;
  aiFluency: number;
  technicalPrep: number;
  domainKnowledge: number;
  practicalExp: number;
}

interface AIAnalysis {
  pros: string[];
  cons: string[];
  clarifications: string[];
  summary: string;
}

const INQUIRY_STATUSES = [
  'NEW', 'REVIEWED', 'REPLIED', 'SHORTLISTED', 'ACCEPTED', 'DECLINED', 'ARCHIVED',
];

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  REPLIED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  SHORTLISTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-400',
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  LOW: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-400',
};

const ROLE_OPTIONS = [
  'All Roles', 'High School Student', 'Undergraduate', "Master's Student",
  'PhD Student', 'Postdoc', 'Research Staff', 'Visiting Scholar', 'Other',
];

type SortBy = 'date' | 'aiScore' | 'manualScore';

function getScoreColor(score: number): string {
  if (score > 70) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 40) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreRingColor(score: number): string {
  if (score > 70) return 'border-emerald-500';
  if (score >= 40) return 'border-amber-500';
  return 'border-red-500';
}

const SCORE_LABELS: Record<string, string> = {
  communication: 'Communication',
  resilience: 'Resilience',
  aiFluency: 'AI Fluency',
  technicalPrep: 'Technical Prep',
  domainKnowledge: 'Domain Knowledge',
  practicalExp: 'Practical Exp',
};

export default function AdminRecruitsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [scoringId, setScoringId] = useState<number | null>(null);

  // Manual review state
  const [editManualScore, setEditManualScore] = useState<number | null>(null);
  const [editManualNotes, setEditManualNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/inquiries');
      if (res.ok) {
        setInquiries(await res.json());
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

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  function openExpanded(inq: Inquiry) {
    if (expandedId === inq.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(inq.id);
    setEditManualScore(inq.manualScore);
    setEditManualNotes(inq.manualNotes || '');
    setEditStatus(inq.status);
    setEditPriority(inq.priority || '');
  }

  async function handleScoreWithAI(inquiryId: number) {
    setScoringId(inquiryId);
    try {
      const res = await fetch('/api/admin/score-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryId }),
      });
      if (res.ok) {
        await fetchInquiries();
      } else {
        const data = await res.json();
        alert(data.error || 'Scoring failed');
      }
    } catch {
      alert('Scoring failed');
    } finally {
      setScoringId(null);
    }
  }

  async function handleSaveManualReview(id: number) {
    setSavingId(id);
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: editStatus,
          manualScore: editManualScore,
          manualNotes: editManualNotes || null,
          priority: editPriority || null,
        }),
      });
      if (res.ok) {
        await fetchInquiries();
      }
    } catch {
      /* ignore */
    } finally {
      setSavingId(null);
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

  // Stats
  const totalCount = inquiries.length;
  const pendingCount = inquiries.filter((i) => i.status === 'NEW').length;
  const scoredCount = inquiries.filter((i) => i.aiScore !== null).length;
  const shortlistedCount = inquiries.filter((i) => i.status === 'SHORTLISTED').length;

  // Filtering
  let filtered = inquiries;
  if (statusFilter !== 'ALL') {
    filtered = filtered.filter((i) => i.status === statusFilter);
  }
  if (roleFilter !== 'All Roles') {
    filtered = filtered.filter((i) => i.role === roleFilter);
  }

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'aiScore') {
      return (b.aiScore ?? -1) - (a.aiScore ?? -1);
    }
    if (sortBy === 'manualScore') {
      return (b.manualScore ?? -1) - (a.manualScore ?? -1);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  function parseAttachments(json: string | null): { label: string; fileName: string; boxFileUrl?: string }[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }

  function parseScoreBreakdown(json: string | null): ScoreBreakdown | null {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
  }

  function parseAIAnalysis(json: string | null): AIAnalysis | null {
    if (!json) return null;
    try { return JSON.parse(json); } catch { return null; }
  }

  return (
    <PortalLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <UserPlus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Candidate Inquiries</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total', value: totalCount, color: 'text-slate-600 dark:text-slate-400' },
            { label: 'Pending', value: pendingCount, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'AI Scored', value: scoredCount, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Shortlisted', value: shortlistedCount, color: 'text-amber-600 dark:text-amber-400' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
          >
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
          >
            <option value="ALL">All Status</option>
            {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
          >
            <option value="date">Sort: Newest</option>
            <option value="aiScore">Sort: AI Score</option>
            <option value="manualScore">Sort: Manual Score</option>
          </select>
        </div>

        {/* Candidate Cards */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <UserPlus className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                No inquiries {statusFilter !== 'ALL' ? `with status "${statusFilter}"` : 'yet'}.
              </p>
            </div>
          ) : (
            filtered.map((inq) => {
              const expanded = expandedId === inq.id;
              const attachments = parseAttachments(inq.attachments);
              const breakdown = parseScoreBreakdown(inq.aiScoreBreakdown);
              const analysis = parseAIAnalysis(inq.aiAnalysis);

              return (
                <motion.div
                  key={inq.id}
                  layout
                  className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
                >
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                    onClick={() => openExpanded(inq)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{inq.name}</p>
                          {inq.role && (
                            <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {inq.role}
                            </span>
                          )}
                          {inq.interestArea && (
                            <span className="inline-block rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              {inq.interestArea}
                            </span>
                          )}
                          {inq.priority && (
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${PRIORITY_COLORS[inq.priority] || ''}`}>
                              {inq.priority}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{inq.email}</span>
                          {attachments.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Paperclip className="h-3 w-3" />
                              {attachments.length}
                            </span>
                          )}
                        </div>
                        {inq.message && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {inq.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-3">
                      {/* AI Score circle */}
                      {inq.aiScore !== null && (
                        <div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${getScoreRingColor(inq.aiScore)}`}>
                          <span className={`text-sm font-bold ${getScoreColor(inq.aiScore)}`}>
                            {inq.aiScore}
                          </span>
                        </div>
                      )}
                      {inq.manualScore !== null && (
                        <div className="text-center">
                          <p className="text-[10px] font-medium text-slate-400">Manual</p>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{inq.manualScore}</p>
                        </div>
                      )}
                      <span className="hidden sm:inline text-xs text-slate-400">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[inq.status] || 'bg-slate-100 text-slate-600'}`}>
                        {inq.status}
                      </span>
                    </div>
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
                        <div className="p-4 space-y-5">
                          {/* Full message */}
                          {inq.message && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Message</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 dark:bg-zinc-800/50">
                                {inq.message}
                              </p>
                            </div>
                          )}

                          {/* Attachments */}
                          {attachments.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Attachments</p>
                              <div className="flex flex-wrap gap-2">
                                {attachments.map((att, idx) => (
                                  <a
                                    key={idx}
                                    href={att.boxFileUrl || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300"
                                  >
                                    <FileText className="h-3.5 w-3.5" />
                                    {att.label || att.fileName}
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Analysis Section */}
                          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/10">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                AI Analysis
                              </h4>
                              <button
                                onClick={() => handleScoreWithAI(inq.id)}
                                disabled={scoringId === inq.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                              >
                                {scoringId === inq.id ? (
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                ) : inq.aiScore !== null ? (
                                  <RefreshCw className="h-3.5 w-3.5" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5" />
                                )}
                                {inq.aiScore !== null ? 'Re-score' : 'Score with AI'}
                              </button>
                            </div>

                            {breakdown && (
                              <div className="space-y-4">
                                {/* Score breakdown bars */}
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {Object.entries(breakdown).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                      <span className="w-28 text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                                        {SCORE_LABELS[key] || key}
                                      </span>
                                      <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                                        <motion.div
                                          initial={{ width: 0 }}
                                          animate={{ width: `${(value / 10) * 100}%` }}
                                          transition={{ duration: 0.5 }}
                                          className={`h-full rounded-full ${
                                            value >= 7 ? 'bg-emerald-500' : value >= 4 ? 'bg-amber-500' : 'bg-red-500'
                                          }`}
                                        />
                                      </div>
                                      <span className="w-6 text-right text-xs font-bold text-slate-700 dark:text-slate-300">{value}</span>
                                    </div>
                                  ))}
                                </div>

                                {/* Overall score */}
                                {inq.aiScore !== null && (
                                  <div className="flex items-center gap-2 rounded-lg bg-white p-3 dark:bg-zinc-800">
                                    <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Score:</span>
                                    <span className={`text-lg font-bold ${getScoreColor(inq.aiScore)}`}>{inq.aiScore}/100</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {analysis && (
                              <div className="mt-4 space-y-3">
                                {analysis.summary && (
                                  <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                    {analysis.summary}
                                  </p>
                                )}

                                {analysis.pros?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                                      <CheckCircle className="h-3.5 w-3.5" /> Strengths
                                    </p>
                                    <ul className="space-y-0.5">
                                      {analysis.pros.map((p, i) => (
                                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                          <span className="text-emerald-500 mt-0.5">+</span> {p}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {analysis.cons?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                                      <AlertCircle className="h-3.5 w-3.5" /> Weaknesses
                                    </p>
                                    <ul className="space-y-0.5">
                                      {analysis.cons.map((c, i) => (
                                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                          <span className="text-red-500 mt-0.5">-</span> {c}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {analysis.clarifications?.length > 0 && (
                                  <div>
                                    <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                                      <HelpCircle className="h-3.5 w-3.5" /> Clarifications Needed
                                    </p>
                                    <ul className="space-y-0.5">
                                      {analysis.clarifications.map((q, i) => (
                                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                          <span className="text-amber-500 mt-0.5">?</span> {q}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {inq.aiScoredAt && (
                                  <p className="text-[10px] text-slate-400">
                                    Scored: {new Date(inq.aiScoredAt).toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}

                            {!breakdown && !analysis && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Click &quot;Score with AI&quot; to analyze this candidate.
                              </p>
                            )}
                          </div>

                          {/* Manual Review Section */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Manual Review</h4>
                            <div className="space-y-3">
                              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                <div>
                                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Manual Score (1-100)</label>
                                  <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={editManualScore ?? ''}
                                    onChange={(e) => setEditManualScore(e.target.value ? parseInt(e.target.value, 10) : null)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                                    placeholder="1-100"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Status</label>
                                  <select
                                    value={editStatus}
                                    onChange={(e) => setEditStatus(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                                  >
                                    {INQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Priority</label>
                                  <select
                                    value={editPriority}
                                    onChange={(e) => setEditPriority(e.target.value)}
                                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                                  >
                                    <option value="">No Priority</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="MEDIUM">MEDIUM</option>
                                    <option value="LOW">LOW</option>
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Notes</label>
                                <textarea
                                  value={editManualNotes}
                                  onChange={(e) => setEditManualNotes(e.target.value)}
                                  rows={3}
                                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                                  placeholder="Admin notes..."
                                />
                              </div>
                              <button
                                onClick={() => handleSaveManualReview(inq.id)}
                                disabled={savingId === inq.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
                              >
                                <Save className="h-3.5 w-3.5" />
                                {savingId === inq.id ? 'Saving...' : 'Save Review'}
                              </button>
                            </div>
                          </div>
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
