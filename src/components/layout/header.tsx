"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Search, Sun, Moon, Menu, X, ExternalLink, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Talks", href: "/talks" },
  { label: "Honors", href: "/honors" },
  { label: "Training", href: "/training" },
  { label: "Software", href: "/software" },
  { label: "Service", href: "/service" },
  { label: "News", href: "/news" },
  { label: "Join", href: "/join" },
]

const externalLinks = [
  { label: "Google Scholar", href: "https://scholar.google.com/citations?user=VM9ziaEAAAAJ" },
  { label: "ORCID", href: "https://orcid.org/0000-0001-8829-7504" },
  { label: "GitHub", href: "https://github.com/aimed-lab" },
  { label: "LinkedIn", href: "https://linkedin.com/" },
  { label: "NIH Biosketch (PDF)", href: "https://www.ncbi.nlm.nih.gov/labs/sciencv/1863846/" },
]

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [extOpen, setExtOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu on route change / resize
  useEffect(() => {
    const close = () => setMobileOpen(false)
    window.addEventListener("resize", close)
    return () => window.removeEventListener("resize", close)
  }, [])

  // Close external dropdown when clicking outside
  useEffect(() => {
    if (!extOpen) return
    const close = () => setExtOpen(false)
    document.addEventListener("click", close)
    return () => document.removeEventListener("click", close)
  }, [extOpen])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity"
        >
          <img src="/logos/aimed-logo.svg" alt="AI.MED" className="h-8" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Search */}
          <button
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Theme toggle */}
          <button
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {mounted ? (
              resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4 opacity-0" />
            )}
          </button>

          {/* External links dropdown */}
          <div className="relative hidden lg:block">
            <button
              aria-label="External links"
              onClick={(e) => {
                e.stopPropagation()
                setExtOpen(!extOpen)
              }}
              className={cn(
                "inline-flex h-9 items-center gap-1 rounded-md px-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors",
                extOpen && "bg-slate-100 dark:bg-zinc-800"
              )}
            >
              <ExternalLink className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </button>

            {extOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg py-1 z-50">
                {externalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {link.label}
                    <ExternalLink className="ml-auto h-3 w-3 opacity-40" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-out menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden transition-all duration-300 ease-in-out border-t border-slate-200 dark:border-zinc-800",
          mobileOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0 border-t-0"
        )}
      >
        <nav className="flex flex-col px-4 py-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 mt-2">
            <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              External
            </p>
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
              >
                {link.label}
                <ExternalLink className="ml-auto h-3 w-3 opacity-40" />
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
