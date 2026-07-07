import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaLibSql } from "@prisma/adapter-libsql"

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
})
const prisma = new PrismaClient({ adapter })

const EMAIL = "jakechen+regtest@gmail.com"

async function main() {
  const member = await prisma.labMember.findUnique({ where: { email: EMAIL } })
  if (!member) {
    console.log(JSON.stringify({ deleted: false, reason: "not found" }))
    return
  }
  const id = member.id
  // Delete all child rows first (FKs are enforced in Turso).
  await prisma.activationCode.deleteMany({ where: { memberId: id } })
  await prisma.onboardingProgress.deleteMany({ where: { memberId: id } })
  await prisma.quarterlyGoal.deleteMany({ where: { memberId: id } })
  await prisma.projectTask.deleteMany({ where: { memberId: id } })
  await prisma.memberPaper.deleteMany({ where: { memberId: id } })
  await prisma.memberDataset.deleteMany({ where: { memberId: id } })
  await prisma.memberTool.deleteMany({ where: { memberId: id } })
  await prisma.memberCompliance.deleteMany({ where: { memberId: id } })
  await prisma.memberWatch.deleteMany({ where: { memberId: id } })
  await prisma.contentSubmission.deleteMany({ where: { memberId: id } })
  await prisma.labMember.delete({ where: { id } })
  console.log(JSON.stringify({ deleted: true, memberId: id, email: EMAIL }))
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1) })
