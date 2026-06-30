import { redirect } from "next/navigation";
import { verifyMemberToken } from "@/lib/member-auth";
import { isAdminEmail } from "@/lib/auth";
import { OsFrame } from "./OsFrame";

export const metadata = { title: "Lab OS · AI.MED" };

/**
 * AcademiaOS — the lab operating system, mounted as a login-gated portal module.
 *
 * Access is gated here by the existing member/admin token (verifyMemberToken).
 * The app itself ships as a self-contained bundle under /public/os-app and is
 * rendered full-screen by <OsFrame>, which forwards the signed-in identity so the
 * embedded app auto-signs-in (no second login).
 */
export default async function LabOsPage() {
  const member = await verifyMemberToken();
  if (!member) redirect("/member/activate");
  const role = isAdminEmail(member.email) ? "admin" : "member";
  return <OsFrame email={member.email} role={role} />;
}
