import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  const patents = await prisma.patent.findMany({
    orderBy: { year: "desc" },
  })
  return NextResponse.json({ patents, total: patents.length })
}
