'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Database,
  ExternalLink,
  GitFork,
  Globe,
  ShieldAlert,
  HardDrive,
  Link2,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface MemberInfo {
  name: string;
  email: string;
  orcidId: string | null;
  githubUsername: string | null;
  boxFolderUrl: string | null;
  notionPageUrl: string | null;
}

export default function DataPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/member/profile')
      .then(async (res) => {
        if (!res.ok) {
          setError('Not authenticated');
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

  if (error || !member) {
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

  const links = [
    {
      label: 'ORCID',
      icon: Globe,
      value: member.orcidId,
      href: member.orcidId ? `https://orcid.org/${member.orcidId}` : null,
      description: 'Your ORCID researcher identifier for academic publications.',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'GitHub',
      icon: GitFork,
      value: member.githubUsername,
      href: member.githubUsername ? `https://github.com/${member.githubUsername}` : null,
      description: 'Your GitHub profile for code repositories and contributions.',
      color: 'text-slate-800 dark:text-slate-200',
    },
    {
      label: 'Box Folder',
      icon: HardDrive,
      value: member.boxFolderUrl ? 'Linked' : null,
      href: member.boxFolderUrl,
      description: 'Your personal Box folder for research data and documents.',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Notion',
      icon: Link2,
      value: member.notionPageUrl ? 'Linked' : null,
      href: member.notionPageUrl,
      description: 'Your Notion workspace for lab notes and documentation.',
      color: 'text-slate-700 dark:text-slate-300',
    },
  ];

  return (
    <PortalLayout role="member" userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-3xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Data & Resources</h2>

        {/* Connected Services */}
        <div className="space-y-4">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.div
                key={link.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 ${link.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                      {link.label}
                    </h3>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                      {link.description}
                    </p>
                    {link.value ? (
                      <div className="mt-3">
                        {link.href ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 dark:border-zinc-700 dark:text-emerald-400 dark:hover:bg-zinc-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                            {link.value === 'Linked' ? 'Open' : link.value}
                          </a>
                        ) : (
                          <span className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                            {link.value}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm italic text-slate-400 dark:text-slate-500">
                        Not configured. Update from your Profile page.
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Datasets placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900"
        >
          <Database className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
          <h3 className="mt-3 font-semibold text-slate-600 dark:text-slate-400">
            Datasets Management
          </h3>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Dataset management features coming soon. Track your research datasets,
            share data with collaborators, and manage data access permissions.
          </p>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
