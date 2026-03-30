import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const software = await prisma.softwareResource.findMany({
    orderBy: { id: "desc" },
  })
  return NextResponse.json({ software, total: software.length })
}
