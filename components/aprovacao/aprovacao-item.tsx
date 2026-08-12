"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageSquareWarning, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ContentRequest, ApprovalStatus } from "@/lib/content-agent/types";

const OBJETIVO_LABEL: Record<ContentRequest["objetivo"], string> = {
  organico: "Orgânico",
  trafego_pago: "Tráfego pago",
};

const STATUS_LABEL: Record<ApprovalStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  ajuste_solicitado: "Ajuste solicitado",
};

const STATUS_CLASS: Record<ApprovalStatus, string> = {
  pendente: "bg-warning/15 text-warning",
  aprovado: "bg-success/15 text-success",
  ajuste_solicitado: "bg-destructive/15 text-destructive",
};

export function AprovacaoItem({ request }: { request: ContentRequest }) {
  const router = useRouter();
  const [showComentario, setShowComentario] = useState(false);
  const [comentario, setComentario] = useState("");
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: ApprovalStatus, comentarioValue?: string) {
    setBusy(true);
    try {
      await fetch(`/api/aprovacao/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comentario: comentarioValue ?? null }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <details className="group rounded-xl border border-border bg-card p-4">
      <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm">
        <span className="flex items-center gap-2">
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {OBJETIVO_LABEL[request.objetivo]}
          </span>
          <span className="font-medium">{request.tema}</span>
        </span>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CLASS[request.status])}>
          {STATUS_LABEL[request.status]}
        </span>
      </summary>

      <div className="mt-4 flex flex-col gap-3 text-sm">
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Copy</p>
          <p className="whitespace-pre-wrap">{request.copy}</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Roteiro de vídeo</p>
          <p className="whitespace-pre-wrap">{request.roteiro_video}</p>
        </div>

        {request.comentario && (
          <div className="rounded-lg bg-secondary/40 p-3">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Comentário</p>
            <p className="whitespace-pre-wrap">{request.comentario}</p>
          </div>
        )}

        {request.status === "pendente" && (
          <div className="flex flex-col gap-2">
            {showComentario ? (
              <div className="flex flex-col gap-2">
                <Textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="O que precisa mudar?"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy || !comentario.trim()}
                    onClick={() => updateStatus("ajuste_solicitado", comentario.trim())}
                  >
                    {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    Enviar pedido de ajuste
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowComentario(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button type="button" size="sm" className="gap-1.5" disabled={busy} onClick={() => updateStatus("aprovado")}>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Aprovar
                </Button>
                <Button type="button" variant="outline" size="sm" className="gap-1.5" disabled={busy} onClick={() => setShowComentario(true)}>
                  <MessageSquareWarning className="h-3.5 w-3.5" aria-hidden="true" />
                  Pedir ajuste
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
