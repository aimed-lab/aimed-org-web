'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Calendar,
  Plus,
  X,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
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

interface MemberInfo {
  name: string;
  email: string;
  goals: Goal[];
  projects: ProjectTask[];
}

const GOAL_STATUS_COLORS: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DEFERRED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function getUpcomingDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PlanningPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/member/profile')
      .then(async (res) => {
        if (!res.ok) {
          router.push('/member/activate');
          return;
        }
        setMember(await res.json());
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

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

  const currentQuarter = `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`;
  const goals = member.goals || [];
  const quarterGoals = goals.filter((g) => g.quarter === currentQuarter);
  const otherGoals = goals.filter((g) => g.quarter !== currentQuarter);

  // Schedule: next 7 days with tasks due
  const days = getUpcomingDays(7);
  const tasksWithDue = (member.projects || []).filter(
    (t) => t.dueDate && t.status !== 'DONE'
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (member as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-5xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Planning</h2>

        {/* Quarterly Goals */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Quarterly Goals ({currentQuarter})
          </h3>
          {quarterGoals.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No goals for this quarter. Your admin will assign goals.
            </p>
          ) : (
            <div className="space-y-3">
              {quarterGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {goal.title}
                      </p>
                      {goal.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                          {goal.description}
                        </p>
                      )}
                      {goal.notes && (
                        <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">
                          Notes: {goal.notes}
                        </p>
                      )}
                    </div>
                    <span
                      className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        GOAL_STATUS_COLORS[goal.status] || 'bg-slate-100 text-slate-600'
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

        {/* Other quarter goals */}
        {otherGoals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Other Quarters
            </h3>
            <div className="space-y-3">
              {otherGoals.map((goal) => (
                <div
                  key={goal.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      {goal.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{goal.quarter}</p>
                  </div>
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                      GOAL_STATUS_COLORS[goal.status] || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {goal.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Weekly Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Upcoming Deadlines (7 days)
          </h3>
          <div className="grid gap-2 sm:grid-cols-7">
            {days.map((day) => {
              const dayTasks = tasksWithDue.filter(
                (t) => t.dueDate && isSameDay(new Date(t.dueDate), day)
              );
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={`rounded-lg border p-3 ${
                    isToday
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-900/20'
                      : 'border-slate-100 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-800/50'
                  }`}
                >
                  <div className="text-center mb-2">
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">
                      {DAY_NAMES[day.getDay()]}
                    </p>
                    <p className={`text-lg font-bold ${isToday ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {day.getDate()}
                    </p>
                  </div>
                  {dayTasks.length === 0 ? (
                    <p className="text-center text-[10px] text-slate-400">--</p>
                  ) : (
                    <div className="space-y-1">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className="rounded bg-white px-1.5 py-1 text-[10px] font-medium text-slate-700 shadow-sm dark:bg-zinc-900 dark:text-slate-300"
                        >
                          {t.title.length > 20 ? t.title.slice(0, 20) + '...' : t.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
