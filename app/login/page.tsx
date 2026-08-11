"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Não foi possível entrar.");
      router.push(params.get("next") || "/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(560px 320px at 50% 0%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 70%)",
        }}
      />

      <div className="relative flex w-full max-w-[22rem] flex-col gap-7 rounded-3xl border border-border bg-linear-to-b from-[#161a20] to-card p-8 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image src="/upflu-logo.png" alt="UPFlu" width={386} height={100} priority unoptimized className="h-9 w-auto" />
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Acesso ao painel — entre com seu email e senha</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="relative">
            <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              disabled={loading}
              className="w-full rounded-xl border border-input bg-secondary/40 py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <Lock className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              disabled={loading}
              className="w-full rounded-xl border border-input bg-secondary/40 py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-colors focus:border-primary disabled:opacity-50"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl bg-linear-to-br from-brand-gold-soft via-primary to-brand-gold-deep py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_8px_20px_-8px_rgba(232,163,61,0.55)] transition-transform hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <>
                Entrar
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
