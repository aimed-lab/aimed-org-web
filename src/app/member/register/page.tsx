'use client';

import { useState, FormEvent, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserPlus, Mail, KeyRound, Lock, ShieldCheck, Check } from 'lucide-react';

type Step = 'details' | 'verify' | 'password' | 'done';

async function auth(payload: Record<string, unknown>) {
  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
}

export default function MemberRegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('details');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [invite, setInvite] = useState(searchParams.get('code') || '');
  const [emailCode, setEmailCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const autoStarted = useRef(false);

  // Step 1 — validate invite code + email, send the email verification code.
  async function startVerification(e?: FormEvent) {
    if (e) e.preventDefault();
    setError('');
    if (!email.trim() || !invite.trim()) {
      setError('Please enter both your email and the invitation code from your email.');
      return;
    }
    setLoading(true);
    try {
      const { res, data } = await auth({ action: 'signup', email: email.trim(), invitationCode: invite.trim() });
      if (!res.ok) {
        // e.g. invalid/used/expired code, or email not eligible
        setError(data.error || 'Account cannot be activated — the code or email is invalid.');
        return;
      }
      if (data.ownerBypass) {
        setInfo('Email recognized. Set your password.');
        setStep('password');
        return;
      }
      setInfo(`A 6-digit verification code was sent to ${email.trim()}.`);
      setStep('verify');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-start when arriving from the invite email link (?email=&code=).
  useEffect(() => {
    if (!autoStarted.current && searchParams.get('email') && searchParams.get('code')) {
      autoStarted.current = true;
      startVerification();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Step 2 — confirm the emailed 6-digit code (proves the email is theirs).
  async function verifyEmail(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (emailCode.trim().length < 6) { setError('Enter the 6-digit code from your email.'); return; }
    setLoading(true);
    try {
      const { res, data } = await auth({ action: 'verify-email', email: email.trim(), code: emailCode.trim() });
      if (res.ok && data.success) { setInfo('Email verified. Set your password.'); setStep('password'); }
      else setError(data.error || 'That code is incorrect or has expired.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Step 3 — set the password twice, creating the account and logging in.
  async function setPasswordSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { res, data } = await auth({ action: 'set-password', email: email.trim(), password, confirmPassword: confirm });
      if (res.ok && data.success) {
        setStep('done');
        setTimeout(() => router.push('/member/onboarding'), 1500);
      } else {
        setError(data.error || 'Could not set the password. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100';

  const heading = {
    details: 'Join AI.MED Lab',
    verify: 'Verify Your Email',
    password: 'Set Your Password',
    done: 'Welcome!',
  }[step];
  const sub = {
    details: 'Enter your email and the invitation code your PI sent you.',
    verify: 'Enter the 6-digit code we just emailed you.',
    password: 'Choose a password (used to sign in from now on).',
    done: "You're all set — taking you to your onboarding.",
  }[step];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700">
              {step === 'done' ? <Check className="h-7 w-7 text-white" /> : step === 'verify' ? <ShieldCheck className="h-7 w-7 text-white" /> : <UserPlus className="h-7 w-7 text-white" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{heading}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sub}</p>
          </div>

          {/* progress dots */}
          {step !== 'done' && (
            <div className="mb-5 flex items-center justify-center gap-2">
              {(['details', 'verify', 'password'] as Step[]).map((s, i) => (
                <span key={s} className={`h-1.5 rounded-full transition-all ${step === s ? 'w-6 bg-emerald-600' : (['details', 'verify', 'password'].indexOf(step) > i ? 'w-6 bg-emerald-300' : 'w-3 bg-slate-200 dark:bg-zinc-700')}`} />
              ))}
            </div>
          )}

          {info && step !== 'done' && <p className="mb-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">{info}</p>}

          {step === 'details' && (
            <form onSubmit={startVerification} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className={inputClass} required />
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" value={invite} onChange={(e) => setInvite(e.target.value)} placeholder="Invitation code" maxLength={12} className={inputClass + ' font-mono tracking-wider'} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60">
                {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Continue'}
              </button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={verifyEmail} className="space-y-4">
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="text" inputMode="numeric" value={emailCode} onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ''))} placeholder="6-digit code" maxLength={6} className={inputClass + ' text-center font-mono text-lg tracking-[0.4em]'} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60">
                {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Verify'}
              </button>
              <button type="button" onClick={() => startVerification()} className="w-full text-center text-xs text-slate-400 hover:text-emerald-600">Didn&apos;t get it? Resend code</button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={setPasswordSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 8 chars)" className={inputClass} required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm password" className={inputClass} required />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60">
                {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Create account'}
              </button>
            </form>
          )}

          {step === 'done' && (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Account created. Opening your onboarding…</p>
            </div>
          )}

          {step === 'details' && (
            <p className="mt-5 text-center text-xs text-slate-400">
              Already have an account? <a href="/member/activate" className="font-medium text-emerald-600 hover:underline">Sign in</a>
              {' · '}No invite? <a href="/apply" className="font-medium text-emerald-600 hover:underline">Request to join</a>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
