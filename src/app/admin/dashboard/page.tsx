'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  UserCheck,
  GraduationCap,
  Inbox,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joinDate: string;
  _count?: { goals: number };
}

interface Inquiry {
  id: number;
  name: string;
  email: string;
  role: string | null;
  interestArea: string | null;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  REVIEWED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  REPLIED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  SHORTLISTED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  ACCEPTED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DECLINED: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  ARCHIVED: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-400',
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/members').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/admin/inquiries').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, i]) => {
        if (!m) {
          setAuthenticated(false);
          return;
        }
        setAuthenticated(true);
        setMembers(m || []);
        setInquiries(i || []);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

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

  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'ACTIVE').length;
  const alumniMembers = members.filter((m) => m.status === 'ALUMNI').length;
  const newInquiries = inquiries.filter((i) => i.status === 'NEW').length;

  return (
    <PortalLayout role="admin" userName="Admin">
      <div className="mx-auto max-w-5xl space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Total Members', value: totalMembers, icon: Users, color: 'text-blue-600 dark:text-blue-400' },
            { label: 'Active', value: activeMembers, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Alumni', value: alumniMembers, icon: GraduationCap, color: 'text-purple-600 dark:text-purple-400' },
            { label: 'New Inquiries', value: newInquiries, icon: Inbox, color: 'text-amber-600 dark:text-amber-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Inquiries */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Inbox className="h-4 w-4 text-amber-500" />
                Recent Inquiries
              </h3>
              <button
                onClick={() => router.push('/admin/recruits')}
                className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {inquiries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No inquiries yet.</p>
            ) : (
              <div className="space-y-3">
                {inquiries.slice(0, 5).map((inq) => (
                  <div
                    key={inq.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {inq.name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {inq.role || 'Unknown role'} - {new Date(inq.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[inq.status] || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Member Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Members
              </h3>
              <button
                onClick={() => router.push('/admin/members')}
                className="flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                Manage
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No members yet.</p>
            ) : (
              <div className="space-y-3">
                {members
                  .filter((m) => m.status === 'ACTIVE')
                  .slice(0, 5)
                  .map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {member.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {member.role}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 dark:text-slate-500">
                        {member._count?.goals || 0} goals
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </PortalLayout>
  );
}
