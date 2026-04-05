'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Award, ShieldAlert } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Honor {
  id: number;
  awardName: string;
  year: number | null;
  category: string | null;
  issuer: string | null;
  description: string | null;
}

interface MemberInfo {
  name: string;
  email: string;
}

export default function HonorsPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [honors, setHonors] = useState<Honor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/honors').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, h]) => {
        if (!m) {
          router.push('/member/activate');
          return;
        }
        setMember(m);
        setHonors(h || []);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (member as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center gap-3">
          <Award className="h-6 w-6 text-amber-500" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Honors & Awards</h2>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Lab-wide honors and awards. Individual member awards will be tracked here as the feature expands.
        </p>

        {honors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <Award className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              No honors or awards recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {honors.map((honor, i) => (
              <motion.div
                key={honor.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.03 * i }}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {honor.awardName}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      {honor.issuer && <span>{honor.issuer}</span>}
                      {honor.year && <span>{honor.year}</span>}
                    </div>
                    {honor.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                        {honor.description}
                      </p>
                    )}
                    {honor.category && (
                      <span className="mt-2 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        {honor.category}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
