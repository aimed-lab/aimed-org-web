'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  ShieldAlert,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface QuizResult {
  id: string;
  correct: boolean;
  selectedIndex: number;
  correctIndex: number;
}

interface ModuleData {
  moduleId: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  content: string;
  questions: Question[];
  progress: {
    score: number;
    passed: boolean;
    attempts: number;
    completedAt: string;
  } | null;
}

interface SubmitResponse {
  score: number;
  passed: boolean;
  threshold: number;
  correctCount: number;
  totalQuestions: number;
  results: QuizResult[];
}

export default function OnboardingModulePage() {
  const router = useRouter();
  const params = useParams();
  const moduleId = params.moduleId as string;

  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberInfo, setMemberInfo] = useState<{ name: string; email: string; isAdmin?: boolean } | null>(null);

  // Quiz state
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResponse | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/member/me').then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/member/onboarding/${moduleId}`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([me, data]) => {
        if (!me) {
          setError('Not authenticated');
          return;
        }
        setMemberInfo(me);
        if (data) {
          setModuleData(data);
        } else {
          setError('Module not found');
        }
      })
      .catch(() => setError('Failed to load module'))
      .finally(() => setLoading(false));
  }, [moduleId]);

  function handleSelectAnswer(questionId: string, optionIndex: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  async function handleSubmitQuiz() {
    if (!moduleData) return;
    const unanswered = moduleData.questions.filter((q) => answers[q.id] === undefined);
    if (unanswered.length > 0) {
      alert(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/member/onboarding/${moduleId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        const data: SubmitResponse = await res.json();
        setResult(data);
      } else {
        alert('Failed to submit quiz');
      }
    } catch {
      alert('Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setResult(null);
    setAnswers({});
    setShowQuiz(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-700 border-t-transparent" />
      </div>
    );
  }

  if (error || !memberInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6">
        <ShieldAlert className="h-12 w-12 text-red-500" />
        <p className="text-red-600 dark:text-red-400">{error || 'Authentication required.'}</p>
        <button
          onClick={() => router.push('/member/activate')}
          className="rounded-lg bg-emerald-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Go to Activation
        </button>
      </div>
    );
  }

  if (!moduleData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-slate-500">Module not found</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const portalRole = (memberInfo as any)?.isAdmin ? "admin" as const : "member" as const;
  const allAnswered = moduleData.questions.every((q) => answers[q.id] !== undefined);

  return (
    <PortalLayout role={portalRole} userName={memberInfo.name} userEmail={memberInfo.email}>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.push('/member/onboarding')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Onboarding
        </button>

        {/* Module header */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {moduleData.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {moduleData.description}
          </p>
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {moduleData.estimatedMinutes} min read
            </span>
            <span className="flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              {moduleData.questions.length} quiz questions
            </span>
            {moduleData.progress && (
              <span className={`font-medium ${
                moduleData.progress.passed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                {moduleData.progress.passed ? 'Passed' : 'Not yet passed'} ({moduleData.progress.score}%)
              </span>
            )}
          </div>
        </div>

        {/* Reading Material */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div
            className="prose prose-slate dark:prose-invert prose-sm max-w-none
              prose-h2:text-lg prose-h2:font-bold prose-h2:mt-6 prose-h2:mb-3
              prose-h3:text-base prose-h3:font-semibold prose-h3:mt-5 prose-h3:mb-2
              prose-p:text-sm prose-p:leading-relaxed
              prose-li:text-sm prose-li:leading-relaxed
              prose-ul:my-2 prose-li:my-0.5
              prose-code:text-xs prose-code:bg-slate-100 prose-code:dark:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-strong:text-slate-900 prose-strong:dark:text-slate-100"
            dangerouslySetInnerHTML={{ __html: moduleData.content }}
          />
        </motion.div>

        {/* Take Quiz Button */}
        {!showQuiz && !result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <button
              onClick={() => setShowQuiz(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-800 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              Take the Quiz
            </button>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              You need 80% or higher to pass
            </p>
          </motion.div>
        )}

        {/* Quiz Section */}
        {(showQuiz || result) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Quiz</h2>
              {result && (
                <div className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${
                  result.passed
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                }`}>
                  {result.passed ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {result.score}% — {result.passed ? 'Passed!' : 'Not Passed'}
                </div>
              )}
            </div>

            {moduleData.questions.map((q, qi) => {
              const qResult = result?.results.find((r) => r.id === q.id);
              return (
                <div
                  key={q.id}
                  className={`rounded-xl border p-5 shadow-sm ${
                    qResult
                      ? qResult.correct
                        ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20'
                        : 'border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20'
                      : 'border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <p className="mb-3 font-medium text-slate-900 dark:text-slate-100">
                    <span className="mr-2 text-slate-400">{qi + 1}.</span>
                    {q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isSelected = answers[q.id] === oi;
                      const isCorrectAnswer = qResult && qResult.correctIndex === oi;
                      const isWrongSelected = qResult && isSelected && !qResult.correct;

                      let optionStyle = 'border-slate-200 bg-white hover:border-emerald-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-emerald-700';
                      if (isSelected && !result) {
                        optionStyle = 'border-emerald-500 bg-emerald-50 dark:border-emerald-600 dark:bg-emerald-950/30';
                      } else if (result) {
                        if (isCorrectAnswer) {
                          optionStyle = 'border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/30';
                        } else if (isWrongSelected) {
                          optionStyle = 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/30';
                        } else {
                          optionStyle = 'border-slate-100 bg-slate-50/50 dark:border-zinc-800 dark:bg-zinc-900 opacity-60';
                        }
                      }

                      return (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${optionStyle} ${
                            result ? 'cursor-default' : ''
                          }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={isSelected}
                            onChange={() => !result && handleSelectAnswer(q.id, oi)}
                            disabled={!!result}
                            className="sr-only"
                          />
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                            isSelected && !result
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : result && isCorrectAnswer
                              ? 'border-green-500 bg-green-500 text-white'
                              : result && isWrongSelected
                              ? 'border-red-500 bg-red-500 text-white'
                              : 'border-slate-300 dark:border-zinc-600'
                          }`}>
                            {String.fromCharCode(65 + oi)}
                          </span>
                          <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                          {result && isCorrectAnswer && (
                            <CheckCircle className="ml-auto h-4 w-4 text-green-500" />
                          )}
                          {result && isWrongSelected && (
                            <XCircle className="ml-auto h-4 w-4 text-red-500" />
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Submit / Retake Buttons */}
            <div className="flex justify-center gap-3 pt-2">
              {!result && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered || submitting}
                  className="rounded-xl bg-emerald-700 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Grading...' : 'Submit Answers'}
                </button>
              )}
              {result && !result.passed && (
                <button
                  onClick={handleRetake}
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-amber-700 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </button>
              )}
              {result && result.passed && (
                <button
                  onClick={() => router.push('/member/onboarding')}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Continue to Next Module
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </PortalLayout>
  );
}
