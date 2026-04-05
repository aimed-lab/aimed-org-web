'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChatWidget } from '@/components/chatbot/ChatWidget';

/**
 * Conditionally renders the public site chrome (Header, Footer, ChatWidget)
 * based on the current route. Portal pages get a bare layout since they use
 * PortalLayout internally.
 *
 * Public chrome is HIDDEN for:
 *   /member/* (except /member/activate which is a standalone page)
 *   /admin/*  (except /admin which is the login page)
 */
export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isPortalRoute =
    // All member sub-pages (dashboard, projects, papers, datasets, tools, etc.)
    // but NOT /member/activate (standalone login page)
    (pathname.startsWith('/member/') && pathname !== '/member/activate') ||
    // All admin sub-pages (dashboard, members, recruits, content, etc.)
    // but NOT /admin itself (login page)
    (pathname.startsWith('/admin/'));

  if (isPortalRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
