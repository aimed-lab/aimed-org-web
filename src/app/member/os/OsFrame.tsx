"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/**
 * Full-screen host for the embedded AcademiaOS bundle (/public/os-app).
 * The signed-in identity is forwarded as query params so the app auto-signs-in;
 * the host portal has already gated access.
 */
export function OsFrame({ email, role }: { email: string; role: string }) {
  const src = `/os-app/index.html?user=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`;
  return (
    <div className="fixed inset-0 z-[60] bg-black">
      <iframe
        src={src}
        title="AcademiaOS — Lab OS"
        className="h-full w-full border-0"
        allow="clipboard-write"
      />
      <Link
        href="/member/dashboard"
        className="fixed left-3 top-3 z-[61] inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/90"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        AI.MED Portal
      </Link>
    </div>
  );
}
