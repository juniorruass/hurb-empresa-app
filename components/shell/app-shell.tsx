"use client";

import { usePathname } from "next/navigation";
import { TopNav } from "./top-nav";

export function AppShell({
  clientName,
  children,
}: {
  clientName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPublicRoute = pathname === "/login";

  if (isPublicRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <TopNav clientName={clientName} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 lg:px-6">{children}</main>
    </>
  );
}
