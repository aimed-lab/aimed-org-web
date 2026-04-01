'use client';

import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut,
  Users,
  Inbox,
  Target,
  Settings,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  GitFork,
  Key,
  X,
  ShieldAlert,
  UserPlus,
  Copy,
  Check,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
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
  _count?: { goals: number };
  activationCode?: ActivationCode | null;
  goals?: Goal[];
}

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

type Tab = 'members' | 'inquiries' | 'settings';

const ROLES = [
  'PhD Student',
  'Postdoc',
  'Research Staff',
  'Intern',
  'Visiting Scholar',
  'Systems Administrator',
];

const GOAL_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'DEFERRED', 'CANCELLED'];

const INQUIRY_STATUSES = [
  'NEW',
  'REVIEWED',
  'REPLIED',
  'SHORTLISTED',
  'ACCEPTED',
  'DECLINED',
  'ARCHIVED',
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
function getQuarterOptions(): string[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const currentQ = Math.floor(month / 3) + 1;
  const options: string[] = [];
  for (let i = 0; i < 3; i++) {
    let q = currentQ + i;
    let y = year;
    if (q > 4) {
      q -= 4;
      y += 1;
    }
    options.push(`${y}-Q${q}`);
  }
  return options;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    ALUMNI: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
    INACTIVE: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    NEW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    REPLIED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    SHORTLISTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-400',
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

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('members');

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [expandedMember, setExpandedMember] = useState<number | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberDetail, setMemberDetail] = useState<Member | null>(null);

  // Inquiries state
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [expandedInquiry, setExpandedInquiry] = useState<number | null>(null);

  // Clipboard
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  /* ---------------------------------------------------------------- */
  /*  Auth check                                                       */
  /* ---------------------------------------------------------------- */
  useEffect(() => {
    // Attempt to fetch members to verify auth cookie
    fetch('/api/admin/members')
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
          return res.json();
        }
        setAuthenticated(false);
        return null;
      })
      .then((data) => {
        if (data) setMembers(data);
        setMembersLoading(false);
      })
      .catch(() => {
        setAuthenticated(false);
        setMembersLoading(false);
      });
  }, []);

  /* ---------------------------------------------------------------- */
  /*  Data fetching                                                    */
  /* ---------------------------------------------------------------- */
  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const res = await fetch('/api/admin/members');
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
      }
    } catch {
      /* ignore */
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const fetchMemberDetail = useCallback(async (id: number) => {
    try {
      const res = await fetch(`/api/admin/members/${id}`);
      if (res.ok) {
        const data = await res.json();
        setMemberDetail(data);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch('/api/admin/inquiries');
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch {
      /* ignore */
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'inquiries' && inquiries.length === 0) {
      fetchInquiries();
    }
  }, [activeTab, inquiries.length, fetchInquiries]);

  /* ---------------------------------------------------------------- */
  /*  Expand member row                                                */
  /* ---------------------------------------------------------------- */
  function toggleMemberExpand(id: number) {
    if (expandedMember === id) {
      setExpandedMember(null);
      setMemberDetail(null);
    } else {
      setExpandedMember(id);
      fetchMemberDetail(id);
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Member CRUD                                                      */
  /* ---------------------------------------------------------------- */
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
        setShowAddMember(false);
        fetchMembers();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create member');
      }
    } catch {
      alert('Network error');
    }
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
        if (expandedMember === editingMember.id) {
          fetchMemberDetail(editingMember.id);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update member');
      }
    } catch {
      alert('Network error');
    }
  }

  async function handleDeleteMember(id: number, name: string) {
    if (!confirm(`Delete member "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMembers();
        if (expandedMember === id) {
          setExpandedMember(null);
          setMemberDetail(null);
        }
      }
    } catch {
      alert('Failed to delete member');
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Activation code                                                  */
  /* ---------------------------------------------------------------- */
  async function handleGenerateCode(memberId: number) {
    try {
      const res = await fetch(`/api/admin/members/${memberId}/activation-code`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchMemberDetail(memberId);
        fetchMembers();
      } else {
        alert('Failed to generate code');
      }
    } catch {
      alert('Network error');
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  }

  /* ---------------------------------------------------------------- */
  /*  Goals                                                            */
  /* ---------------------------------------------------------------- */
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
      if (res.ok) {
        fetchMemberDetail(memberId);
        fetchMembers();
        e.currentTarget.reset();
      }
    } catch {
      alert('Failed to add goal');
    }
  }

  async function handleUpdateGoalStatus(
    memberId: number,
    goalId: number,
    status: string
  ) {
    try {
      await fetch(`/api/admin/members/${memberId}/goals/${goalId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchMemberDetail(memberId);
    } catch {
      alert('Failed to update goal');
    }
  }

  async function handleDeleteGoal(memberId: number, goalId: number) {
    if (!confirm('Delete this goal?')) return;
    try {
      await fetch(`/api/admin/members/${memberId}/goals/${goalId}`, {
        method: 'DELETE',
      });
      fetchMemberDetail(memberId);
      fetchMembers();
    } catch {
      alert('Failed to delete goal');
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Logout                                                           */
  /* ---------------------------------------------------------------- */
  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/admin');
  }

  /* ---------------------------------------------------------------- */
  /*  Render guards                                                    */
  /* ---------------------------------------------------------------- */
  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900 dark:bg-red-950/30"
        >
          <ShieldAlert className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
            You must be logged in to view this page
          </h2>
          <button
            onClick={() => router.push('/admin')}
            className="mt-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  Stats                                                            */
  /* ---------------------------------------------------------------- */
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;
  const alumniMembers = members.filter((m) => m.status === 'ALUMNI').length;

  const sidebarItems: { key: Tab; label: string; icon: typeof Users }[] = [
    { key: 'members', label: 'Members', icon: Users },
    { key: 'inquiries', label: 'Inquiries', icon: Inbox },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  /* ---------------------------------------------------------------- */
  /*  Main render                                                      */
  /* ---------------------------------------------------------------- */
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 lg:block">
        <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-zinc-800">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
            AI.MED Admin
          </h1>
        </div>
        <nav className="p-4 space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 dark:border-zinc-800 dark:bg-zinc-900 lg:hidden">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">AI.MED Admin</h1>
          <div className="flex gap-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`rounded-lg p-2 ${
                    activeTab === item.key
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {/* ============ MEMBERS TAB ============ */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Total Members', value: totalMembers, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                  { label: 'Active', value: activeMembers, color: 'text-blue-700 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                  { label: 'Alumni', value: alumniMembers, color: 'text-slate-700 dark:text-slate-400', bg: 'bg-slate-100 dark:bg-zinc-800' },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                    <p className={`text-sm font-medium ${stat.color}`}>{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Add Member button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-800"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Member
                </button>
              </div>

              {/* Members table */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {membersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-emerald-700 border-t-transparent" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    No members yet. Add your first lab member above.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-zinc-700">
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400" />
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Name</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Role</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Join Date</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Goals</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <MemberRow
                            key={member.id}
                            member={member}
                            expanded={expandedMember === member.id}
                            detail={expandedMember === member.id ? memberDetail : null}
                            onToggle={() => toggleMemberExpand(member.id)}
                            onEdit={() => setEditingMember(member)}
                            onDelete={() => handleDeleteMember(member.id, member.name)}
                            onGenerateCode={() => handleGenerateCode(member.id)}
                            onCopyCode={copyCode}
                            copiedCode={copiedCode}
                            onAddGoal={(e) => handleAddGoal(e, member.id)}
                            onUpdateGoalStatus={(goalId, status) =>
                              handleUpdateGoalStatus(member.id, goalId, status)
                            }
                            onDeleteGoal={(goalId) => handleDeleteGoal(member.id, goalId)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ INQUIRIES TAB ============ */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Inquiry Submissions
              </h2>
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                {inquiriesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-6 w-6 animate-spin rounded-full border-3 border-emerald-700 border-t-transparent" />
                  </div>
                ) : inquiries.length === 0 ? (
                  <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                    No inquiries yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-zinc-700">
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400" />
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Name</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Email</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Role</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Interest</th>
                          <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiries.map((inq) => (
                          <InquiryRow
                            key={inq.id}
                            inquiry={inq}
                            expanded={expandedInquiry === inq.id}
                            onToggle={() =>
                              setExpandedInquiry(expandedInquiry === inq.id ? null : inq.id)
                            }
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============ SETTINGS TAB ============ */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Admin settings will be available in a future update. For now, configure
                  admin credentials via <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">ADMIN_EMAIL</code> and{' '}
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">ADMIN_PASSWORD</code> environment variables.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ============ ADD MEMBER MODAL ============ */}
      <AnimatePresence>
        {showAddMember && (
          <MemberFormModal
            title="Add New Member"
            onClose={() => setShowAddMember(false)}
            onSubmit={handleAddMember}
          />
        )}
      </AnimatePresence>

      {/* ============ EDIT MEMBER MODAL ============ */}
      <AnimatePresence>
        {editingMember && (
          <MemberFormModal
            title="Edit Member"
            member={editingMember}
            showStatus
            onClose={() => setEditingMember(null)}
            onSubmit={handleEditMember}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
/*  Member Form Modal                                                  */
/* ================================================================== */
function MemberFormModal({
  title,
  member,
  showStatus,
  onClose,
  onSubmit,
}: {
  title: string;
  member?: Member;
  showStatus?: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Name *
              </label>
              <input
                name="name"
                defaultValue={member?.name}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Email *
              </label>
              <input
                name="email"
                type="email"
                defaultValue={member?.email}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Role *
              </label>
              <select
                name="role"
                defaultValue={member?.role || ''}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              >
                <option value="" disabled>
                  Select role...
                </option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Join Date
              </label>
              <input
                name="joinDate"
                type="date"
                defaultValue={
                  member?.joinDate
                    ? new Date(member.joinDate).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              />
            </div>
          </div>
          {showStatus && (
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                name="status"
                defaultValue={member?.status || 'ACTIVE'}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="ALUMNI">Alumni</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              GitHub Username
            </label>
            <input
              name="githubUsername"
              defaultValue={member?.githubUsername || ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              placeholder="username"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Notion Page URL
            </label>
            <input
              name="notionPageUrl"
              defaultValue={member?.notionPageUrl || ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              placeholder="https://notion.so/..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Headshot URL
            </label>
            <input
              name="headshot"
              defaultValue={member?.headshot || ''}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
              Bio
            </label>
            <textarea
              name="bio"
              defaultValue={member?.bio || ''}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
            >
              {member ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ================================================================== */
/*  Member Row + Expanded Detail                                       */
/* ================================================================== */
function MemberRow({
  member,
  expanded,
  detail,
  onToggle,
  onEdit,
  onDelete,
  onGenerateCode,
  onCopyCode,
  copiedCode,
  onAddGoal,
  onUpdateGoalStatus,
  onDeleteGoal,
}: {
  member: Member;
  expanded: boolean;
  detail: Member | null;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onGenerateCode: () => void;
  onCopyCode: (code: string) => void;
  copiedCode: string | null;
  onAddGoal: (e: FormEvent<HTMLFormElement>) => void;
  onUpdateGoalStatus: (goalId: number, status: string) => void;
  onDeleteGoal: (goalId: number) => void;
}) {
  const quarterOptions = getQuarterOptions();

  return (
    <>
      <tr
        className="border-b border-slate-100 last:border-0 dark:border-zinc-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </td>
        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
          {member.name}
        </td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{member.role}</td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
          {new Date(member.joinDate).toLocaleDateString()}
        </td>
        <td className="px-4 py-3">
          <StatusBadge status={member.status} />
        </td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
          {member._count?.goals ?? 0}
        </td>
        <td className="px-4 py-3">
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onEdit}
              className="rounded px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
            >
              Edit
            </button>
            <button
              onClick={onDelete}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
            >
              Delete
            </button>
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={7} className="border-b border-slate-200 dark:border-zinc-700">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 px-6 py-5 dark:bg-zinc-800/30 space-y-6">
                  {/* Profile links */}
                  <div className="flex flex-wrap gap-3">
                    {member.boxFolderUrl && (
                      <a
                        href={member.boxFolderUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white dark:border-zinc-600 dark:text-slate-300 dark:hover:bg-zinc-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Box Folder
                      </a>
                    )}
                    {member.notionPageUrl && (
                      <a
                        href={member.notionPageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white dark:border-zinc-600 dark:text-slate-300 dark:hover:bg-zinc-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Notion
                      </a>
                    )}
                    {member.githubUsername && (
                      <a
                        href={`https://github.com/${member.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white dark:border-zinc-600 dark:text-slate-300 dark:hover:bg-zinc-700"
                      >
                        <GitFork className="h-3.5 w-3.5" />
                        GitHub
                      </a>
                    )}
                    {member.resumeUrl && (
                      <a
                        href={member.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-white dark:border-zinc-600 dark:text-slate-300 dark:hover:bg-zinc-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Resume
                      </a>
                    )}
                  </div>

                  {!detail ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-700 border-t-transparent" />
                    </div>
                  ) : (
                    <>
                      {/* Goals table */}
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                          Quarterly Goals
                        </h4>
                        {detail.goals && detail.goals.length > 0 ? (
                          <div className="rounded-lg border border-slate-200 dark:border-zinc-700 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-white dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700">
                                  <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Quarter</th>
                                  <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Title</th>
                                  <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Status</th>
                                  <th className="px-3 py-2 text-left font-medium text-slate-500 dark:text-slate-400">Notes</th>
                                  <th className="px-3 py-2" />
                                </tr>
                              </thead>
                              <tbody>
                                {detail.goals.map((goal) => (
                                  <tr key={goal.id} className="border-b border-slate-100 dark:border-zinc-700 last:border-0">
                                    <td className="px-3 py-2 text-slate-600 dark:text-slate-400">{goal.quarter}</td>
                                    <td className="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">{goal.title}</td>
                                    <td className="px-3 py-2">
                                      <select
                                        value={goal.status}
                                        onChange={(e) => onUpdateGoalStatus(goal.id, e.target.value)}
                                        className="rounded border border-slate-200 bg-white px-2 py-1 text-xs dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100"
                                      >
                                        {GOAL_STATUSES.map((s) => (
                                          <option key={s} value={s}>
                                            {s.replace(/_/g, ' ')}
                                          </option>
                                        ))}
                                      </select>
                                    </td>
                                    <td className="px-3 py-2 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                                      {goal.notes || '-'}
                                    </td>
                                    <td className="px-3 py-2">
                                      <button
                                        onClick={() => onDeleteGoal(goal.id)}
                                        className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 dark:text-slate-400">No goals yet.</p>
                        )}

                        {/* Add goal form */}
                        <form
                          onSubmit={onAddGoal}
                          className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-dashed border-slate-300 bg-white p-3 dark:border-zinc-600 dark:bg-zinc-800"
                        >
                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Quarter</label>
                            <select
                              name="quarter"
                              required
                              className="rounded border border-slate-200 px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-slate-100"
                            >
                              {quarterOptions.map((q) => (
                                <option key={q} value={q}>{q}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Title</label>
                            <input
                              name="title"
                              required
                              placeholder="Goal title"
                              className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-slate-100"
                            />
                          </div>
                          <div className="flex-1 min-w-[150px]">
                            <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">Description</label>
                            <input
                              name="description"
                              placeholder="Optional"
                              className="w-full rounded border border-slate-200 px-2 py-1.5 text-xs dark:border-zinc-600 dark:bg-zinc-700 dark:text-slate-100"
                            />
                          </div>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-1 rounded bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-800"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Goal
                          </button>
                        </form>
                      </div>

                      {/* Activation Code section */}
                      <div>
                        <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Key className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                          Activation Code
                        </h4>
                        {detail.activationCode ? (
                          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800">
                            <code className="font-mono text-sm font-bold tracking-widest text-emerald-700 dark:text-emerald-400">
                              {detail.activationCode.code}
                            </code>
                            <button
                              onClick={() => onCopyCode(detail.activationCode!.code)}
                              className="rounded p-1 text-slate-400 hover:text-emerald-600"
                            >
                              {copiedCode === detail.activationCode.code ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </button>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {detail.activationCode.used
                                ? 'Used'
                                : `Expires ${new Date(detail.activationCode.expiresAt).toLocaleDateString()}`}
                            </span>
                            {!detail.activationCode.used && (
                              <button
                                onClick={onGenerateCode}
                                className="ml-auto text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
                              >
                                Regenerate
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={onGenerateCode}
                            className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                          >
                            <Key className="h-3.5 w-3.5" />
                            Generate Activation Code
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

/* ================================================================== */
/*  Inquiry Row                                                        */
/* ================================================================== */
function InquiryRow({
  inquiry,
  expanded,
  onToggle,
}: {
  inquiry: Inquiry;
  expanded: boolean;
  onToggle: () => void;
}) {
  let attachmentCount = 0;
  if (inquiry.attachments) {
    try {
      attachmentCount = JSON.parse(inquiry.attachments).length;
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <tr
        className="border-b border-slate-100 last:border-0 dark:border-zinc-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800/50"
        onClick={onToggle}
      >
        <td className="px-4 py-3">
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
          {new Date(inquiry.createdAt).toLocaleDateString()}
        </td>
        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
          {inquiry.name}
        </td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{inquiry.email}</td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{inquiry.role || '-'}</td>
        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{inquiry.interestArea || '-'}</td>
        <td className="px-4 py-3">
          <StatusBadge status={inquiry.status} />
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <tr>
            <td colSpan={7} className="border-b border-slate-200 dark:border-zinc-700">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-50 px-6 py-5 dark:bg-zinc-800/30 space-y-4">
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                      Message
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {inquiry.message || 'No message provided.'}
                    </p>
                  </div>
                  {attachmentCount > 0 && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Attachments ({attachmentCount})
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(inquiry.attachments!).map(
                          (att: { label: string; fileName: string; boxFileUrl?: string }, i: number) => (
                            <a
                              key={i}
                              href={att.boxFileUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-300"
                            >
                              <ExternalLink className="h-3 w-3" />
                              {att.label || att.fileName}
                            </a>
                          )
                        )}
                      </div>
                    </div>
                  )}
                  {inquiry.notes && (
                    <div>
                      <h4 className="mb-1 text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                        Admin Notes
                      </h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{inquiry.notes}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
