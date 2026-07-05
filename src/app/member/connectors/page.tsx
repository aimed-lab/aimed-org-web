'use client';

import { useEffect, useState } from 'react';
import { Plug, ShieldAlert, Loader2, Box, FolderGit, FileText, Server, MessageSquare, Database } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

type Me = { isAdmin?: boolean; permissions?: Record<string, boolean>; accessRole?: string } | null;

const CONNECTORS = [
  { key: 'box', name: 'Box', icon: Box, desc: 'Sync lab documents & personal folders.' },
  { key: 'notion', name: 'Notion', icon: FileText, desc: 'Link lab notes and knowledge base.' },
  { key: 'github', name: 'GitHub', icon: FolderGit, desc: 'Connect repositories for tools & code.' },
  { key: 'mcp', name: 'MCP Servers', icon: Server, desc: 'Register Model Context Protocol servers.' },
  { key: 'slack', name: 'Slack', icon: MessageSquare, desc: 'Post updates & notifications to channels.' },
  { key: 'turso', name: 'Data Sources', icon: Database, desc: 'Attach external datasets & databases.' },
];

export default function ConnectorsPage() {
  const [me, setMe] = useState<Me>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/member/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d))
      .catch(() => setMe(null))
      .finally(() => setLoading(false));
  }, []);

  const role: 'admin' | 'member' = me?.isAdmin ? 'admin' : 'member';
  const allowed = !!me?.permissions?.manage_connectors;

  return (
    <PortalLayout role={role}>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Plug className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Connectors</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Integrations for developers — connect external services to the lab portal.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : !allowed ? (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            Connectors require the <span className="font-semibold">Developer</span> role or higher. Ask an
            admin to upgrade your access.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {CONNECTORS.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.key}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-slate-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:bg-zinc-800 dark:text-slate-400">
                        Not connected
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.desc}</p>
                    <button
                      disabled
                      className="mt-3 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-500 dark:border-zinc-700 dark:text-slate-400"
                      title="Configuration coming soon"
                    >
                      Configure
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
