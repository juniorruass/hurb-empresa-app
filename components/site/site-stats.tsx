import { Eye, Users } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import type { SiteStats as SiteStatsType } from "@/lib/site/types";

export function SiteStats({ stats }: { stats: SiteStatsType }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <MetricCard titulo="Visitas (30 dias)" valor={String(stats.totalVisits)} variacao={null} icon={Eye} />
        <MetricCard titulo="Visitantes únicos" valor={String(stats.uniqueVisitors)} variacao={null} icon={Users} />
      </div>

      {stats.totalVisits > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-semibold">Páginas mais vistas</p>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              {stats.topPaths.map((p) => (
                <li key={p.path} className="flex justify-between gap-2">
                  <span className="truncate">{p.path}</span>
                  <span className="[font-variant-numeric:tabular-nums]">{p.count}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 text-sm font-semibold">De onde vêm</p>
            <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              {stats.topReferrers.length === 0 ? (
                <li>Direto (sem referência)</li>
              ) : (
                stats.topReferrers.map((r) => (
                  <li key={r.referrer} className="flex justify-between gap-2">
                    <span className="truncate">{r.referrer}</span>
                    <span className="[font-variant-numeric:tabular-nums]">{r.count}</span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
