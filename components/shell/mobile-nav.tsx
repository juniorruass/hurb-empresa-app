"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bot, MoreHorizontal, X } from "lucide-react";
import type { NavItem } from "./nav-items";
import { LogoutButton } from "./logout-button";
import { cn } from "@/lib/utils";

type SheetId = "more" | null;

export function MobileNav({ clientName, navItems }: { clientName?: string; navItems: NavItem[] }) {
  const pathname = usePathname();
  const [openSheet, setOpenSheet] = useState<SheetId>(null);

  const agenteItem = navItems.find((n) => n.key === "agente");
  const items = navItems.filter((n) => n.key !== "agente");
  const tabItems = items.slice(0, 4);
  const moreItems = items.slice(4);
  const close = () => setOpenSheet(null);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-2">
          <Image src="/upflu-icon.png" alt="UPFlu" width={24} height={24} priority unoptimized className="h-6 w-6" />
          {clientName && <span className="text-sm font-medium text-muted-foreground">{clientName}</span>}
        </div>
        <LogoutButton className="h-7 w-7" />
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Navegação principal"
      >
        {tabItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[0.65rem] font-medium text-muted-foreground",
                active && "text-primary",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
        {moreItems.length > 0 && (
          <button
            type="button"
            onClick={() => setOpenSheet("more")}
            className="flex flex-1 flex-col items-center gap-1 py-2 text-[0.65rem] font-medium text-muted-foreground"
          >
            <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
            Mais
          </button>
        )}
      </nav>

      {agenteItem && (
        <Link
          href={agenteItem.href}
          aria-label={agenteItem.label}
          className="fixed right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-linear-to-br from-brand-gold-soft via-primary to-brand-gold-deep text-primary-foreground shadow-[0_10px_24px_-8px_rgba(232,163,61,0.55)] lg:hidden"
          style={{ bottom: "calc(5rem + env(safe-area-inset-bottom))" }}
        >
          <Bot className="h-5 w-5" aria-hidden="true" />
        </Link>
      )}

      {moreItems.length > 0 && (
        <>
          <div
            aria-hidden="true"
            onClick={close}
            className={cn(
              "fixed inset-0 z-30 bg-black/45 transition-opacity lg:hidden",
              openSheet ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          />

          <Sheet open={openSheet === "more"} onClose={close} title="Mais">
            <div className="flex flex-col gap-1">
              {moreItems.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg px-2 py-3 text-sm text-foreground hover:bg-secondary"
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </Sheet>
        </>
      )}
    </>
  );
}

function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 max-h-[78vh] translate-y-full rounded-t-2xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-200 lg:hidden",
        open && "translate-y-0",
      )}
    >
      <div className="mx-auto mb-3 h-1 w-9 rounded-full bg-border" />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
      {children}
    </div>
  );
}
