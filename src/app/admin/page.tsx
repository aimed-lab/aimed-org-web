'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, KeyRound, Hash, ArrowLeft, Ticket, ShieldCheck, Eye, EyeOff } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'signup-verify' | 'signup-password' | 'forgot' | 'forgot-verify';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [invCode, setInvCode] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  function reset() { setError(''); setInfo(''); setLoading(false); }

  async function api(body: Record<string, string>) {
    const res = await fetch('/api/auth', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    return { res, data: await res.json() };
  }

  // ── Sign In ──────────────────────────────────────────────
  async function handleSignIn(e: FormEvent) {
    e.preventDefault(); reset();
    if (!email.trim() || !password.trim()) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      const { res, data } = await api({ action: 'login', email, password });
      if (res.ok && data.success) { router.push(data.redirect || '/member/dashboard'); }
      else { setError(data.error || 'Invalid credentials.'); setLoading(false); }
    } catch { setError('Login failed.'); setLoading(false); }
  }

  // ── Sign Up Step 1: email + optional invitation code ─────
  async function handleSignUp(e: FormEvent) {
    e.preventDefault(); reset();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      const { res, data } = await api({ action: 'signup', email, invitationCode: invCode });
      if (res.ok && data.success) { setInfo(data.message); setMode('signup-verify'); setLoading(false); }
      else { setError(data.error || 'Sign up failed.'); setLoading(false); }
    } catch { setError('Request failed.'); setLoading(false); }
  }

  // ── Sign Up Step 2: verify email code ────────────────────
  async function handleVerifyEmail(e: FormEvent) {
    e.preventDefault(); reset();
    if (verifyCode.length < 6) { setError('Please enter the 6-digit code.'); return; }
    setLoading(true);
    try {
      const { res, data } = await api({ action: 'verify-email', email, code: verifyCode });
      if (res.ok && data.success) { setInfo('Email verified! Set your password.'); setMode('signup-password'); setLoading(false); }
      else { setError(data.error || 'Verification failed.'); setLoading(false); }
    } catch { setError('Verification failed.'); setLoading(false); }
  }

  // ── Sign Up Step 3: set password ─────────────────────────
  async function handleSetPassword(e: FormEvent) {
    e.preventDefault(); reset();
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { res, data } = await api({ action: 'set-password', email, password, confirmPassword: confirmPw });
      if (res.ok && data.success) { router.push(data.redirect || '/member/dashboard'); }
      else { setError(data.error || 'Failed.'); setLoading(false); }
    } catch { setError('Failed.'); setLoading(false); }
  }

  // ── Forgot Password Step 1: send code ────────────────────
  async function handleForgot(e: FormEvent) {
    e.preventDefault(); reset();
    if (!email.trim()) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      const { res, data } = await api({ action: 'forgot-password', email });
      if (res.ok) { setInfo(data.message || 'Reset code sent.'); setMode('forgot-verify'); setLoading(false); }
      else { setError(data.error || 'Failed.'); setLoading(false); }
    } catch { setError('Failed.'); setLoading(false); }
  }

  // ── Forgot Password Step 2: code + new password ──────────
  async function handleResetPassword(e: FormEvent) {
    e.preventDefault(); reset();
    if (verifyCode.length < 6) { setError('Please enter the 6-digit code.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { res, data } = await api({ action: 'reset-password', email, code: verifyCode, password, confirmPassword: confirmPw });
      if (res.ok && data.success) { router.push(data.redirect || '/member/dashboard'); }
      else { setError(data.error || 'Reset failed.'); setLoading(false); }
    } catch { setError('Failed.'); setLoading(false); }
  }

  function switchMode(m: AuthMode) { reset(); setPassword(''); setConfirmPw(''); setVerifyCode(''); setMode(m); }

  const ic = 'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100';
  const btn = 'flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60';
  const spinner = <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />;

  const titles: Record<AuthMode, { h: string; sub: string }> = {
    signin: { h: 'Sign In', sub: 'AI.MED Lab Portal' },
    signup: { h: 'Sign Up', sub: 'Create your lab account' },
    'signup-verify': { h: 'Confirm Email', sub: 'Enter the code sent to your email' },
    'signup-password': { h: 'Set Password', sub: 'Choose a secure password' },
    forgot: { h: 'Reset Password', sub: 'We\'ll send a code to your email' },
    'forgot-verify': { h: 'Reset Password', sub: 'Enter code and new password' },
  };

  const t = titles[mode];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-zinc-950">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-700">
              <Lock className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t.h}</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.sub}</p>
          </div>

          <AnimatePresence mode="wait">
            {/* ── SIGN IN ──────────────────── */}
            {mode === 'signin' && (
              <motion.form key="signin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSignIn} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@institution.edu" className={ic} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className={ic + ' pr-10'} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading} className={btn}>{loading ? spinner : 'Sign In'}</button>
                <div className="flex justify-between text-xs">
                  <button type="button" onClick={() => switchMode('signup')} className="text-emerald-700 hover:underline dark:text-emerald-400">Create account</button>
                  <button type="button" onClick={() => switchMode('forgot')} className="text-slate-500 hover:underline dark:text-slate-400">Forgot password?</button>
                </div>
              </motion.form>
            )}

            {/* ── SIGN UP (email + invitation code) ── */}
            {mode === 'signup' && (
              <motion.form key="signup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Institutional Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@institution.edu" className={ic} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Invitation Code <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Ticket className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={invCode} onChange={e => setInvCode(e.target.value)} placeholder="Enter code if you have one" className={ic + ' font-mono'} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Invitation codes are emailed by the lab admin. Pre-registered and admin members can sign up without one.</p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading} className={btn}>{loading ? spinner : 'Continue'}</button>
                <button type="button" onClick={() => switchMode('signin')} className="flex w-full items-center justify-center gap-1 text-sm text-slate-500 hover:text-emerald-700 dark:text-slate-400">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </button>
              </motion.form>
            )}

            {/* ── SIGN UP: verify code ────── */}
            {mode === 'signup-verify' && (
              <motion.form key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleVerifyEmail} className="space-y-5">
                {info && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20"><p className="text-xs text-emerald-800 dark:text-emerald-300">{info}</p></div>}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmation Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} autoFocus className={ic + ' font-mono text-center text-lg tracking-[0.5em]'} />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">Check your email. Code expires in 10 minutes.</p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading || verifyCode.length < 6} className={btn}>{loading ? spinner : 'Verify Email'}</button>
                <button type="button" onClick={() => switchMode('signup')} className="flex w-full items-center justify-center gap-1 text-sm text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
              </motion.form>
            )}

            {/* ── SIGN UP: set password ───── */}
            {mode === 'signup-password' && (
              <motion.form key="setpw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSetPassword} className="space-y-5">
                {info && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20"><p className="text-xs text-emerald-800 dark:text-emerald-300"><ShieldCheck className="inline h-3.5 w-3.5 mr-1" />{info}</p></div>}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className={ic + ' pr-10'} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Eye className="h-4 w-4" /></button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Enter again" className={ic} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading} className={btn}>{loading ? spinner : 'Create Account & Login'}</button>
              </motion.form>
            )}

            {/* ── FORGOT PASSWORD ─────────── */}
            {mode === 'forgot' && (
              <motion.form key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleForgot} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@institution.edu" className={ic} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading} className={btn}>{loading ? spinner : 'Send Reset Code'}</button>
                <button type="button" onClick={() => switchMode('signin')} className="flex w-full items-center justify-center gap-1 text-sm text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In</button>
              </motion.form>
            )}

            {/* ── FORGOT: verify + new password ── */}
            {mode === 'forgot-verify' && (
              <motion.form key="resetpw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleResetPassword} className="space-y-5">
                {info && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20"><p className="text-xs text-emerald-800 dark:text-emerald-300">{info}</p></div>}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Reset Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" maxLength={6} autoFocus className={ic + ' font-mono text-center text-lg tracking-[0.5em]'} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">New Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" className={ic + ' pr-10'} />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><Eye className="h-4 w-4" /></button>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Enter again" className={ic} />
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <button type="submit" disabled={loading || verifyCode.length < 6} className={btn}>{loading ? spinner : 'Reset Password & Login'}</button>
                <button type="button" onClick={() => switchMode('forgot')} className="flex w-full items-center justify-center gap-1 text-sm text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
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
