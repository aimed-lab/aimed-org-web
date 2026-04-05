'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Calendar,
  FolderKanban,
  Target,
  Trophy,
  ExternalLink,
  GraduationCap,
  ArrowRight,
  Camera,
  BookOpen,
  Code2,
  FileText,
  Link as LinkIcon,
  Wrench,
  TrendingUp,
  Zap,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Goal {
  id: number;
  quarter: string;
  title: string;
  description: string | null;
  url: string | null;
  status: string;
  notes: string | null;
}

interface ProjectTask {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  category: string | null;
  year: string | null;
  period: string | null;
}

interface Achievement {
  publications: number;
  software: number;
  patents: number;
}

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  joinDate: string;
  status: string;
  headshot: string | null;
  bio: string | null;
  orcidId: string | null;
  boxFolderUrl: string | null;
  notionPageUrl: string | null;
  githubUsername: string | null;
  goals: Goal[];
  projects: ProjectTask[];
}

// AGE Score helpers
function getAGEColor(score: number): string {
  if (score >= 7) return 'bg-green-500 text-white';
  if (score >= 4) return 'bg-yellow-400 text-yellow-900';
  return 'bg-red-500 text-white';
}

function getAGEBorderColor(score: number): string {
  if (score >= 7) return 'border-green-400';
  if (score >= 4) return 'border-yellow-300';
  return 'border-red-400';
}

function getAGELabel(type: 'A' | 'G' | 'E'): { full: string; icon: typeof TrendingUp } {
  switch (type) {
    case 'A': return { full: 'Achievement', icon: Trophy };
    case 'G': return { full: 'Growth', icon: TrendingUp };
    case 'E': return { full: 'Effort', icon: Zap };
  }
}

// Generate weeks for the current semester/quarter
function getQuarterWeeks(quarter: string): { weekNum: number; startDate: Date; label: string }[] {
  const [yearStr, qStr] = quarter.split('-Q');
  const year = parseInt(yearStr);
  const q = parseInt(qStr);
  const startMonth = (q - 1) * 3;
  const quarterStart = new Date(year, startMonth, 1);
  const quarterEnd = new Date(year, startMonth + 3, 0);

  const weeks: { weekNum: number; startDate: Date; label: string }[] = [];
  const current = new Date(quarterStart);
  // Align to Monday
  const day = current.getDay();
  if (day !== 1) {
    current.setDate(current.getDate() + ((8 - day) % 7));
  }

  let weekNum = 1;
  while (current <= quarterEnd && weekNum <= 14) {
    weeks.push({
      weekNum,
      startDate: new Date(current),
      label: `W${weekNum}`,
    });
    current.setDate(current.getDate() + 7);
    weekNum++;
  }
  return weeks;
}

function getCurrentWeekIndex(weeks: { startDate: Date }[]): number {
  const now = new Date();
  for (let i = weeks.length - 1; i >= 0; i--) {
    if (now >= weeks[i].startDate) return i;
  }
  return 0;
}

// Mock AGE scores - in production these would come from the API
interface AGEScore {
  week: number;
  achievement: number;
  growth: number;
  effort: number;
  notionUrl?: string;
}

function generateMockAGEScores(goalCount: number, weekCount: number): AGEScore[] {
  // Return empty if no goals
  if (goalCount === 0) return [];
  const scores: AGEScore[] = [];
  const now = new Date();
  for (let w = 1; w <= weekCount; w++) {
    // Only generate scores for past weeks (simulate)
    if (w <= Math.min(weekCount, 6)) {
      scores.push({
        week: w,
        achievement: Math.floor(Math.random() * 4) + 5,
        growth: Math.floor(Math.random() * 5) + 4,
        effort: Math.floor(Math.random() * 3) + 6,
      });
    }
  }
  return scores;
}

const statusColors: Record<string, string> = {
  IN_PROGRESS: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  DEFERRED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  TODO: 'bg-slate-100 text-slate-700 dark:bg-zinc-700 dark:text-slate-300',
  REVIEW: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  DONE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
};

export default function MemberDashboardPage() {
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [achievements, setAchievements] = useState<Achievement>({ publications: 0, software: 0, patents: 0 });
  const [onboarding, setOnboarding] = useState<{
    completedCount: number;
    totalCount: number;
    allComplete: boolean;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/profile').then(async (res) => res.ok ? res.json() : null),
      fetch('/api/member/onboarding').then(async (res) => res.ok ? res.json() : null),
      fetch('/api/member/achievements').then(async (res) => res.ok ? res.json() : null),
    ])
      .then(([profileData, onboardingData, achievementsData]) => {
        if (!profileData) {
          router.push('/member/activate');
          return;
        }
        setMember(profileData);
        if (onboardingData) setOnboarding(onboardingData);
        if (achievementsData) {
          setAchievements({
            publications: achievementsData.publications?.length || 0,
            software: achievementsData.software?.length || 0,
            patents: achievementsData.patents?.length || 0,
          });
        }
      })
      .catch(() => setError('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  async function handlePhotoUpload(file: File) {
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await fetch('/api/member/upload-photo', { method: 'POST', body: fd });
      if (res.ok) {
        const data = await res.json();
        setMember((prev) => prev ? { ...prev, headshot: data.headshot } : prev);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to upload photo');
      }
    } catch { alert('Upload failed'); }
    finally { setUploadingPhoto(false); }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-950">
        <p className="text-sm text-slate-500 dark:text-slate-400">Redirecting...</p>
      </div>
    );
  }

  const currentQuarter = `${new Date().getFullYear()}-Q${Math.floor(new Date().getMonth() / 3) + 1}`;
  const quarterGoals = member.goals?.filter((g) => g.quarter === currentQuarter) || [];
  const weeks = getQuarterWeeks(currentQuarter);
  const currentWeekIdx = getCurrentWeekIndex(weeks);
  const ageScores = generateMockAGEScores(quarterGoals.length, weeks.length);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (member as any)?.isAdmin ? "admin" as const : "member" as const;

  return (
    <PortalLayout role={portalRole} userName={member.name} userEmail={member.email}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start gap-5">
            <div className="relative group shrink-0">
              {member.headshot ? (
                <img
                  src={member.headshot}
                  alt={member.name}
                  className="h-16 w-16 rounded-full object-cover border-2 border-slate-200 dark:border-zinc-700"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                  <User className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
                </div>
              )}
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {uploadingPhoto ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
              </label>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Welcome, {member.name.split(' ')[0]}
              </h2>
              <p className="text-emerald-700 dark:text-emerald-400 font-medium">{member.role}</p>
              <div className="mt-1 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {new Date(member.joinDate).toLocaleDateString()}
                </span>
                <span className="font-medium text-emerald-700 dark:text-emerald-400">
                  {currentQuarter}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Onboarding Banner */}
        {onboarding && !onboarding.allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <GraduationCap className="h-5 w-5 text-amber-700 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                    Complete Your Onboarding
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {onboarding.completedCount} of {onboarding.totalCount} training modules completed
                  </p>
                </div>
              </div>
              <Link
                href="/member/onboarding"
                className="flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 transition-colors shrink-0"
              >
                Continue
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
              <div
                className="h-full rounded-full bg-amber-500 transition-all duration-500"
                style={{ width: `${onboarding.totalCount > 0 ? (onboarding.completedCount / onboarding.totalCount) * 100 : 0}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* AGE Scoring Grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-zinc-800">
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
                <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                AGE Performance Grid &mdash; {currentQuarter}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Achievement &middot; Growth &middot; Effort scores (1-9) per week
              </p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-medium">
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-green-500" /> 7-9</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-yellow-400" /> 4-6</span>
              <span className="flex items-center gap-1"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-red-500" /> 1-3</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-zinc-800">
                  <th className="sticky left-0 bg-white dark:bg-zinc-900 px-4 py-2.5 text-left font-semibold text-slate-600 dark:text-slate-400 min-w-[140px]">
                    Goal
                  </th>
                  <th className="px-2 py-2.5 text-center font-semibold text-slate-500 dark:text-slate-400 w-8">
                    AGE
                  </th>
                  {weeks.map((w, i) => (
                    <th
                      key={w.weekNum}
                      className={`px-1 py-2.5 text-center font-medium min-w-[36px] ${
                        i === currentWeekIdx
                          ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {w.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quarterGoals.length === 0 ? (
                  <tr>
                    <td colSpan={weeks.length + 2} className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
                      No goals assigned for {currentQuarter}. Your advisor will set goals.
                    </td>
                  </tr>
                ) : (
                  quarterGoals.map((goal, gi) => (
                    (['A', 'G', 'E'] as const).map((type, ti) => {
                      const ageInfo = getAGELabel(type);
                      const Icon = ageInfo.icon;
                      return (
                        <tr
                          key={`${goal.id}-${type}`}
                          className={`border-b border-slate-50 dark:border-zinc-800/50 ${
                            ti === 0 ? 'border-t border-slate-200 dark:border-zinc-700' : ''
                          }`}
                        >
                          {ti === 0 && (
                            <td
                              rowSpan={3}
                              className="sticky left-0 bg-white dark:bg-zinc-900 px-4 py-2 align-top"
                            >
                              <div className="flex items-start gap-1.5">
                                <span className="font-medium text-slate-900 dark:text-slate-100 leading-tight">
                                  {goal.title}
                                </span>
                                {goal.url && (
                                  <a
                                    href={goal.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 mt-0.5"
                                    title="Open in Notion"
                                  >
                                    <LinkIcon className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                              <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
                                statusColors[goal.status] || 'bg-slate-100 text-slate-600'
                              }`}>
                                {goal.status.replace(/_/g, ' ')}
                              </span>
                            </td>
                          )}
                          <td className="px-2 py-1.5 text-center">
                            <span className="inline-flex items-center gap-0.5 text-slate-500 dark:text-slate-400" title={ageInfo.full}>
                              <Icon className="h-3 w-3" />
                              <span className="font-semibold">{type}</span>
                            </span>
                          </td>
                          {weeks.map((w, wi) => {
                            const scoreData = ageScores.find((s) => s.week === w.weekNum);
                            const score = scoreData
                              ? type === 'A' ? scoreData.achievement
                                : type === 'G' ? scoreData.growth
                                : scoreData.effort
                              : null;

                            return (
                              <td
                                key={w.weekNum}
                                className={`px-0.5 py-1 text-center ${
                                  wi === currentWeekIdx ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''
                                }`}
                              >
                                {score !== null ? (
                                  <a
                                    href={scoreData?.notionUrl || goal.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-bold transition-transform hover:scale-110 border ${getAGEColor(score)} ${getAGEBorderColor(score)}`}
                                    title={`${ageInfo.full}: ${score}/9 - Click to view details`}
                                  >
                                    {score}
                                  </a>
                                ) : (
                                  <span className="inline-flex h-7 w-7 items-center justify-center text-slate-200 dark:text-zinc-700">
                                    &mdash;
                                  </span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ))
                )}
              </tbody>
            </table>
          </div>

          {quarterGoals.length > 0 && (
            <div className="border-t border-slate-100 px-5 py-3 dark:border-zinc-800">
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                Scores are hyperlinked to Notion pages. Colors: <span className="text-green-600 font-semibold">green</span> (7-9), <span className="text-yellow-600 font-semibold">yellow</span> (4-6), <span className="text-red-600 font-semibold">red</span> (1-3).
                Scored weekly by your advisor.
              </p>
            </div>
          )}
        </motion.div>

        {/* Milestones & Schedule row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Milestones */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Upcoming Milestones
            </h3>
            {!member.projects || member.projects.filter(p => p.dueDate && p.status !== 'DONE').length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No upcoming milestones.
              </p>
            ) : (
              <div className="space-y-3">
                {member.projects
                  .filter(p => p.dueDate && p.status !== 'DONE')
                  .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                  .slice(0, 5)
                  .map((project) => (
                    <div
                      key={project.id}
                      className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {project.title}
                        </p>
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                            statusColors[project.status] || 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {project.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Due: {new Date(project.dueDate!).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>

          {/* Goals Summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Goals ({currentQuarter})
            </h3>
            {quarterGoals.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No goals assigned yet.
              </p>
            ) : (
              <div className="space-y-3">
                {quarterGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-zinc-800 dark:bg-zinc-800/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                            {goal.title}
                          </p>
                          {goal.url && (
                            <a href={goal.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-emerald-600 hover:text-emerald-700 dark:text-emerald-400" title="Open in Notion">
                              <LinkIcon className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                        {goal.description && (
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {goal.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          statusColors[goal.status] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {goal.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <h3 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Quick Links
          </h3>
          <div className="flex flex-wrap gap-3">
            {member.boxFolderUrl && (
              <a href={member.boxFolderUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800">
                <ExternalLink className="h-4 w-4" /> Box Folder
              </a>
            )}
            {member.notionPageUrl && (
              <a href={member.notionPageUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800">
                <ExternalLink className="h-4 w-4" /> Notion
              </a>
            )}
            {member.githubUsername && (
              <a href={`https://github.com/${member.githubUsername}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800">
                <ExternalLink className="h-4 w-4" /> GitHub
              </a>
            )}
            <a href="https://aimed-lab.org" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800">
              <ExternalLink className="h-4 w-4" /> Lab Website
            </a>
          </div>
        </motion.div>
      </div>
    </PortalLayout>
  );
}
