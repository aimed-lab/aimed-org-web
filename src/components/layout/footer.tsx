import Link from "next/link"

const quickLinks = [
  { label: "Research", href: "/research" },
  { label: "Publications", href: "/publications" },
  { label: "Software", href: "/software" },
  { label: "News", href: "/news" },
  { label: "Join", href: "/join" },
]

const profileLinks = [
  { label: "Google Scholar", href: "https://scholar.google.com/citations?user=_x7KRJAAAAAJ" },
  { label: "ORCID", href: "https://orcid.org/0000-0001-8829-7504" },
  { label: "GitHub", href: "https://github.com/aimed-lab" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/jakeychen/" },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer row */}
        <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-3">
          {/* Left: Lab name & copyright */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              AI.MED Lab &middot; UAB
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              &copy; 2024&ndash;{currentYear} AI.MED Lab. All rights reserved.
            </p>
          </div>

          {/* Center: Quick nav */}
          <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Profile links */}
          <div className="flex flex-wrap items-start justify-end gap-x-5 gap-y-2">
            {profileLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-200 dark:border-zinc-800 py-4 text-xs text-slate-400 dark:text-slate-500">
          <Link
            href="/admin"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Admin Login
          </Link>
          <a
            href="/rss.xml"
            className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            RSS
          </a>
          <span>Privacy: This site does not track you.</span>
        </div>
      </div>
    </footer>
  )
}
