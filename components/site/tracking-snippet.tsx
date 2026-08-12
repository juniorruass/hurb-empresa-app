"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TrackingSnippet({ origin, siteKey }: { origin: string; siteKey: string | null }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const snippet = siteKey ? `<script async src="${origin}/track.js" data-site="${siteKey}"></script>` : null;

  async function handleCopy() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    setLoading(true);
    try {
      await fetch("/api/site/tracking", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (!snippet) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Banco ainda não está pronto pra esse módulo — a migration 026 precisa rodar primeiro.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">Rastrear visitas do site</p>
      <p className="text-sm text-muted-foreground">Cole esse trecho antes do fechamento do {"</body>"} no seu site:</p>
      <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2">
        <code className="flex-1 overflow-x-auto text-xs whitespace-nowrap">{snippet}</code>
        <Button type="button" variant="ghost" size="icon-sm" onClick={handleCopy}>
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        </Button>
      </div>
      <Button type="button" variant="outline" size="sm" className="w-fit gap-1.5" onClick={handleRegenerate} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />}
        Regenerar
      </Button>
    </div>
  );
}
