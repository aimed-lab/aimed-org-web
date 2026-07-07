import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

// Seeds a single, hidden test invitee + activation code so the full
// /member/register happy-path (email verify -> set password -> onboarding)
// can be walked end-to-end. Idempotent: re-running resets the same member.
const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

const EMAIL = "jakechen+regtest@gmail.com"
const CODE = "REGTEST" + Math.floor(1000 + Math.random() * 9000)

async function main() {
  let member = await prisma.labMember.findUnique({ where: { email: EMAIL } })
  if (member) {
    member = await prisma.labMember.update({
      where: { id: member.id },
      data: { name: "Reg Test (DELETE ME)", role: "Pending", status: "INACTIVE", accessRole: "INTERN", passwordHash: null, emailVerified: false },
    })
  } else {
    member = await prisma.labMember.create({
      data: { name: "Reg Test (DELETE ME)", email: EMAIL, role: "Pending", status: "INACTIVE", accessRole: "INTERN", emailVerified: false },
    })
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.activationCode.upsert({
    where: { memberId: member.id },
    update: { code: CODE, used: false, usedAt: null, expiresAt, createdBy: "jakechen@gmail.com" },
    create: { code: CODE, memberId: member.id, expiresAt, createdBy: "jakechen@gmail.com" },
  })

  console.log(JSON.stringify({
    memberId: member.id,
    email: EMAIL,
    code: CODE,
    url: `https://aimed-lab.org/member/register?email=${encodeURIComponent(EMAIL)}&code=${CODE}`,
  }, null, 2))
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
