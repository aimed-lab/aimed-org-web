import { Resend } from "resend"

const FROM_EMAIL = process.env.EMAIL_FROM || "AI.MED Lab <noreply@aimed-lab.org>"

/**
 * Send a 6-digit magic login code to the given email address.
 */
export async function sendMagicCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
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
      subject: "AI.MED Lab — Your Login Code",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-size: 24px; font-weight: 700; color: #1e293b; margin: 0;">AI.MED Lab</h1>
            <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Login Verification Code</p>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; text-align: center;">
            <p style="color: #475569; font-size: 14px; margin: 0 0 16px;">Your one-time login code is:</p>
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
