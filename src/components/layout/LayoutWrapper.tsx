'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { ChatWidget } from '@/components/chatbot/ChatWidget';

/**
 * Conditionally renders the public site chrome (Header, Footer, ChatWidget)
 * based on the current route. Portal pages (member/*, admin/dashboard, admin/members,
 * admin/recruits) get a bare layout since they use PortalLayout internally.
 */
export function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isPortalRoute =
    pathname.startsWith('/member/dashboard') ||
    pathname.startsWith('/member/projects') ||
    pathname.startsWith('/member/planning') ||
    pathname.startsWith('/member/data') ||
    pathname.startsWith('/member/achievements') ||
    pathname.startsWith('/member/honors') ||
    pathname.startsWith('/member/profile') ||
    pathname.startsWith('/admin/dashboard') ||
    pathname.startsWith('/admin/members') ||
    pathname.startsWith('/admin/recruits') ||
    pathname.startsWith('/admin/content');

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
