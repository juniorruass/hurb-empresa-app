"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";
import type { NavItem } from "./nav-items";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

export function TopNav({ clientName, navItems }: { clientName?: string; navItems: NavItem[] }) {
  const pathname = usePathname();
  const agenteItem = navItems.find((n) => n.key === "agente");
  const items = navItems.filter((n) => n.key !== "agente");

  return (
    <nav
      className={cn(
        "sticky top-4 z-30 mx-4 hidden items-center gap-5 rounded-full border pr-2 pl-5 py-2 lg:mx-auto lg:flex lg:w-fit lg:max-w-[calc(100%-2rem)]",
        "border-primary/25 bg-linear-to-b from-card/95 to-background/95 backdrop-blur",
        "shadow-[0_12px_30px_-14px_rgba(0,0,0,0.7),0_0_30px_-6px_rgba(232,163,61,0.22)]",
      )}
    >
      <Link href="/" className="mr-1 flex shrink-0 items-center gap-2">
        <Image src="/upflu-icon.png" alt="UPFlu" width={28} height={28} priority unoptimized className="h-6 w-6" />
        {clientName && <span className="text-sm font-medium text-muted-foreground">{clientName}</span>}
      </Link>

      <div className="flex items-center gap-1 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                active && "border-border bg-secondary text-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </div>

      {agenteItem && (
        <Link
          href={agenteItem.href}
          aria-current={pathname === agenteItem.href ? "page" : undefined}
          className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-linear-to-br from-brand-gold-soft via-primary to-brand-gold-deep px-4 py-2 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-8px_rgba(232,163,61,0.65)] transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Bot className="h-4 w-4" aria-hidden="true" />
          {agenteItem.label}
        </Link>
      )}

      <LogoutButton className="ml-1" />
    </nav>
  );
}
