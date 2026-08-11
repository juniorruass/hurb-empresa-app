import { LEAD_STATUS_LABEL } from "@/lib/leads/types";
import type { LeadsResumo } from "@/lib/relatorios/types";

export function LeadsSection({ resumo }: { resumo: LeadsResumo }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h2 className="mb-3 text-sm font-semibold">Leads ({resumo.total})</h2>
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.entries(resumo.porStatus).map(([status, count]) => (
          <div key={status}>
            <p className="text-xs text-muted-foreground">{LEAD_STATUS_LABEL[status as keyof typeof LEAD_STATUS_LABEL]}</p>
            <p className="font-medium [font-variant-numeric:tabular-nums]">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
