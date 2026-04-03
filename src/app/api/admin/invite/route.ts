import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyAdminToken, generateActivationCode } from "@/lib/auth"
import { sendInvitationEmail } from "@/lib/email"

/**
 * POST /api/admin/invite
 * Body: { emails: string[] }  — one or more emails to invite
 * Creates pending LabMember records and sends invitation emails.
 */
export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request)
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { emails } = body

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "At least one email is required" }, { status: 400 })
    }

    // Normalize and validate emails
    const cleanEmails = emails
      .map((e: string) => e.trim().toLowerCase())
      .filter((e: string) => e && e.includes("@"))

    if (cleanEmails.length === 0) {
      return NextResponse.json({ error: "No valid emails provided" }, { status: 400 })
    }

    const results: { email: string; status: "sent" | "exists" | "error"; error?: string }[] = []

    for (const email of cleanEmails) {
      try {
        // Check if member already exists
        const existing = await prisma.labMember.findUnique({ where: { email } })
        if (existing) {
          results.push({ email, status: "exists" })
          continue
        }

        // Create a pending member with just email (name will be filled on registration)
        const member = await prisma.labMember.create({
          data: {
            name: email.split("@")[0], // placeholder, they'll update on registration
            email,
            role: "Pending", // placeholder
            status: "INACTIVE", // not yet activated
          },
        })

        // Generate activation code
        const code = generateActivationCode()
        const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days for invitations
        await prisma.activationCode.create({
          data: {
            code,
            memberId: member.id,
            expiresAt,
            createdBy: admin,
          },
        })

        // Send invitation email
        const emailResult = await sendInvitationEmail(email, code)
        if (emailResult.success) {
          results.push({ email, status: "sent" })
        } else {
          results.push({ email, status: "error", error: emailResult.error })
        }
      } catch (err) {
        console.error(`Failed to invite ${email}:`, err)
        results.push({ email, status: "error", error: "Failed to process" })
      }
    }

    return NextResponse.json({
      results,
      sent: results.filter((r) => r.status === "sent").length,
      existing: results.filter((r) => r.status === "exists").length,
      errors: results.filter((r) => r.status === "error").length,
    })
  } catch (error) {
    console.error("Invite error:", error)
    return NextResponse.json({ error: "Failed to send invitations" }, { status: 500 })
  }
}
