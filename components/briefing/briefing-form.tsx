"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { ClientBriefing } from "@/lib/content-agent/types";

export function BriefingForm({ initial }: { initial: ClientBriefing | null }) {
  const [cor, setCor] = useState(initial?.cor ?? "");
  const [tomDeVoz, setTomDeVoz] = useState(initial?.tom_de_voz ?? "");
  const [publico, setPublico] = useState(initial?.publico ?? "");
  const [objetivos, setObjetivos] = useState(initial?.objetivos ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cor, tom_de_voz: tomDeVoz, publico, objetivos }),
      });
      if (!res.ok) throw new Error("Não foi possível salvar.");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl bg-card p-5 text-sm text-card-foreground ring-1 ring-foreground/10"
    >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cor">Cor principal</Label>
          <Input id="cor" value={cor} onChange={(e) => setCor(e.target.value)} placeholder="ex: azul e branco, #1A73E8" />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="tom">Tom de voz</Label>
          <Textarea
            id="tom"
            value={tomDeVoz}
            onChange={(e) => setTomDeVoz(e.target.value)}
            placeholder="ex: direto, sem formalidade excessiva, próximo do cliente"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="publico">Público-alvo</Label>
          <Textarea
            id="publico"
            value={publico}
            onChange={(e) => setPublico(e.target.value)}
            placeholder="ex: donos de pequenas academias, 30-50 anos"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="objetivos">Objetivos do negócio</Label>
          <Textarea
            id="objetivos"
            value={objetivos}
            onChange={(e) => setObjetivos(e.target.value)}
            placeholder="ex: atrair mais matrículas, aumentar reconhecimento da marca na cidade"
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : "Salvar briefing"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-success">
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Salvo
            </span>
          )}
        </div>
    </form>
  );
}
