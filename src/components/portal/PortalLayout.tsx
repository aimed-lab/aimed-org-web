'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Database,
  Wrench,
  Shield,
  ShieldCheck,
  Radar,
  Trophy,
  UserCircle,
  Users,
  UserPlus,
  FileCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ArrowLeftRight,
} from 'lucide-react';

export type PortalRole = 'member' | 'admin';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const memberNav: NavItem[] = [
  { label: 'Dashboard', href: '/member/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/member/projects', icon: FolderKanban },
  { label: 'Papers', href: '/member/papers', icon: FileText },
  { label: 'Datasets', href: '/member/datasets', icon: Database },
  { label: 'Tools', href: '/member/tools', icon: Wrench },
  { label: 'Ethics & Legal', href: '/member/compliance', icon: Shield },
  { label: 'Intelligence', href: '/member/intelligence', icon: Radar },
  { label: 'Achievements', href: '/member/achievements', icon: Trophy },
  { label: 'Profile', href: '/member/profile', icon: UserCircle },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: ShieldCheck },
  { label: 'Members', href: '/admin/members', icon: Users },
  { label: 'Recruits', href: '/admin/recruits', icon: UserPlus },
  { label: 'Content Review', href: '/admin/content', icon: FileCheck },
];

interface PortalLayoutProps {
  children: ReactNode;
  role: PortalRole;
  userName?: string;
  userEmail?: string;
}

export function PortalLayout({ children, role, userName, userEmail }: PortalLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'admin' | 'member'>(role === 'admin' ? 'admin' : 'member');

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navItems = role === 'admin'
    ? viewMode === 'admin'
      ? [...adminNav, { label: 'divider', href: '', icon: LayoutDashboard }, ...memberNav]
      : memberNav
    : memberNav;

  function handleLogout() {
    if (role === 'admin') {
      document.cookie = 'admin_token=; path=/; max-age=0';
      router.push('/admin');
    } else {
      document.cookie = 'member_token=; path=/; max-age=0';
      router.push('/member/activate');
    }
  }

  function isActive(href: string) {
    return pathname === href;
  }

  const sidebarWidth = sidebarOpen ? 'w-60' : 'w-14';

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-zinc-950">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — desktop */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 transition-all duration-200 ${sidebarWidth} shrink-0`}
      >
        <SidebarContent
          navItems={navItems}
          isActive={isActive}
          sidebarOpen={sidebarOpen}
          role={role}
          viewMode={viewMode}
          onNavigate={(href) => router.push(href)}
        />
      </aside>

      {/* Sidebar — mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-slate-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-900 lg:hidden"
          >
            <div className="flex items-center justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent
              navItems={navItems}
              isActive={isActive}
              sidebarOpen={true}
              role={role}
              viewMode={viewMode}
              onNavigate={(href) => router.push(href)}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-zinc-800 dark:bg-zinc-900 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setMobileOpen(!mobileOpen);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-zinc-800"
            >
              {sidebarOpen ? <ChevronLeft className="h-5 w-5 hidden lg:block" /> : <Menu className="h-5 w-5 hidden lg:block" />}
              <Menu className="h-5 w-5 lg:hidden" />
            </button>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              AI.MED Portal
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {/* Role Switcher — admin only */}
            {role === 'admin' && (
              <button
                onClick={() => setViewMode(viewMode === 'admin' ? 'member' : 'admin')}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-400 dark:hover:bg-zinc-800"
                title={viewMode === 'admin' ? 'Switch to Member View' : 'Switch to Admin View'}
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
                {viewMode === 'admin' ? 'Member View' : 'Admin View'}
              </button>
            )}
            {(userName || userEmail) && (
              <span className="hidden sm:inline text-sm text-slate-600 dark:text-slate-400">
                {userName || userEmail}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-zinc-700 dark:text-slate-300 dark:hover:bg-zinc-800"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Sidebar content ────────────────────────────────────────────── */

function SidebarContent({
  navItems,
  isActive,
  sidebarOpen,
  role,
  viewMode,
  onNavigate,
}: {
  navItems: NavItem[];
  isActive: (href: string) => boolean;
  sidebarOpen: boolean;
  role: PortalRole;
  viewMode: 'admin' | 'member';
  onNavigate: (href: string) => void;
}) {
  const portalLabel = role === 'admin'
    ? viewMode === 'admin' ? 'Admin Portal' : 'Member View'
    : 'Member Portal';
  const shortLabel = role === 'admin'
    ? viewMode === 'admin' ? 'A' : 'M'
    : 'M';

  return (
    <div className="flex flex-1 flex-col">
      {/* Logo area */}
      <div className={`flex items-center border-b border-slate-200 dark:border-zinc-800 h-14 px-4 shrink-0`}>
        {sidebarOpen ? (
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 truncate">
            {portalLabel}
          </span>
        ) : (
          <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 mx-auto">
            {shortLabel}
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {navItems.map((item, idx) => {
          if (item.label === 'divider') {
            return (
              <div key={`divider-${idx}`} className="my-2 border-t border-slate-200 dark:border-zinc-800" />
            );
          }

          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              title={!sidebarOpen ? item.label : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-zinc-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
