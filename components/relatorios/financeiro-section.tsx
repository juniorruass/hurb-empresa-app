import type { FinanceiroResumo } from "@/lib/relatorios/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function FinanceiroSection({ resumo }: { resumo: FinanceiroResumo }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold">Financeiro</h2>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Pago</p>
          <p className="font-medium [font-variant-numeric:tabular-nums]">{formatBRL(resumo.totalPago)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pendente</p>
          <p className="font-medium [font-variant-numeric:tabular-nums]">{formatBRL(resumo.totalPendente)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Atrasado</p>
          <p className="font-medium text-destructive [font-variant-numeric:tabular-nums]">{formatBRL(resumo.totalAtrasado)}</p>
        </div>
      </div>
    </div>
  );
}
