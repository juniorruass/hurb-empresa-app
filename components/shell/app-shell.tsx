"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./top-nav";
import { MobileNav } from "./mobile-nav";
import type { NavItem } from "./nav-items";

export function AppShell({
  clientName,
  navItems,
  children,
}: {
  clientName?: string;
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/login";

  if (isPublicRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <TopNav clientName={clientName} navItems={navItems} />
      <MobileNav clientName={clientName} navItems={navItems} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-6 pb-24 lg:px-6 lg:pb-12 lg:pt-10">{children}</main>
    </>
  );
}
