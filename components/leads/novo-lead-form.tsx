"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function NovoLeadForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, mensagem }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não foi possível cadastrar.");
      setNome("");
      setEmail("");
      setTelefone("");
      setMensagem("");
      setOpen(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" className="w-fit gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        Cadastrar lead manualmente
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl bg-card p-5 text-sm text-card-foreground ring-1 ring-foreground/10"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-nome">Nome</Label>
          <Input id="lead-nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-email">Email</Label>
          <Input id="lead-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="lead-telefone">Telefone</Label>
          <Input id="lead-telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lead-mensagem">Mensagem (opcional)</Label>
        <Textarea id="lead-mensagem" value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || (!nome.trim() && !email.trim() && !telefone.trim())} className="w-fit gap-2">
          {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Cadastrar
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
