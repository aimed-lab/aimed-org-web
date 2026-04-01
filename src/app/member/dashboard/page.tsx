'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  GitFork,
  ExternalLink,
  Target,
  ShieldAlert,
  LogOut,
} from 'lucide-react';

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
  headshot: string | null;
  bio: string | null;
  boxFolderUrl: string | null;
  notionPageUrl: string | null;
  githubUsername: string | null;
  goals: Goal[];
}

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DEFERRED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export default function MemberDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/member/me')
      .then(async (res) => {
        if (!res.ok) {
          setError('Not authenticated');
          return;
        }
        const data = await res.json();
        setMember(data);
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    document.cookie = 'member_token=; path=/; max-age=0';
    router.push('/member/activate');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900 dark:bg-red-950/30"
        >
          <ShieldAlert className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
            Authentication Required
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400">
            Please activate your account to access this page.
          </p>
          <button
            onClick={() => router.push('/member/activate')}
            className="mt-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Go to Activation
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Member Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start gap-6">
            {member.headshot ? (
              <img
                src={member.headshot}
                alt={member.name}
                className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 dark:border-zinc-700"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <User className="h-10 w-10 text-emerald-700 dark:text-emerald-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {member.name}
              </h2>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">{member.role}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                Joined {new Date(member.joinDate).toLocaleDateString()}
              </div>
              {member.bio && (
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{member.bio}</p>
              )}
            </div>
          </div>

          {/* Profile Links */}
          <div className="mt-6 flex gap-3">
            {member.boxFolderUrl && (
              <a
                href={member.boxFolderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
              >
                <ExternalLink className="h-4 w-4" />
                Box Folder
              </a>
            )}
            {member.notionPageUrl && (
              <a
                href={member.notionPageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
              >
                <ExternalLink className="h-4 w-4" />
                Notion
              </a>
            )}
            {member.githubUsername && (
              <a
                href={`https://github.com/${member.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
              >
                <GitFork className="h-4 w-4" />
                GitHub
              </a>
            )}
          </div>
        </motion.div>

        {/* Goals */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <Target className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            Quarterly Goals
          </h3>

          {member.goals.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No goals assigned yet. Your admin will set up your quarterly goals.
            </p>
          ) : (
            <div className="space-y-4">
              {member.goals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {goal.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {goal.quarter}
                      </p>
                    </div>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        statusColors[goal.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  {goal.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                      {goal.description}
                    </p>
                  )}
                  {goal.notes && (
                    <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">
                      Notes: {goal.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
