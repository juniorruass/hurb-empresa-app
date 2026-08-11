"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXEMPLO = `{
  "nome": "Maria Silva",
  "email": "maria@exemplo.com",
  "telefone": "11999999999",
  "mensagem": "Quero saber mais"
}`;

export function WebhookCard({ url }: { url: string | null }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCopy() {
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetch("/api/integracoes/webhook", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!url) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Banco ainda não está pronto pra esse módulo — a migration 022 precisa rodar primeiro.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl bg-card p-5 text-sm text-card-foreground ring-1 ring-foreground/10">
      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Sua URL de webhook</p>
        <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
          <code className="flex-1 overflow-x-auto text-xs whitespace-nowrap">{url}</code>
          <Button type="button" variant="ghost" size="icon-sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Formato esperado (POST, JSON)</p>
        <pre className="overflow-x-auto rounded-lg bg-secondary/40 p-3 text-xs">{EXEMPLO}</pre>
      </div>

      <Button type="button" variant="outline" className="w-fit gap-1.5" onClick={handleRegenerate} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
        Regenerar URL
      </Button>
      <p className="text-xs text-muted-foreground">
        Regenerar invalida a URL anterior imediatamente — atualize a integração no seu sistema externo depois.
      </p>
    </div>
  );
}
