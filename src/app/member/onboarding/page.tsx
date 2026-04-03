'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  BookOpen,
  Monitor,
  Scale,
  ShieldCheck,
  ClipboardCheck,
  CheckCircle,
  XCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BookOpen,
  Monitor,
  Scale,
  ShieldCheck,
  ClipboardCheck,
};

interface ModuleProgress {
  moduleId: string;
  title: string;
  description: string;
  icon: string;
  estimatedMinutes: number;
  questionCount: number;
  passed: boolean;
  score: number | null;
  attempts: number;
  completedAt: string | null;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [modules, setModules] = useState<ModuleProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberInfo, setMemberInfo] = useState<{ name: string; email: string; isAdmin?: boolean } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/onboarding').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([me, data]) => {
        if (!me) {
          setError('Not authenticated');
          return;
        }
        setMemberInfo(me);
        if (data?.modules) {
          setModules(data.modules);
        }
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

  if (error || !memberInfo) {
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

  const completedCount = modules.filter((m) => m.passed).length;
  const totalCount = modules.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const allComplete = completedCount === totalCount;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (memberInfo as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={memberInfo.name} userEmail={memberInfo.email}>
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Onboarding Training
          </h2>
        </div>

        {/* Progress Banner */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border p-6 ${
            allComplete
              ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
              : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className={`text-sm font-semibold ${
              allComplete
                ? 'text-green-800 dark:text-green-200'
                : 'text-amber-800 dark:text-amber-200'
            }`}>
              {allComplete ? 'Onboarding Complete!' : 'Complete All Modules to Finish Onboarding'}
            </h3>
            <span className={`text-sm font-bold ${
              allComplete
                ? 'text-green-700 dark:text-green-300'
                : 'text-amber-700 dark:text-amber-300'
            }`}>
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/60 dark:bg-zinc-800">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${
                allComplete
                  ? 'bg-green-500'
                  : 'bg-amber-500'
              }`}
            />
          </div>
          {!allComplete && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Complete each module by reading the material and passing the quiz (80%+ required).
            </p>
          )}
        </motion.div>

        {/* Module Cards */}
        <div className="space-y-4">
          {modules.map((mod, i) => {
            const Icon = iconMap[mod.icon] || BookOpen;
            return (
              <motion.div
                key={mod.moduleId}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                    mod.passed
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-slate-100 dark:bg-zinc-800'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      mod.passed
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-slate-500 dark:text-slate-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {mod.title}
                      </h3>
                      {mod.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : mod.attempts > 0 ? (
                        <XCircle className="h-4 w-4 text-red-400" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {mod.description}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
                      <span>{mod.estimatedMinutes} min read</span>
                      <span>{mod.questionCount} questions</span>
                      {mod.score !== null && (
                        <span className={`font-medium ${
                          mod.passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                        }`}>
                          Score: {mod.score}%
                        </span>
                      )}
                      {mod.attempts > 0 && (
                        <span>
                          {mod.attempts} attempt{mod.attempts !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/member/onboarding/${mod.moduleId}`)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                      mod.passed
                        ? 'border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800'
                        : 'bg-emerald-700 text-white hover:bg-emerald-800'
                    }`}
                  >
                    {mod.passed ? 'Review' : mod.attempts > 0 ? 'Retake' : 'Start'}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PortalLayout>
  );
}
