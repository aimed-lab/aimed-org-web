'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserPlus, ShieldAlert, Loader2, Check, X } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface JoinRequest {
  id: number;
  name: string;
  email: string;
  bio: string | null;
  createdAt: string;
}

export default function RequestsPage() {
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [assignable, setAssignable] = useState<string[]>([]);
  const [choice, setChoice] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // determine portal chrome (admin vs member)
      const me = await (await fetch('/api/member/me')).json().catch(() => null);
      if (me?.isAdmin) setRole('admin');
      const res = await fetch('/api/member/join-requests');
      if (res.status === 401 || res.status === 403) {
        setError('You do not have permission to review join requests.');
        setRequests([]);
        return;
      }
      const data = await res.json();
      setRequests(data.requests || []);
      setAssignable(data.assignable || []);
      setChoice(Object.fromEntries((data.requests || []).map((r: JoinRequest) => [r.id, (data.assignable || []).slice(-1)[0] || 'INTERN'])));
      setError('');
    } catch {
      setError('Failed to load requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function act(id: number, action: 'approve' | 'reject') {
    setBusyId(id);
    setError('');
    try {
      const res = await fetch('/api/member/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: id, action, accessRole: choice[id] }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Action failed.'); return; }
      setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setError('Action failed.');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <PortalLayout role={role}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Join Requests</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Approve applicants into a role below your own, or reject the request.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
            <ShieldAlert className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 py-12 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading…</div>
        ) : requests.length === 0 && !error ? (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400 dark:border-zinc-800 dark:bg-zinc-900">
            No pending requests.
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{r.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{r.email}</div>
                    {r.bio && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{r.bio}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={choice[r.id] || ''}
                      onChange={(e) => setChoice((c) => ({ ...c, [r.id]: e.target.value }))}
                      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-200"
                    >
                      {assignable.map((role) => <option key={role} value={role}>{role}</option>)}
                    </select>
                    <button
                      onClick={() => act(r.id, 'approve')}
                      disabled={busyId === r.id || assignable.length === 0}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {busyId === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Approve
                    </button>
                    <button
                      onClick={() => act(r.id, 'reject')}
                      disabled={busyId === r.id}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
                    >
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
