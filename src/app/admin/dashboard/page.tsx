'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LogOut,
  BookOpen,
  Inbox,
  ClipboardCheck,
  Newspaper,
  Upload,
  PlusCircle,
  Star,
  Image as ImageIcon,
  Download,
  ShieldAlert,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Sample data                                                        */
/* ------------------------------------------------------------------ */
const stats = [
  { label: 'Total Publications', value: 147, icon: BookOpen, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { label: 'Total Inquiries', value: 38, icon: Inbox, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  { label: 'Pending Reviews', value: 5, icon: ClipboardCheck, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  { label: 'News Items', value: 12, icon: Newspaper, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40' },
];

const inquiries = [
  { name: 'Alice Zhang', email: 'azhang@univ.edu', role: 'PhD Applicant', status: 'New', date: '2024-03-14' },
  { name: 'Raj Patel', email: 'rpatel@hospital.org', role: 'Postdoc', status: 'Reviewed', date: '2024-03-12' },
  { name: 'Emily Larson', email: 'elarson@college.edu', role: 'Undergraduate', status: 'New', date: '2024-03-10' },
  { name: 'Dr. Kenji Tanaka', email: 'ktanaka@pharma.co', role: 'Faculty/Collaborator', status: 'Contacted', date: '2024-03-08' },
  { name: 'Sofia Martinez', email: 'smartinez@press.com', role: 'Media/Press', status: 'New', date: '2024-03-06' },
];

const quickActions = [
  { label: 'Add News Item', icon: PlusCircle, color: 'bg-emerald-700 hover:bg-emerald-800' },
  { label: 'Feature Paper', icon: Star, color: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'Pin Photo', icon: ImageIcon, color: 'bg-purple-600 hover:bg-purple-700' },
  { label: 'Export Inquiries', icon: Download, color: 'bg-amber-600 hover:bg-amber-700' },
];

/* ------------------------------------------------------------------ */
/*  Status badge                                                       */
/* ------------------------------------------------------------------ */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    New: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    Reviewed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  };
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function AdminDashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = sessionStorage.getItem('aimed-admin-auth');
      setAuthenticated(auth === 'true');
    }
  }, []);

  function handleLogout() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('aimed-admin-auth');
    }
    router.push('/admin');
  }

  // Loading state
  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 dark:bg-zinc-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 rounded-2xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-900 dark:bg-red-950/30"
        >
          <ShieldAlert className="h-12 w-12 text-red-500" />
          <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
            You must be logged in to view this page
          </h2>
          <p className="text-sm text-red-600 dark:text-red-400">
            Please authenticate through the admin login portal.
          </p>
          <button
            onClick={() => router.push('/admin')}
            className="mt-2 rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Admin Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.bg}`}>
                  <Icon className={`h-6 w-6 ${s.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Recent Inquiries - spans 2 cols */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
              Recent Inquiries
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-700">
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Name</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Email</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Role</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Status</th>
                    <th className="pb-3 font-medium text-slate-500 dark:text-slate-400">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inq, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 last:border-0 dark:border-zinc-800"
                    >
                      <td className="py-3 font-medium text-slate-900 dark:text-slate-100">
                        {inq.name}
                      </td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{inq.email}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-400">{inq.role}</td>
                      <td className="py-3">
                        <StatusBadge status={inq.status} />
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{inq.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

          {/* Right column */}
          <div className="space-y-8">
            {/* CV Management */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                CV Management
              </h2>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                }}
                className={`flex flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-300 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800'
                }`}
              >
                <Upload className="h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Drag &amp; drop CV here
                </p>
                <p className="text-xs text-slate-400">or click to browse</p>
                <input type="file" className="hidden" id="cv-upload" accept=".pdf,.doc,.docx" />
                <label
                  htmlFor="cv-upload"
                  className="mt-2 cursor-pointer rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
                >
                  Upload CV
                </label>
              </div>
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                Last imported: March 10, 2024
              </p>
            </motion.section>

            {/* Quick Actions */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, i) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={i}
                      className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${action.color}`}
                    >
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          </div>
        </div>
      </main>
    </div>
  );
}
