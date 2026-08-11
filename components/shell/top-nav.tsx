import Image from "next/image";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

export function TopNav({ clientName }: { clientName?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 lg:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/upflu-icon.png" alt="UPFlu" width={28} height={28} unoptimized className="h-7 w-7" />
          {clientName && <span className="text-sm font-medium text-muted-foreground">{clientName}</span>}
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
