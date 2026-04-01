'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  ChevronDown,
  ChevronRight,
  Mail,
  Calendar,
  FileText,
  ExternalLink,
  ShieldAlert,
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
  createdAt: string;
}

const INQUIRY_STATUSES = [
  'NEW',
  'REVIEWED',
  'REPLIED',
  'SHORTLISTED',
  'ACCEPTED',
  'DECLINED',
  'ARCHIVED',
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

type StatusFilter = string | 'ALL';

export default function AdminRecruitsPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

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

  async function handleStatusChange(id: number, status: string) {
    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) fetchInquiries();
    } catch { /* ignore */ }
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

  const filtered = statusFilter === 'ALL'
    ? inquiries
    : inquiries.filter((i) => i.status === statusFilter);

  function parseAttachments(json: string | null): { label: string; fileName: string; boxFileUrl?: string }[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }

  return (
    <PortalLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center gap-3">
          <UserPlus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recruits & Inquiries</h2>
        </div>

        {/* Status filter */}
        <div className="flex gap-1 flex-wrap rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 w-fit">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All ({inquiries.length})
          </button>
          {INQUIRY_STATUSES.map((s) => {
            const count = inquiries.filter((i) => i.status === s).length;
            if (count === 0) return null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === s
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {s} ({count})
              </button>
            );
          })}
        </div>

        {/* Inquiries list */}
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
              return (
                <motion.div
                  key={inq.id}
                  layout
                  className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden"
                >
                  {/* Header row */}
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                    onClick={() => setExpandedId(expanded ? null : inq.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{inq.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Mail className="h-3 w-3" />
                          {inq.email}
                          {inq.role && (
                            <>
                              <span className="text-slate-300 dark:text-zinc-600">|</span>
                              {inq.role}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="hidden sm:inline text-xs text-slate-400">
                        {new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          STATUS_COLORS[inq.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
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
                        <div className="p-4 space-y-4">
                          {inq.interestArea && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Interest Area</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{inq.interestArea}</p>
                            </div>
                          )}
                          {inq.message && (
                            <div>
                              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Message</p>
                              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{inq.message}</p>
                            </div>
                          )}
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
                          {/* Status change */}
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Change status:
                            </label>
                            <select
                              value={inq.status}
                              onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                            >
                              {INQUIRY_STATUSES.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
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
