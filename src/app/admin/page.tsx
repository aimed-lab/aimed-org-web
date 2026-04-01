'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, KeyRound, Ticket, ArrowLeft, ShieldCheck } from 'lucide-react';

type LoginMode = 'password' | 'code' | 'change-password';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mustChange, setMustChange] = useState(false);

  async function handlePasswordLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.mustChangePassword) {
          setMustChange(true);
          setMode('change-password');
          setLoading(false);
        } else {
          router.push('/admin/dashboard');
        }
      } else {
        setError(data.error || 'Invalid credentials.');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  }

  async function handleCodeLogin(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !code.trim()) {
      setError('Please enter both email and activation code.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login-code', email, code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        router.push(data.redirect || '/admin/dashboard');
      } else {
        setError(data.error || 'Invalid code.');
        setLoading(false);
      }
    } catch {
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('Please fill in both password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          email,
          oldPassword: password,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Password changed! Redirecting...');
        // Re-login with new password to set fresh cookie
        const loginRes = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password: newPassword }),
        });
        if (loginRes.ok) {
          setTimeout(() => router.push('/admin/dashboard'), 1000);
        }
      } else {
        setError(data.error || 'Password change failed.');
        setLoading(false);
      }
    } catch {
      setError('Failed. Please try again.');
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
              {mode === 'change-password' ? 'Set New Password' : 'Lab Login'}
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {mode === 'change-password'
                ? 'You must change your default password before continuing.'
                : mode === 'code'
                ? 'Enter your email and activation code'
                : 'AI.MED Lab Administration Portal'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── Password Login ───────────────── */}
            {mode === 'password' && (
              <motion.form
                key="password"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handlePasswordLogin}
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
                      placeholder="jakechen@uab.edu"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className={inputClass}
                    />
                  </div>
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
                    'Log In'
                  )}
                </button>

                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <div className="flex-1 border-t border-slate-200 dark:border-zinc-700" />
                  or
                  <div className="flex-1 border-t border-slate-200 dark:border-zinc-700" />
                </div>

                <button
                  type="button"
                  onClick={() => { setMode('code'); setError(''); }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-300 dark:hover:bg-zinc-700"
                >
                  <Ticket className="h-4 w-4" />
                  Login with Activation Code
                </button>
              </motion.form>
            )}

            {/* ── Code Login ───────────────────── */}
            {mode === 'code' && (
              <motion.form
                key="code"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleCodeLogin}
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
                    Activation Code
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter activation code"
                      maxLength={12}
                      className={inputClass + " font-mono tracking-wider"}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Activation codes are provided by the lab admin.
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
                    'Activate & Login'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setMode('password'); setError(''); }}
                  className="flex w-full items-center justify-center gap-2 text-sm text-slate-500 hover:text-emerald-700 dark:text-slate-400"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to password login
                </button>
              </motion.form>
            )}

            {/* ── Change Password ──────────────── */}
            {mode === 'change-password' && (
              <motion.form
                key="change"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                onSubmit={handleChangePassword}
                className="space-y-5"
              >
                {mustChange && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      <strong>First-time login:</strong> You must set a new password before continuing.
                    </p>
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Enter again"
                      className={inputClass}
                    />
                  </div>
                </div>

                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500">
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-600">
                    {success}
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
                    'Set Password & Continue'
                  )}
                </button>
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
