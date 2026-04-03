import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"
import { ONBOARDING_MODULES } from "@/lib/onboarding-modules"

/**
 * GET /api/member/onboarding/[moduleId]
 * Returns module content, quiz questions (without answers), and member's progress.
 */
export async function GET(
  _request: NextRequest,
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

  // Strip correctIndex from quiz questions
  const questions = mod.quiz.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }))

  // Get member's progress for this module
  const progress = await prisma.onboardingProgress.findUnique({
    where: { memberId_moduleId: { memberId: auth.memberId, moduleId } },
  })

  return NextResponse.json({
    moduleId: mod.id,
    title: mod.title,
    description: mod.description,
    estimatedMinutes: mod.estimatedMinutes,
    content: mod.content,
    questions,
    progress: progress
      ? {
          score: progress.score,
          passed: progress.passed,
          attempts: progress.attempts,
          completedAt: progress.completedAt,
        }
      : null,
  })
}
