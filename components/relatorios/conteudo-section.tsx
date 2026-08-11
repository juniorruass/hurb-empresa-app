import type { ConteudoResumo } from "@/lib/relatorios/types";

export function ConteudoSection({ resumo }: { resumo: ConteudoResumo }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold">Conteúdo gerado ({resumo.total})</h2>
      <div className="mb-4 flex gap-4 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Orgânico</p>
          <p className="font-medium [font-variant-numeric:tabular-nums]">{resumo.porObjetivo.organico}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Tráfego pago</p>
          <p className="font-medium [font-variant-numeric:tabular-nums]">{resumo.porObjetivo.trafego_pago}</p>
        </div>
      </div>
      {resumo.recentes.length > 0 && (
        <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          {resumo.recentes.map((r) => (
            <li key={r.id} className="truncate">
              {new Date(r.created_at).toLocaleDateString("pt-BR")} — {r.tema}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
