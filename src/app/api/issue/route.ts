import { NextRequest, NextResponse } from "next/server"
import { verifyMemberToken } from "@/lib/member-auth"
import { sendAdminNotification } from "@/lib/email"

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || ""
const GITHUB_REPO = process.env.GITHUB_REPO || "aimed-lab/aimed-org-web"

function esc(s: string) {
  return String(s).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string))
}

// POST /api/issue — file a feature request / bug as a GitHub issue (from the AI wizard
// /issue command). Body: { text, image? (data URL) }. Emails all admins with the
// screenshot attached. Requires GITHUB_TOKEN to open the issue; without it, the
// request is still emailed to admins so nothing is lost.
export async function POST(request: NextRequest) {
  let body: { text?: string; image?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const text = (body.text || "").trim()
  if (text.length < 5) {
    return NextResponse.json({ error: "Please describe the issue (a few words at least)." }, { status: 400 })
  }

  // Attribute to the signed-in member if there is one (optional).
  const auth = await verifyMemberToken().catch(() => null)
  const submitter = auth ? auth.email : "anonymous (public wizard)"

  const firstLine = text.split("\n")[0].slice(0, 80)
  const title = `[Wizard] ${firstLine}${firstLine.length < text.split("\n")[0].length ? "…" : ""}`

  // Optional screenshot -> Resend attachment (base64, no data: prefix).
  let attachment: { filename: string; content: string }[] | undefined
  const m = (body.image || "").match(/^data:(image\/\w+);base64,(.+)$/)
  if (m) {
    const ext = m[1].split("/")[1] || "png"
    attachment = [{ filename: `screenshot.${ext}`, content: m[2] }]
  }

  const issueBody =
    `${text}\n\n---\n` +
    `_Filed via the AI.MED site wizard by **${submitter}**._` +
    (attachment ? `\n\n🖼️ A screenshot was attached and emailed to the lab admins.` : "")

  let issueUrl: string | null = null
  let issueNumber: number | null = null

  if (GITHUB_TOKEN) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, body: issueBody }),
      })
      if (res.ok) {
        const data = await res.json()
        issueUrl = data.html_url
        issueNumber = data.number
      } else {
        console.error("GitHub issue create failed:", res.status, await res.text())
      }
    } catch (e) {
      console.error("GitHub issue error:", e)
    }
  }

  // Notify admins (with the screenshot). Best-effort.
  try {
    await sendAdminNotification(
      issueNumber ? `New issue #${issueNumber} filed via wizard` : `New issue filed via wizard`,
      `<p><strong>From:</strong> ${esc(submitter)}</p>
       <p><strong>Title:</strong> ${esc(title)}</p>
       <p><strong>Details:</strong></p><p>${esc(text)}</p>` +
        (issueUrl ? `<p style="margin-top:16px"><a href="${issueUrl}">View issue #${issueNumber} on GitHub →</a></p>` : `<p style="margin-top:16px;color:#b45309">GitHub is not configured (GITHUB_TOKEN) — this request was captured by email only.</p>`),
      attachment
    )
  } catch (e) {
    console.error("Admin notification (issue) failed:", e)
  }

  if (issueUrl) {
    return NextResponse.json({ ok: true, url: issueUrl, number: issueNumber })
  }
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ ok: true, url: null, note: "Sent to the lab admins (issue tracker not yet configured)." })
  }
  return NextResponse.json({ error: "Could not create the GitHub issue. It was emailed to admins instead." }, { status: 502 })
}
