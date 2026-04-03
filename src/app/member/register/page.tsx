'use client';

import { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Mail, KeyRound, Check } from 'lucide-react';

const ROLES = [
  'PhD Student',
  'Postdoc',
  'Research Staff',
  'Intern',
  'Visiting Scholar',
  'Undergraduate Researcher',
  'Other',
];

export default function MemberRegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    }>
      <MemberRegisterContent />
    </Suspense>
  );
}

function MemberRegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<'verify' | 'profile' | 'done'>('verify');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);

  // Auto-verify if email and code are in the URL
  useEffect(() => {
    if (searchParams.get('email') && searchParams.get('code')) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleVerify(e?: FormEvent) {
    if (e) e.preventDefault();
    setError('');
    if (!email.trim() || !code.trim()) {
      setError('Please enter your email and activation code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/member/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', email: email.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.memberId) {
        setMemberId(data.memberId);
        setStep('profile');
      } else {
        setError(data.error || 'Invalid email or code.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleProfile(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name')?.toString().trim();
    if (!name) {
      setError('Name is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/member/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete',
          memberId,
          email: email.trim(),
          code: code.trim(),
          name,
          role: fd.get('role')?.toString() || 'Other',
          bio: fd.get('bio')?.toString().trim() || undefined,
          githubUsername: fd.get('githubUsername')?.toString().trim() || undefined,
          orcidId: fd.get('orcidId')?.toString().trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('done');
        // Auto-redirect to member dashboard after 2 seconds
        setTimeout(() => router.push('/member/dashboard'), 2000);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700">
              {step === 'done' ? (
                <Check className="h-7 w-7 text-white" />
              ) : (
                <UserPlus className="h-7 w-7 text-white" />
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {step === 'verify' && 'Join AI.MED Lab'}
              {step === 'profile' && 'Complete Your Profile'}
              {step === 'done' && 'Welcome!'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {step === 'verify' && 'Verify your invitation to get started'}
              {step === 'profile' && 'Tell us a bit about yourself'}
              {step === 'done' && 'You\'re all set. Redirecting to your dashboard...'}
            </p>
          </div>

          {/* Step 1: Verify invitation */}
          {step === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={inputClass + ' pl-10'}
                    required
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Activation Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter your code"
                    maxLength={12}
                    className={inputClass + ' pl-10 font-mono tracking-wider'}
                    required
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Verify & Continue'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Complete profile */}
          {step === 'profile' && (
            <form onSubmit={handleProfile} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input name="name" placeholder="Your full name" required className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select name="role" className={inputClass}>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
                <textarea name="bio" placeholder="Brief description of your research interests" rows={3} className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">GitHub Username</label>
                <input name="githubUsername" placeholder="e.g. johndoe" className={inputClass} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">ORCID ID</label>
                <input name="orcidId" placeholder="e.g. 0000-0002-1234-5678" className={inputClass} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}

          {/* Step 3: Done */}
          {step === 'done' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Redirecting to your dashboard...
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
