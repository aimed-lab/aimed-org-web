'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  FolderKanban,
  Target,
  Trophy,
  Award,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Goal {
  id: number;
  quarter: string;
  title: string;
  description: string | null;
  status: string;
  notes: string | null;
}

interface ProjectTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  category: string | null;
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
  orcidId: string | null;
  boxFolderUrl: string | null;
  notionPageUrl: string | null;
  githubUsername: string | null;
  goals: Goal[];
  projects: ProjectTask[];
}

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DEFERRED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  TODO: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

export default function MemberDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onboarding, setOnboarding] = useState<{
    completedCount: number;
    totalCount: number;
    allComplete: boolean;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/profile').then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      }),
      fetch('/api/member/onboarding').then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      }),
    ])
      .then(([profileData, onboardingData]) => {
        if (!profileData) {
          setError('Not authenticated');
          return;
        }
        setMember(profileData);
        if (onboardingData) {
          setOnboarding(onboardingData);
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

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

  const activeProjects = member.projects?.filter((p) => p.status !== 'DONE').length || 0;
  const currentQuarter = `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`;
  const quarterGoals = member.goals?.filter((g) => g.quarter === currentQuarter).length || 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (member as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start gap-5">
            {member.headshot ? (
              <img
                src={member.headshot}
                alt={member.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 dark:border-zinc-700"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                <User className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome, {member.name.split(' ')[0]}
              </h2>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">{member.role}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Calendar className="h-4 w-4" />
                Joined {new Date(member.joinDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Onboarding Banner */}
        {onboarding && !onboarding.allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <GraduationCap className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Complete Your Onboarding
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {onboarding.completedCount} of {onboarding.totalCount} training modules completed
                  </p>
                </div>
              </div>
              <Link
                href="/member/onboarding"
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors shrink-0"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${onboarding.totalCount > 0 ? (onboarding.completedCount / onboarding.totalCount) * 100 : 0}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Active Projects', value: activeProjects, icon: FolderKanban, color: 'text-blue-600 dark:text-blue-400' },
            { label: `Goals (${currentQuarter})`, value: quarterGoals, icon: Target, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Publications', value: '--', icon: Trophy, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'Awards', value: '--', icon: Award, color: 'text-amber-600 dark:text-amber-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Goals */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Quarterly Goals
            </h3>
            {!member.goals || member.goals.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No goals assigned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {member.goals.slice(0, 5).map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {goal.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {goal.quarter}
                        </p>
                      </div>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[goal.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {goal.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Projects */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <FolderKanban className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Recent Projects
            </h3>
            {!member.projects || member.projects.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No projects yet. Create one from the Projects page.
              </p>
            ) : (
              <div className="space-y-3">
                {member.projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {project.title}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[project.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {project.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {project.dueDate && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Quick Links
          </h3>
          <div className="flex flex-wrap gap-3">
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
                <ExternalLink className="h-4 w-4" />
                GitHub
              </a>
            )}
            <a
              href="https://aimed-lab.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
            >
              <ExternalLink className="h-4 w-4" />
              Lab Website
            </a>
          </div>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
