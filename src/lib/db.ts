import { PrismaClient } from "@/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"
import { resolve, join } from "path"
import { existsSync } from "fs"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function findDbPath(): string {
  // Try multiple candidate paths for the SQLite database
  const candidates = [
    resolve(process.cwd(), "dev.db"),
    join(__dirname, "..", "..", "dev.db"),
    join(__dirname, "..", "..", "..", "dev.db"),
    join(__dirname, "..", "..", "..", "..", "dev.db"),
    "/var/task/dev.db",
    "/var/task/user/dev.db",
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      console.log(`[db] Using database at: ${p}`)
      return p
    }
  }
  console.log(`[db] No database found, tried: ${candidates.join(", ")}. Falling back to cwd.`)
  // Fallback to cwd-based path
  return resolve(process.cwd(), "dev.db")
}

// Export for diagnostics
export function getDbDiagnostics() {
  const candidates = [
    resolve(process.cwd(), "dev.db"),
    join(__dirname, "..", "..", "dev.db"),
    join(__dirname, "..", "..", "..", "dev.db"),
    join(__dirname, "..", "..", "..", "..", "dev.db"),
    "/var/task/dev.db",
    "/var/task/user/dev.db",
  ]
  return {
    cwd: process.cwd(),
    dirname: __dirname,
    candidates: candidates.map(p => ({ path: p, exists: existsSync(p) })),
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
