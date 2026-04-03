import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"
import { ONBOARDING_MODULES, PASS_THRESHOLD } from "@/lib/onboarding-modules"

/**
 * POST /api/member/onboarding/[moduleId]/submit
 * Grades quiz answers and records the result.
 * Body: { answers: { "q-id": selectedIndex, ... } }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ moduleId: string }> }
) {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { moduleId } = await params
  const mod = ONBOARDING_MODULES.find((m) => m.id === moduleId)
  if (!mod) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 })
  }

  const body = await request.json()
  const answers: Record<string, number> = body.answers || {}

  // Grade each question
  const results = mod.quiz.map((q) => {
    const selected = answers[q.id]
    return {
      id: q.id,
      correct: selected === q.correctIndex,
      selectedIndex: selected ?? -1,
      correctIndex: q.correctIndex,
    }
  })

  const correctCount = results.filter((r) => r.correct).length
  const score = Math.round((correctCount / mod.quiz.length) * 100)
  const passed = score >= PASS_THRESHOLD

  // Get existing progress to increment attempts
  const existing = await prisma.onboardingProgress.findUnique({
    where: { memberId_moduleId: { memberId: auth.memberId, moduleId } },
  })

  const attempts = (existing?.attempts ?? 0) + 1

  // Upsert: always update with latest score (or keep best score)
  const bestScore = existing && existing.score > score ? existing.score : score
  const bestPassed = existing?.passed || passed

  await prisma.onboardingProgress.upsert({
    where: { memberId_moduleId: { memberId: auth.memberId, moduleId } },
    create: {
      memberId: auth.memberId,
      moduleId,
      score,
      passed,
      attempts: 1,
    },
    update: {
      score: bestScore,
      passed: bestPassed,
      attempts,
      completedAt: new Date(),
    },
  })

  return NextResponse.json({
    score,
    passed,
    threshold: PASS_THRESHOLD,
    correctCount,
    totalQuestions: mod.quiz.length,
    results,
  })
}
