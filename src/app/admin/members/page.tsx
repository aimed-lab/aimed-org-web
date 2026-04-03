'use client';

import { useEffect, useState, useCallback, FormEvent, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Key,
  X,
  ShieldAlert,
  Copy,
  Check,
  Edit3,
  Target,
  Send,
  Mail,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface ActivationCode {
  id: number;
  code: string;
  used: boolean;
  expiresAt: string;
}

interface Goal {
  id: number;
  quarter: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
}

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  resumeUrl: string | null;
  boxFolderId: string | null;
  boxFolderUrl: string | null;
  notionPageUrl: string | null;
  githubUsername: string | null;
  headshot: string | null;
  bio: string | null;
  orcidId: string | null;
  _count?: { goals: number };
  activationCode?: ActivationCode | null;
  goals?: Goal[];
}

type TabFilter = 'ACTIVE' | 'ALUMNI' | 'ALL';

const ROLES = [
  'Principal Investigator',
  'Postdoc',
  'PhD Student',
  'Research Staff',
  'Intern',
  'Visiting Scholar',
  'Undergraduate Researcher',
  'Systems Administrator',
  'Other',
];

const GOAL_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'DEFERRED', 'CANCELLED'];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    ALUMNI: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
    INACTIVE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    DEFERRED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        styles[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function getQuarterOptions(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentQ = Math.floor(month / 3) + 1;
  const options: string[] = [];
  for (let i = 0; i < 3; i++) {
    let q = currentQ + i;
    let y = year;
    if (q > 4) { q -= 4; y += 1; }
    options.push(`${y}-Q${q}`);
  }
  return options;
}

export default function AdminMembersPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<TabFilter>('ACTIVE');
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [memberDetail, setMemberDetail] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newMemberCode, setNewMemberCode] = useState<{ name: string; code: string; email: string } | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResults, setInviteResults] = useState<{ email: string; status: string; error?: string }[] | null>(null);
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
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

  const fetchMemberDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`);
      if (res.ok) {
        setMemberDetail(await res.json());
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  function toggleMemberExpand(id: number) {
    if (expandedMember === id) {
      setExpandedMember(null);
      setMemberDetail(null);
    } else {
      setExpandedMember(id);
      fetchMemberDetail(id);
    }
  }

  async function handleAddMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name')?.toString().trim(),
      email: fd.get('email')?.toString().trim(),
      role: fd.get('role')?.toString(),
      joinDate: fd.get('joinDate')?.toString() || undefined,
      githubUsername: fd.get('githubUsername')?.toString().trim() || undefined,
      notionPageUrl: fd.get('notionPageUrl')?.toString().trim() || undefined,
      headshot: fd.get('headshot')?.toString().trim() || undefined,
      bio: fd.get('bio')?.toString().trim() || undefined,
    };
    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setShowAddMember(false);
        fetchMembers();
        // Show the auto-generated activation code
        if (data.activationCode?.code) {
          setNewMemberCode({
            name: data.name,
            email: data.email,
            code: data.activationCode.code,
          });
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create member');
      }
    } catch { alert('Network error'); }
  }

  async function handleEditMember(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingMember) return;
    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get('name')?.toString().trim(),
      email: fd.get('email')?.toString().trim(),
      role: fd.get('role')?.toString(),
      status: fd.get('status')?.toString(),
      joinDate: fd.get('joinDate')?.toString() || undefined,
      githubUsername: fd.get('githubUsername')?.toString().trim() || undefined,
      notionPageUrl: fd.get('notionPageUrl')?.toString().trim() || undefined,
      headshot: fd.get('headshot')?.toString().trim() || undefined,
      bio: fd.get('bio')?.toString().trim() || undefined,
    };
    try {
      const res = await fetch(`/api/admin/members/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditingMember(null);
        fetchMembers();
        if (expandedMember === editingMember.id) fetchMemberDetail(editingMember.id);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update member');
      }
    } catch { alert('Network error'); }
  }

  async function handleDeleteMember(id: number, name: string) {
    if (!confirm(`Delete member "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMembers();
        if (expandedMember === id) { setExpandedMember(null); setMemberDetail(null); }
      }
    } catch { alert('Failed to delete member'); }
  }

  async function handleGenerateCode(memberId: number) {
    try {
      const res = await fetch(`/api/admin/members/${memberId}/activation-code`, { method: 'POST' });
      if (res.ok) {
        fetchMemberDetail(memberId);
        fetchMembers();
      } else { alert('Failed to generate code'); }
    } catch { alert('Network error'); }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  async function handleSendInvites() {
    const emails = inviteEmails
      .split(/[\n,;]+/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes('@'));
    if (emails.length === 0) return;
    setInviteLoading(true);
    setInviteResults(null);
    try {
      const res = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteResults(data.results);
        fetchMembers();
      } else {
        alert(data.error || 'Failed to send invitations');
      }
    } catch {
      alert('Network error');
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleAddGoal(e: FormEvent<HTMLFormElement>, memberId: number) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      quarter: fd.get('quarter')?.toString(),
      title: fd.get('title')?.toString().trim(),
      description: fd.get('description')?.toString().trim() || undefined,
    };
    try {
      const res = await fetch(`/api/admin/members/${memberId}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) { fetchMemberDetail(memberId); fetchMembers(); e.currentTarget.reset(); }
    } catch { alert('Failed to add goal'); }
  }

  async function handleUpdateGoalStatus(memberId: number, goalId: number, status: string) {
    try {
      await fetch(`/api/admin/members/${memberId}/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchMemberDetail(memberId);
    } catch { alert('Failed to update goal'); }
  }

  async function handleDeleteGoal(memberId: number, goalId: number) {
    if (!confirm('Delete this goal?')) return;
    try {
      await fetch(`/api/admin/members/${memberId}/goals/${goalId}`, { method: 'DELETE' });
      fetchMemberDetail(memberId);
      fetchMembers();
    } catch { alert('Failed to delete goal'); }
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

  const filteredMembers = tabFilter === 'ALL'
    ? members
    : members.filter((m) => m.status === tabFilter);

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100';

  return (
    <PortalLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Members</h2>
          <div className="relative">
            <button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              <Plus className="h-4 w-4" />
              Add
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {showAddDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowAddDropdown(false)} />
                <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                  <button
                    onClick={() => { setShowAddMember(true); setShowAddDropdown(false); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-700"
                  >
                    <Plus className="h-4 w-4 text-slate-400" />
                    Direct Add
                  </button>
                  <button
                    onClick={() => { setShowInvite(true); setShowAddDropdown(false); }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-zinc-700"
                  >
                    <Send className="h-4 w-4 text-slate-400" />
                    Send Invitation
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-zinc-800 dark:bg-zinc-900 w-fit">
          {(['ACTIVE', 'ALUMNI', 'ALL'] as TabFilter[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabFilter(tab)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
                tabFilter === tab
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-zinc-800 dark:text-slate-100'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab === 'ACTIVE' ? 'Current' : 'Alumni'}
              <span className="ml-1 text-xs text-slate-400">
                ({tab === 'ALL' ? members.length : members.filter((m) => m.status === tab).length})
              </span>
            </button>
          ))}
        </div>

        {/* Member Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Name</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">Role</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Status</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400 hidden lg:table-cell">Goals</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <Fragment key={m.id}>
                  <tr
                    className="border-b border-slate-100 hover:bg-slate-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50 cursor-pointer"
                    onClick={() => toggleMemberExpand(m.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {expandedMember === m.id ? (
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="font-medium text-slate-900 dark:text-slate-100">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden sm:table-cell">{m.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell">{m.role}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.status} /></td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 hidden lg:table-cell">{m._count?.goals || 0}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setEditingMember(m)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-zinc-800"
                          title="Edit"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMember(m.id, m.name)}
                          className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded detail */}
                  {expandedMember === m.id && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50/50 dark:bg-zinc-800/30 px-4 py-4">
                        {!memberDetail ? (
                          <div className="flex justify-center py-4">
                            <div className="h-6 w-6 animate-spin rounded-full border-3 border-emerald-700 border-t-transparent" />
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Links */}
                            <div className="flex flex-wrap gap-2">
                              {memberDetail.boxFolderUrl && (
                                <a href={memberDetail.boxFolderUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300">
                                  <ExternalLink className="h-3 w-3" /> Box
                                </a>
                              )}
                              {memberDetail.notionPageUrl && (
                                <a href={memberDetail.notionPageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300">
                                  <ExternalLink className="h-3 w-3" /> Notion
                                </a>
                              )}
                              {memberDetail.githubUsername && (
                                <a href={`https://github.com/${memberDetail.githubUsername}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300">
                                  <ExternalLink className="h-3 w-3" /> GitHub
                                </a>
                              )}
                            </div>

                            {/* Activation Code */}
                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-2">
                                <Key className="h-3.5 w-3.5" />
                                Activation Code
                              </h4>
                              {memberDetail.activationCode ? (
                                <div className="flex items-center gap-3">
                                  <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm dark:bg-zinc-800">
                                    {memberDetail.activationCode.code}
                                  </code>
                                  <button
                                    onClick={() => copyCode(memberDetail.activationCode!.code)}
                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                                  >
                                    {copiedCode === memberDetail.activationCode.code ? (
                                      <Check className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </button>
                                  <span className="text-xs text-slate-500">
                                    {memberDetail.activationCode.used
                                      ? 'Used'
                                      : `Expires ${new Date(memberDetail.activationCode.expiresAt).toLocaleDateString()}`}
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleGenerateCode(m.id)}
                                  className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                                >
                                  Generate Code
                                </button>
                              )}
                            </div>

                            {/* Goals */}
                            <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900">
                              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1 mb-2">
                                <Target className="h-3.5 w-3.5" />
                                Goals
                              </h4>
                              {memberDetail.goals && memberDetail.goals.length > 0 && (
                                <div className="space-y-2 mb-3">
                                  {memberDetail.goals.map((goal) => (
                                    <div key={goal.id} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 p-2 dark:border-zinc-800 dark:bg-zinc-800/50">
                                      <div>
                                        <p className="text-xs font-medium text-slate-900 dark:text-slate-100">{goal.title}</p>
                                        <p className="text-[10px] text-slate-500">{goal.quarter}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <select
                                          value={goal.status}
                                          onChange={(e) => handleUpdateGoalStatus(m.id, goal.id, e.target.value)}
                                          className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                                        >
                                          {GOAL_STATUSES.map((s) => (
                                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                                          ))}
                                        </select>
                                        <button
                                          onClick={() => handleDeleteGoal(m.id, goal.id)}
                                          className="rounded p-0.5 text-slate-400 hover:text-red-600"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {/* Add goal form */}
                              <form onSubmit={(e) => handleAddGoal(e, m.id)} className="flex flex-wrap gap-2">
                                <select name="quarter" className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100">
                                  {getQuarterOptions().map((q) => (
                                    <option key={q} value={q}>{q}</option>
                                  ))}
                                </select>
                                <input name="title" placeholder="Goal title" required className="flex-1 min-w-[150px] rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100" />
                                <input name="description" placeholder="Description (optional)" className="flex-1 min-w-[150px] rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100" />
                                <button type="submit" className="rounded bg-emerald-700 px-3 py-1 text-xs font-medium text-white hover:bg-emerald-800">
                                  Add Goal
                                </button>
                              </form>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Member Modal */}
        <AnimatePresence>
          {showAddMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setShowAddMember(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add Member</h3>
                  <button onClick={() => setShowAddMember(false)} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleAddMember} className="space-y-3">
                  <input name="name" placeholder="Full Name *" required className={inputClass} />
                  <input name="email" type="email" placeholder="Email *" required className={inputClass} />
                  <select name="role" required className={inputClass}>
                    {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                  </select>
                  <input name="joinDate" type="date" className={inputClass} />
                  <input name="githubUsername" placeholder="GitHub username" className={inputClass} />
                  <input name="notionPageUrl" placeholder="Notion page URL" className={inputClass} />
                  <input name="headshot" placeholder="Headshot URL" className={inputClass} />
                  <textarea name="bio" placeholder="Bio" rows={2} className={inputClass} />
                  <button type="submit" className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
                    Create Member
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Member Code Modal */}
        <AnimatePresence>
          {newMemberCode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setNewMemberCode(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900 text-center"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Member Created</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Share this one-time activation code with <strong>{newMemberCode.name}</strong>:
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <code className="rounded-lg bg-slate-100 px-4 py-2 font-mono text-lg font-bold tracking-wider text-emerald-700 dark:bg-zinc-800 dark:text-emerald-400">
                    {newMemberCode.code}
                  </code>
                  <button
                    onClick={() => copyCode(newMemberCode.code)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    {copiedCode === newMemberCode.code ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                  They can log in at <span className="font-mono">/member/activate</span> with their email and this code. Code expires in 7 days.
                </p>
                <button
                  onClick={() => setNewMemberCode(null)}
                  className="mt-4 rounded-lg bg-emerald-700 px-6 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Done
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Member Modal */}
        <AnimatePresence>
          {editingMember && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setEditingMember(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit Member</h3>
                  <button onClick={() => setEditingMember(null)} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleEditMember} className="space-y-3">
                  <input name="name" defaultValue={editingMember.name} required className={inputClass} />
                  <input name="email" type="email" defaultValue={editingMember.email} required className={inputClass} />
                  <select name="role" defaultValue={editingMember.role} required className={inputClass}>
                    {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                  </select>
                  <select name="status" defaultValue={editingMember.status} className={inputClass}>
                    <option value="ACTIVE">Active</option>
                    <option value="ALUMNI">Alumni</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <input name="joinDate" type="date" defaultValue={editingMember.joinDate?.split('T')[0]} className={inputClass} />
                  <input name="githubUsername" defaultValue={editingMember.githubUsername || ''} placeholder="GitHub username" className={inputClass} />
                  <input name="notionPageUrl" defaultValue={editingMember.notionPageUrl || ''} placeholder="Notion URL" className={inputClass} />
                  <input name="headshot" defaultValue={editingMember.headshot || ''} placeholder="Headshot URL" className={inputClass} />
                  <textarea name="bio" defaultValue={editingMember.bio || ''} placeholder="Bio" rows={2} className={inputClass} />
                  <button type="submit" className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
                    Save Changes
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Send Invitation Modal */}
        <AnimatePresence>
          {showInvite && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => { setShowInvite(false); setInviteResults(null); setInviteEmails(''); }}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-emerald-700" />
                    Send Invitations
                  </h3>
                  <button onClick={() => { setShowInvite(false); setInviteResults(null); setInviteEmails(''); }} className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {!inviteResults ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Enter email addresses to invite. Each person will receive an email with a link to self-register.
                    </p>
                    <textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder={"one@uab.edu\ntwo@uab.edu\nthree@uab.edu"}
                      rows={5}
                      className={inputClass + ' font-mono text-xs'}
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      One email per line, or separated by commas / semicolons.
                    </p>
                    <button
                      onClick={handleSendInvites}
                      disabled={inviteLoading || !inviteEmails.trim()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                    >
                      {inviteLoading ? (
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send Invitations
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {inviteResults.map((r, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-zinc-800 dark:bg-zinc-800/50">
                          <span className="text-sm text-slate-700 dark:text-slate-300 truncate mr-2">{r.email}</span>
                          {r.status === 'sent' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                              <Check className="h-3 w-3" /> Sent
                            </span>
                          )}
                          {r.status === 'exists' && (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                              Already exists
                            </span>
                          )}
                          {r.status === 'error' && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300" title={r.error}>
                              Error
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setInviteResults(null); setInviteEmails(''); }}
                        className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
                      >
                        Invite More
                      </button>
                      <button
                        onClick={() => { setShowInvite(false); setInviteResults(null); setInviteEmails(''); }}
                        className="flex-1 rounded-lg bg-emerald-700 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PortalLayout>
  );
}
