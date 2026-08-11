"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import type { AgentePergunta } from "@/lib/agente/types";

const SUGGESTIONS = ["Como estão minhas faturas?", "Quantos leads chegaram esse mês?", "O que já foi gerado de conteúdo pra mim?"];

export function AgenteChat({ initialPerguntas }: { initialPerguntas: AgentePergunta[] }) {
  const [perguntas, setPerguntas] = useState(initialPerguntas);
  const [pergunta, setPergunta] = useState("");
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [perguntas.length]);

  async function ask(q?: string) {
    const value = (q ?? pergunta).trim();
    if (!value || asking) return;
    setAsking(true);
    setError(null);
    setPergunta("");
    try {
      const res = await fetch("/api/agente/perguntar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível responder agora.");
      setPerguntas((prev) => [...prev, data.pergunta]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível responder agora.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-260px)] min-h-[420px] flex-col rounded-2xl border border-border bg-card">
      <div className="flex-1 overflow-y-auto p-5">
        {perguntas.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <p className="text-sm text-muted-foreground">Pergunte sobre seu desempenho.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  disabled={asking}
                  className="rounded-full border border-input bg-secondary/50 px-3 py-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {perguntas.map((p) => (
              <div key={p.id} className="flex flex-col gap-2">
                <div className="max-w-[75%] self-end rounded-2xl bg-primary px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">
                  {p.pergunta}
                </div>
                <div className="max-w-[75%] self-start rounded-2xl bg-secondary/60 px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {p.resposta}
                </div>
              </div>
            ))}
            {asking && (
              <div className="self-start rounded-2xl bg-secondary/60 px-4 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="px-5 pb-1 text-xs text-destructive">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask();
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <input
          value={pergunta}
          onChange={(e) => setPergunta(e.target.value)}
          placeholder="Pergunte algo sobre seu desempenho..."
          disabled={asking}
          className="flex-1 rounded-full border border-border bg-transparent px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none"
        />
        <button
          type="submit"
          disabled={asking || !pergunta.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
