'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  Save,
  CheckCircle2,
  ShieldAlert,
  ExternalLink,
  BookOpen,
  Globe,
  GitFork,
  GraduationCap,
  Link2,
  BarChart3,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface MemberInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  headshot: string | null;
  bio: string | null;
  orcidId: string | null;
  githubUsername: string | null;
  notionPageUrl: string | null;
  boxFolderUrl: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Editable fields
  const [bio, setBio] = useState('');
  const [orcidId, setOrcidId] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [notionPageUrl, setNotionPageUrl] = useState('');
  const [boxFolderUrl, setBoxFolderUrl] = useState('');

  useEffect(() => {
    fetch('/api/member/profile')
      .then(async (res) => {
        if (!res.ok) {
          router.push('/member/activate');
          return;
        }
        const data = await res.json();
        setMember(data);
        setBio(data.bio || '');
        setOrcidId(data.orcidId || '');
        setGithubUsername(data.githubUsername || '');
        setNotionPageUrl(data.notionPageUrl || '');
        setBoxFolderUrl(data.boxFolderUrl || '');
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/member/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio, orcidId, githubUsername, notionPageUrl, boxFolderUrl }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMember(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch {
      // ignore
    }
    setSaving(false);
  }

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

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (member as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-2xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile</h2>

        {/* Read-only info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center gap-4 mb-6">
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
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{member.name}</h3>
              <p className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">{member.role}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{member.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 dark:text-slate-400">Status</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">{member.status}</p>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400">Joined</span>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {new Date(member.joinDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Scholar Connections */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Scholar Profile & Citations
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                label: 'ORCID',
                value: member.orcidId,
                href: member.orcidId ? `https://orcid.org/${member.orcidId}` : null,
                icon: Globe,
                color: 'text-green-600 dark:text-green-400',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
              },
              {
                label: 'Google Scholar',
                value: null,
                href: null,
                icon: GraduationCap,
                color: 'text-blue-600 dark:text-blue-400',
                bgColor: 'bg-blue-50 dark:bg-blue-900/20',
              },
              {
                label: 'GitHub',
                value: member.githubUsername,
                href: member.githubUsername ? `https://github.com/${member.githubUsername}` : null,
                icon: GitFork,
                color: 'text-slate-700 dark:text-slate-300',
                bgColor: 'bg-slate-100 dark:bg-zinc-800',
              },
              {
                label: 'Semantic Scholar',
                value: null,
                href: null,
                icon: BookOpen,
                color: 'text-indigo-600 dark:text-indigo-400',
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
              },
            ].map((link) => {
              const Icon = link.icon;
              return (
                <div
                  key={link.label}
                  className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 dark:border-zinc-800"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${link.bgColor}`}>
                    <Icon className={`h-4 w-4 ${link.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{link.label}</p>
                    {link.value ? (
                      <a
                        href={link.href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                      >
                        {link.value} <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 dark:text-slate-500 italic">Not configured</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">
            Scholar profiles are linked through the Talent knowledge graph for citation tracking and collaboration discovery.
          </p>
        </motion.div>

        {/* Editable form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Edit Profile
          </h3>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A short bio about yourself"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                ORCID ID
              </label>
              <input
                type="text"
                value={orcidId}
                onChange={(e) => setOrcidId(e.target.value)}
                placeholder="0000-0001-2345-6789"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                GitHub Username
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="your-github-handle"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Notion Page URL
              </label>
              <input
                type="url"
                value={notionPageUrl}
                onChange={(e) => setNotionPageUrl(e.target.value)}
                placeholder="https://notion.so/..."
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Box Folder URL
              </label>
              <input
                type="url"
                value={boxFolderUrl}
                onChange={(e) => setBoxFolderUrl(e.target.value)}
                placeholder="https://app.box.com/folder/..."
                className={inputClass}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
              >
                {saving ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
              </button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Saved
                </motion.span>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
