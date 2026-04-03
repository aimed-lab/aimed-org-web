'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, KeyRound, Send, ArrowLeft, Hash } from 'lucide-react';

type LoginStep = 'email-passcode' | 'verify-code';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>('email-passcode');
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [magicCode, setMagicCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendMagicLink(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !passcode.trim()) {
      setError('Please enter both email and passcode.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-magic-code', email, passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('A 6-digit code has been sent to your email.');
        setStep('verify-code');
        setLoading(false);
      } else {
        setError(data.error || 'Failed to send code.');
        setLoading(false);
      }
    } catch {
      setError('Request failed. Please try again.');
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!magicCode.trim()) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-magic-code', email, code: magicCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(data.redirect || '/admin/dashboard');
      } else {
        setError(data.error || 'Invalid code.');
        setLoading(false);
      }
    } catch {
      setError('Verification failed. Please try again.');
      setLoading(false);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Lab Login
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {step === 'email-passcode'
                ? 'AI.MED Lab Portal'
                : 'Enter the code sent to your email'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Step 1: Email + Passcode ─────────── */}
            {step === 'email-passcode' && (
              <motion.form
                key="email-passcode"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendMagicLink}
                className="space-y-5"
              >
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Passcode
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Enter lab passcode"
                      className={inputClass}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Lab passcode is provided by your administrator.
                  </p>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send magic link by email
                    </>
                  )}
                </button>
              </motion.form>
            )}

            {/* ── Step 2: Verify 6-digit Code ─────── */}
            {step === 'verify-code' && (
              <motion.form
                key="verify-code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyCode}
                className="space-y-5"
              >
                {success && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      {success}
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={magicCode}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setMagicCode(v);
                      }}
                      placeholder="000000"
                      maxLength={6}
                      autoFocus
                      className={inputClass + ' font-mono text-center text-lg tracking-[0.5em]'}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Check your email for the 6-digit code. It expires in 10 minutes.
                  </p>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={loading || magicCode.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    'Verify & Login'
                  )}
                </button>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => { setStep('email-passcode'); setError(''); setSuccess(''); setMagicCode(''); }}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-700 dark:text-slate-400"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setSuccess('');
                      setMagicCode('');
                      handleSendMagicLink({ preventDefault: () => {} } as FormEvent);
                    }}
                    className="text-sm text-emerald-700 hover:text-emerald-800 dark:text-emerald-400"
                  >
                    Resend code
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
          Protected area. Authorized personnel only.
        </p>
      </motion.div>
    </div>
  );
}
