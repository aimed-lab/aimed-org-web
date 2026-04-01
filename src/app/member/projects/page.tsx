'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  ChevronRight,
  Trash2,
  ShieldAlert,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface ProjectTask {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MemberInfo {
  name: string;
  email: string;
}

const STATUSES = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'] as const;
const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  DONE: 'Done',
};
const STATUS_COLORS: Record<string, string> = {
  TODO: 'border-t-slate-400',
  IN_PROGRESS: 'border-t-blue-500',
  REVIEW: 'border-t-purple-500',
  DONE: 'border-t-green-500',
};
const PRIORITY_COLORS: Record<string, string> = {
  HIGH: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  MEDIUM: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  LOW: 'bg-slate-100 text-slate-600 dark:bg-zinc-700 dark:text-slate-400',
};
const CATEGORIES = ['Research', 'Writing', 'Code', 'Admin', 'Experiment', 'Reading', 'Other'];

export default function ProjectsPage() {
  const router = useRouter();
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [projects, setProjects] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch('/api/member/projects').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([m, p]) => {
        if (!m) {
          setError('Not authenticated');
          return;
        }
        setMember(m);
        setProjects(p || []);
      })
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/member/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          category: category || null,
          dueDate: dueDate || null,
        }),
      });
      if (res.ok) {
        const project = await res.json();
        setProjects((prev) => [project, ...prev]);
        setTitle('');
        setDescription('');
        setPriority('MEDIUM');
        setCategory('');
        setDueDate('');
        setShowAdd(false);
      }
    } catch {
      // ignore
    }
    setSubmitting(false);
  }

  async function moveStatus(id: number, newStatus: string) {
    try {
      const res = await fetch(`/api/member/projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      }
    } catch {
      // ignore
    }
  }

  async function deleteProject(id: number) {
    if (!confirm('Delete this task?')) return;
    try {
      const res = await fetch(`/api/member/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">Authentication required.</p>
        <button
          onClick={() => router.push('/member/activate')}
          className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Go to Activation
        </button>
      </div>
    );
  }

  return (
    <PortalLayout role="member" userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Projects</h2>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <Plus className="h-4 w-4" />
            Add Task
          </button>
        </div>

        {/* Add Task Modal */}
        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
              onClick={() => setShowAdd(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    New Task
                  </h3>
                  <button
                    onClick={() => setShowAdd(false)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Task title"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Priority
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                      >
                        <option value="">None</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-slate-100"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting || !title.trim()}
                    className="w-full rounded-lg bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                  >
                    {submitting ? 'Creating...' : 'Create Task'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Kanban Board */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status) => {
            const columnTasks = projects.filter((p) => p.status === status);
            return (
              <div key={status} className="flex flex-col">
                <div className={`mb-3 rounded-t-lg border-t-4 ${STATUS_COLORS[status]} bg-white p-3 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {STATUS_LABELS[status]}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-zinc-800 dark:text-slate-400">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
                <div className="space-y-3 min-h-[100px]">
                  {columnTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}>
                          {task.priority}
                        </span>
                        {task.category && (
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                            {task.category}
                          </span>
                        )}
                      </div>
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mb-2">
                          <Clock className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      {/* Status change buttons */}
                      <div className="flex items-center gap-1 border-t border-slate-100 pt-2 dark:border-zinc-800">
                        {STATUSES.filter((s) => s !== status).map((s) => (
                          <button
                            key={s}
                            onClick={() => moveStatus(task.id, s)}
                            className="flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
                          >
                            <ChevronRight className="h-3 w-3" />
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                        <button
                          onClick={() => deleteProject(task.id)}
                          className="ml-auto rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PortalLayout>
  );
}
