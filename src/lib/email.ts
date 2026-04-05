import { Resend } from "resend"

const FROM_EMAIL = process.env.EMAIL_FROM || "AI.MED Lab <noreply@aimed-lab.org>"

/**
 * Send a 6-digit magic login code to the given email address.
 */
export async function sendVerificationCode(
  email: string,
  code: string,
  purpose: "login" | "signup" | "reset" = "login"
): Promise<{ success: boolean; error?: string }> {
  const titles = {
    login: { subject: "Your Login Code", heading: "Login Verification Code", action: "log in" },
    signup: { subject: "Confirm Your Email", heading: "Email Confirmation Code", action: "confirm your email" },
    reset: { subject: "Password Reset Code", heading: "Password Reset Code", action: "reset your password" },
  }
  const t = titles[purpose]
  return sendCodeEmail(email, code, t.subject, t.heading, t.action)
}

/** @deprecated Use sendVerificationCode instead */
export async function sendMagicCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  return sendVerificationCode(email, code, "login")
}

async function sendCodeEmail(
  email: string,
  code: string,
  subject: string,
  heading: string,
  action: string
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error("[EMAIL] RESEND_API_KEY is not set — cannot send email")
    return { success: false, error: "Email service not configured. Please contact the administrator." }
  }

  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `AI.MED Lab — ${subject}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">AI.MED Lab</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">${heading}</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">Your one-time code to ${action} is:</p>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #047857; font-family: 'SF Mono', Monaco, monospace; margin: 16px 0;">
              ${code}
            </div>
            <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0;">This code expires in 10 minutes. Do not share it with anyone.</p>
          </div>
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
            If you did not request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("[EMAIL] Resend API error:", error)
      return { success: false, error: error.message }
    }

    console.log(`[EMAIL] Sent magic code to ${email}, Resend ID: ${data?.id}`)
    return { success: true }
  } catch (err) {
    console.error("[EMAIL] Send failed:", err)
    return { success: false, error: "Failed to send email" }
  }
}

/**
 * Send an invitation email to join the AI.MED Lab portal.
 */
export async function sendInvitationEmail(email: string, activationCode: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://aimed-lab.org"

  if (!apiKey) {
    console.error("[EMAIL] RESEND_API_KEY is not set — cannot send invitation")
    return { success: false, error: "Email service not configured" }
  }

  try {
    const resend = new Resend(apiKey)
    const registerUrl = `${siteUrl}/member/register?email=${encodeURIComponent(email)}&code=${encodeURIComponent(activationCode)}`

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "You're invited to join the AI.MED Lab Portal",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">AI.MED Lab</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">You've been invited!</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px;">
            <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              You've been invited to join the <strong>AI.MED Lab</strong> member portal at the University of Alabama at Birmingham.
            </p>
            <p style="color: #475569; font-size: 14px; margin: 0 0 24px;">
              Click the button below to complete your registration. You'll be asked to fill in your name and other details.
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <a href="${registerUrl}" style="display: inline-block; background: #047857; color: #fff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
                Join AI.MED Lab Portal
              </a>
            </div>
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 20px 0 0;">
              Or use activation code: <strong style="font-family: monospace; color: #047857;">${activationCode}</strong><br/>
              This invitation expires in 14 days.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 24px;">
            If you didn't expect this invitation, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("[EMAIL] Invitation send error:", error)
      return { success: false, error: error.message }
    }

    console.log(`[EMAIL] Sent invitation to ${email}, Resend ID: ${data?.id}`)
    return { success: true }
  } catch (err) {
    console.error("[EMAIL] Invitation send failed:", err)
    return { success: false, error: "Failed to send invitation" }
  }
}
