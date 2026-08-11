"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      aria-label="Sair"
      title="Sair"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  );
}
