import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyMemberToken } from "@/lib/member-auth"
import { ONBOARDING_MODULES } from "@/lib/onboarding-modules"

/**
 * GET /api/member/onboarding
 * Returns onboarding progress summary for the authenticated member.
 */
export async function GET() {
  const auth = await verifyMemberToken()
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const progress = await prisma.onboardingProgress.findMany({
      where: { memberId: auth.memberId },
    })

    const progressMap = new Map(progress.map((p) => [p.moduleId, p]))

    const modules = ONBOARDING_MODULES.map((m) => {
      const p = progressMap.get(m.id)
      return {
        moduleId: m.id,
        title: m.title,
        description: m.description,
        icon: m.icon,
        estimatedMinutes: m.estimatedMinutes,
        questionCount: m.quiz.length,
        passed: p?.passed ?? false,
        score: p?.score ?? null,
        attempts: p?.attempts ?? 0,
        completedAt: p?.completedAt ?? null,
      }
    })

    const allComplete = modules.every((m) => m.passed)
    const completedCount = modules.filter((m) => m.passed).length

    return NextResponse.json({ modules, allComplete, completedCount, totalCount: modules.length })
  } catch (error) {
    console.error("Failed to fetch onboarding progress:", error)
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
  }
}
