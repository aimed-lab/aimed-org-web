import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Simple admin auth — in production, replace with proper auth (Auth.js / Clerk)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@aimed-lab.org"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme123"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = Buffer.from(`${email}:${Date.now()}`).toString("base64")

      const cookieStore = await cookies()
      cookieStore.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete("admin_token")
  return NextResponse.json({ success: true })
}
