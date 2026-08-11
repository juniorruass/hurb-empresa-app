"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Objetivo, ContentRequest } from "@/lib/content-agent/types";

const REDES = ["Instagram", "TikTok", "LinkedIn", "Facebook"];

export function ConteudoForm() {
  const router = useRouter();
  const [objetivo, setObjetivo] = useState<Objetivo>("organico");
  const [tema, setTema] = useState("");
  const [rede, setRede] = useState("Instagram");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ContentRequest | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/conteudo/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ objetivo, tema, rede: objetivo === "organico" ? rede : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível gerar.");
      setResult(data.request as ContentRequest);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível gerar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-card p-5 text-sm text-card-foreground ring-1 ring-foreground/10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>Objetivo</Label>
          <div className="flex gap-2">
            <Button type="button" variant={objetivo === "organico" ? "default" : "outline"} onClick={() => setObjetivo("organico")}>
              Conteúdo orgânico
            </Button>
            <Button
              type="button"
              variant={objetivo === "trafego_pago" ? "default" : "outline"}
              onClick={() => setObjetivo("trafego_pago")}
            >
              Tráfego pago
            </Button>
          </div>
        </div>

        {objetivo === "organico" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="rede">Rede social</Label>
            <Select value={rede} onValueChange={(v) => v && setRede(v)}>
              <SelectTrigger id="rede" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REDES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tema">{objetivo === "organico" ? "Tema do post" : "O que a campanha vende"}</Label>
          <Textarea
            id="tema"
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            placeholder={
              objetivo === "organico"
                ? "ex: dicas pra quem tá começando na academia"
                : "ex: matrícula com 20% de desconto até domingo"
            }
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={loading || !tema.trim()} className="w-fit gap-2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Sparkles className="h-4 w-4" aria-hidden="true" />}
          Gerar
        </Button>
      </form>

      {result && (
        <div className="flex flex-col gap-4 rounded-lg border border-primary/30 bg-secondary/40 p-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Copy</p>
            <p className="whitespace-pre-wrap">{result.copy}</p>
          </div>
          {result.hashtags && (
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Hashtags</p>
              <p className="whitespace-pre-wrap text-muted-foreground">{result.hashtags}</p>
            </div>
          )}
          {result.variacoes && result.variacoes.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Variações</p>
              <div className="flex flex-col gap-2">
                {result.variacoes.map((v, i) => (
                  <p key={i} className="whitespace-pre-wrap rounded-md bg-background/60 p-2">
                    {v}
                  </p>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Roteiro de vídeo</p>
            <p className="whitespace-pre-wrap">{result.roteiro_video}</p>
          </div>
        </div>
      )}
    </div>
  );
}
