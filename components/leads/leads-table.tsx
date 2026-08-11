"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS_LABEL, type Lead, type LeadStatus } from "@/lib/leads/types";

const STATUS_ORDER: LeadStatus[] = ["novo", "contatado", "qualificado", "convertido", "descartado"];

function downloadCsv(leads: Lead[]) {
  const header = ["Nome", "Email", "Telefone", "Origem", "Status", "Mensagem", "Criado em"];
  const rows = leads.map((l) => [
    l.nome ?? "",
    l.email ?? "",
    l.telefone ?? "",
    l.origem,
    LEAD_STATUS_LABEL[l.status],
    (l.mensagem ?? "").replace(/\n/g, " "),
    new Date(l.created_at).toLocaleString("pt-BR"),
  ]);
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "leads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function handleStatusChange(leadId: string, status: LeadStatus) {
    setPending(leadId);
    try {
      await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Nenhum lead ainda. Cadastre um manualmente ou configure a integração em{" "}
        <span className="font-medium">Integrações</span>.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => downloadCsv(leads)}>
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Exportar CSV
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5">Contato</th>
              <th className="px-4 py-2.5">Origem</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Criado em</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{lead.nome ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{[lead.email, lead.telefone].filter(Boolean).join(" · ") || "—"}</p>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{lead.origem}</td>
                <td className="px-4 py-3">
                  <Select
                    value={lead.status}
                    onValueChange={(v) => v && handleStatusChange(lead.id, v as LeadStatus)}
                    disabled={pending === lead.id}
                  >
                    <SelectTrigger className="h-7 w-[150px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_ORDER.map((s) => (
                        <SelectItem key={s} value={s}>
                          {LEAD_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(lead.created_at).toLocaleDateString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
