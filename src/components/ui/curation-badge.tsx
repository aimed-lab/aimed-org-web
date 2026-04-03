"use client"

import { Sparkles, RefreshCw } from "lucide-react"

interface CurationBadgeProps {
  type: "new" | "updated"
  className?: string
}

/**
 * Small badge to indicate newly curated or updated content on public pages.
 */
export function CurationBadge({ type, className = "" }: CurationBadgeProps) {
  if (type === "new") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 ${className}`}
      >
        <Sparkles className="h-3 w-3" />
        New
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 ${className}`}
    >
      <RefreshCw className="h-3 w-3" />
      Updated
    </span>
  )
}
