'use client';

import { useEffect, useState, useCallback } from 'react';
import { KeyRound, ShieldAlert, Crown, Check, Loader2 } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

const ALL_ROLES = ['ADMIN', 'DEVELOPER', 'USER', 'INTERN'] as const;

const ROLE_BLURB: Record<string, string> = {
  OWNER: 'PI · permanent, full control',
  ADMIN: 'Manage lab, content, members & roles',
  DEVELOPER: 'Full features + connectors',
  USER: 'Full member features + sharing',
  INTERN: 'Limited · no sharing, no connectors',
};

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  resolvedRole: string;
  isOwner: boolean;
}

export default function RolesPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [actorRole, setActorRole] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/roles');
      if (res.status === 401 || res.status === 403) {
        setError('You do not have permission to manage roles.');
        setMembers([]);
        return;
      }
      const data = await res.json();
      setMembers(data.members || []);
      setActorRole(data.actorRole || '');
      setError('');
    } catch {
      setError('Failed to load roles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Which roles the current actor can assign to a given member.
  function optionsFor(m: Member): string[] {
    if (m.isOwner) return [];
    return ALL_ROLES.filter((r) => {
      if (r === 'ADMIN') return actorRole === 'OWNER'; // only owner grants/revokes admin
      // demoting an existing admin is also owner-only
      if (m.resolvedRole === 'ADMIN' && actorRole !== 'OWNER') return false;
      return true;
    });
  }

  async function setRole(m: Member, newRole: string) {
    if (newRole === m.resolvedRole) return;
    setSavingId(m.id);
    setError('');
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: m.id, accessRole: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update role.');
        return;
      }
      setMembers((prev) => prev.map((x) => (x.id === m.id ? { ...x, resolvedRole: newRole } : x)));
      setSavedId(m.id);
      setTimeout(() => setSavedId(null), 1500);
    } catch {
      setError('Failed to update role.');
    } finally {
      setSavingId(null);
    }
  }

  return (
    <PortalLayout role="admin">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Roles &amp; Access</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Assign or revoke access roles. The owner (PI) is permanent; only the owner can grant or
              revoke <span className="font-medium">Admin</span>.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Role legend */}
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(ROLE_BLURB).map(([r, blurb]) => (
            <div key={r} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
              <span className="font-semibold text-slate-800 dark:text-slate-200">{r}</span>
              <span className="text-slate-500 dark:text-slate-400"> — {blurb}</span>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading…
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-zinc-900 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2 font-medium">Member</th>
                  <th className="px-4 py-2 font-medium">Title</th>
                  <th className="px-4 py-2 font-medium">Access role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                {members.map((m) => (
                  <tr key={m.id} className="bg-white dark:bg-zinc-950">
                    <td className="px-4 py-2">
                      <div className="font-medium text-slate-900 dark:text-slate-100">{m.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{m.email}</div>
                    </td>
                    <td className="px-4 py-2 text-slate-600 dark:text-slate-400">{m.role}</td>
                    <td className="px-4 py-2">
                      {m.isOwner ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Crown className="h-3 w-3" /> OWNER (permanent)
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={m.resolvedRole}
                            disabled={savingId === m.id || optionsFor(m).length === 0}
                            onChange={(e) => setRole(m, e.target.value)}
                            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-200"
                          >
                            {/* current value always shown even if not re-assignable */}
                            {!optionsFor(m).includes(m.resolvedRole) && (
                              <option value={m.resolvedRole}>{m.resolvedRole}</option>
                            )}
                            {optionsFor(m).map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          {savingId === m.id && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                          {savedId === m.id && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {members.length === 0 && !error && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">No members yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
