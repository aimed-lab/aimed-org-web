'use client';

import { useState, FormEvent } from 'react';
import { UserPlus, CheckCircle2, Loader2 } from 'lucide-react';

export default function ApplyPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState('');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/member/request-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, note }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong.'); return; }
      setDone(data.message || 'Request submitted.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Request to Join the Lab</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            AI.MED Lab — submit a request and an admin will review it.
          </p>
        </div>

        {done ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-900 dark:bg-emerald-900/20">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <p className="text-sm text-emerald-800 dark:text-emerald-300">{done}</p>
            <a href="/" className="text-sm font-medium text-emerald-700 underline dark:text-emerald-400">Back to home</a>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full name</label>
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                placeholder="you@university.edu"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Note <span className="text-slate-400">(optional)</span></label>
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-slate-100"
                placeholder="Your interests / how you'd like to contribute"
              />
            </div>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Submit request
            </button>
            <p className="text-center text-xs text-slate-400">
              Already a member? <a href="/admin" className="text-emerald-600 underline">Sign in</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
