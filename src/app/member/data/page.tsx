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
  Folder,
  FileText,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface MemberInfo {
  name: string;
  email: string;
  isAdmin?: boolean;
  orcidId: string | null;
  githubUsername: string | null;
  boxFolderUrl: string | null;
  boxFolderId: string | null;
  notionPageUrl: string | null;
}

interface BoxFile {
  id: string;
  type: string;
  name: string;
  size: number | null;
  modifiedAt: string | null;
}

interface BoxFolder {
  folderName: string;
  folderId: string;
  rootFolderId: string;
  files: BoxFile[];
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DataPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Box file browser state
  const [boxData, setBoxData] = useState<BoxFolder | null>(null);
  const [boxLoading, setBoxLoading] = useState(false);
  const [boxError, setBoxError] = useState('');
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);

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

  // Fetch Box files when member loads and has a boxFolderId
  useEffect(() => {
    if (member?.boxFolderId) {
      fetchBoxFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member?.boxFolderId]);

  async function fetchBoxFiles(folderId?: string) {
    setBoxLoading(true);
    setBoxError('');
    try {
      const url = folderId
        ? `/api/member/box/files?folderId=${folderId}`
        : '/api/member/box/files';
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json();
        setBoxError(data.error || 'Failed to load files');
        return;
      }
      setBoxData(await res.json());
    } catch {
      setBoxError('Failed to connect to Box');
    } finally {
      setBoxLoading(false);
    }
  }

  function navigateToFolder(folderId: string, folderName: string) {
    setFolderStack((prev) => [...prev, { id: folderId, name: folderName }]);
    fetchBoxFiles(folderId);
  }

  function navigateBack() {
    const newStack = [...folderStack];
    newStack.pop();
    setFolderStack(newStack);
    const parentId = newStack.length > 0 ? newStack[newStack.length - 1].id : undefined;
    fetchBoxFiles(parentId);
  }

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
          onClick={() => router.push('/admin')}
          className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Go to Login
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

  const portalRole = member?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
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

        {/* Box File Browser */}
        {member.boxFolderId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Box Files
                </h3>
                {boxData && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    — {boxData.folderName}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {folderStack.length > 0 && (
                  <button
                    onClick={navigateBack}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    const currentId = folderStack.length > 0 ? folderStack[folderStack.length - 1].id : undefined;
                    fetchBoxFiles(currentId);
                  }}
                  disabled={boxLoading}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${boxLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Breadcrumb */}
            {folderStack.length > 0 && (
              <div className="flex items-center gap-1 border-b border-slate-100 px-5 py-2 text-xs text-slate-500 dark:border-zinc-800 dark:text-slate-400">
                <button
                  onClick={() => { setFolderStack([]); fetchBoxFiles(); }}
                  className="hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  Root
                </button>
                {folderStack.map((f, idx) => (
                  <span key={f.id} className="flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" />
                    <button
                      onClick={() => {
                        const newStack = folderStack.slice(0, idx + 1);
                        setFolderStack(newStack);
                        fetchBoxFiles(f.id);
                      }}
                      className="hover:text-emerald-700 dark:hover:text-emerald-400"
                    >
                      {f.name}
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="p-2">
              {boxLoading && !boxData && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              )}

              {boxError && (
                <div className="px-3 py-6 text-center text-sm text-red-500 dark:text-red-400">
                  {boxError}
                </div>
              )}

              {boxData && !boxError && (
                <>
                  {boxData.files.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
                      This folder is empty.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                      {/* Folders first, then files */}
                      {boxData.files
                        .sort((a, b) => {
                          if (a.type === 'folder' && b.type !== 'folder') return -1;
                          if (a.type !== 'folder' && b.type === 'folder') return 1;
                          return a.name.localeCompare(b.name);
                        })
                        .map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                              item.type === 'folder'
                                ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800'
                                : ''
                            }`}
                            onClick={
                              item.type === 'folder'
                                ? () => navigateToFolder(item.id, item.name)
                                : undefined
                            }
                          >
                            {item.type === 'folder' ? (
                              <Folder className="h-4 w-4 shrink-0 text-blue-500 dark:text-blue-400" />
                            ) : (
                              <FileText className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                            )}
                            <span className="flex-1 truncate text-slate-800 dark:text-slate-200">
                              {item.name}
                            </span>
                            {item.size != null && item.type !== 'folder' && (
                              <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                                {formatBytes(item.size)}
                              </span>
                            )}
                            {item.type === 'folder' && (
                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Datasets placeholder — only show when no Box folder */}
        {!member.boxFolderId && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900"
          >
            <Database className="mx-auto h-10 w-10 text-slate-300 dark:text-zinc-600" />
            <h3 className="mt-3 font-semibold text-slate-600 dark:text-slate-400">
              Box Folder Not Linked
            </h3>
            <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
              Ask your PI to assign a Box folder ID to your profile to browse files here.
            </p>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}
