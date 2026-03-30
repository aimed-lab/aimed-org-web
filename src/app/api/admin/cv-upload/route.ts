import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

async function isAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.has("admin_token")
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("cv") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and DOCX files are accepted" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "uploads", "cv")
    await mkdir(uploadDir, { recursive: true })

    const timestamp = Date.now()
    const ext = file.name.split(".").pop()
    const filename = `cv_${timestamp}.${ext}`
    const filepath = path.join(uploadDir, filename)

    await writeFile(filepath, buffer)

    return NextResponse.json({
      success: true,
      filename,
      message: "CV uploaded successfully. Parse and review in the admin dashboard.",
    })
  } catch (error) {
    console.error("CV upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload CV" },
      { status: 500 }
    )
  }
}
