import { PrismaClient } from "@/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { resolve, join } from "path"
import { existsSync } from "fs"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function findDbPath(): string {
  // Only use aimed-v2.db — this is rebuilt from TSV data on every deploy
  const candidates = [
    resolve(process.cwd(), "aimed-v2.db"),
    join(__dirname, "..", "..", "aimed-v2.db"),
    join(__dirname, "..", "..", "..", "aimed-v2.db"),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      return p
    }
  }
  return resolve(process.cwd(), "aimed-v2.db")
}

// Export for diagnostics
export function getDbDiagnostics() {
  return {
    cwd: process.cwd(),
    dirname: __dirname,
    activePath: findDbPath(),
  }
}

function createPrismaClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // Use Turso (remote libSQL) if configured, otherwise local SQLite
  if (tursoUrl) {
    const adapter = new PrismaLibSql({
      url: tursoUrl,
      authToken: tursoToken,
    })
    return new PrismaClient({ adapter })
  }

  const dbPath = findDbPath()
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
