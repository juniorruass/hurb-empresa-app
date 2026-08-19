"use client";

import { useEffect, useState } from "react";
import { DollarSign, Target, Percent, TrendingUp as TrendingUpIcon } from "lucide-react";
import { MetricCard } from "@/components/shared/metric-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PERIOD_OPTIONS, type PeriodKey } from "@/lib/periods";
import type { CampaignInsightsRow, InsightsRow } from "@/lib/meta/insights";

const POLL_MS = 30000;

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pctChange(atual: number, anterior: number): { pct: number; up: boolean } | null {
  if (!anterior) return null;
  const pct = ((atual - anterior) / anterior) * 100;
  return { pct: Math.abs(pct), up: pct >= 0 };
}

export function TrafegoPagoView({
  initialPeriod,
  initialSummary,
  initialPreviousSummary,
  initialCampaigns,
}: {
  initialPeriod: PeriodKey;
  initialSummary: InsightsRow | null;
  initialPreviousSummary: InsightsRow | null;
  initialCampaigns: CampaignInsightsRow[];
}) {
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod);
  const [summary, setSummary] = useState(initialSummary);
  const [previousSummary, setPreviousSummary] = useState(initialPreviousSummary);
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [error, setError] = useState<string | null>(null);

  async function refresh(p: PeriodKey) {
    try {
      const res = await fetch(`/api/trafego?period=${p}`).then((r) => r.json());
      if (res.error) {
        setError(res.error);
        return;
      }
      setError(null);
      setSummary(res.summary);
      setPreviousSummary(res.previousSummary);
      setCampaigns(res.campaigns ?? []);
    } catch {
      // falha de rede num ciclo de polling não deve derrubar a tela — só tenta de novo no próximo tick
    }
  }

  useEffect(() => {
    const interval = setInterval(() => void refresh(period), POLL_MS);
    return () => clearInterval(interval);
  }, [period]);

  function handlePeriodChange(p: PeriodKey) {
    setPeriod(p);
    void refresh(p);
  }

  return (
    <div className="flex flex-col gap-5">
      <Select value={period} onValueChange={(v) => handlePeriodChange(v as PeriodKey)}>
        <SelectTrigger className="w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_OPTIONS.map((o) => (
            <SelectItem key={o.key} value={o.key}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <MetricCard
          titulo="Investimento"
          valor={formatBRL(summary?.spend ?? 0)}
          variacao={summary && previousSummary ? pctChange(summary.spend, previousSummary.spend) : null}
          inverso
          icon={DollarSign}
        />
        <MetricCard
          titulo={summary?.result_label ?? "Resultados"}
          valor={String(summary?.results ?? 0)}
          variacao={summary?.results && previousSummary?.results ? pctChange(summary.results, previousSummary.results) : null}
          icon={Target}
        />
        <MetricCard
          titulo="Custo por resultado"
          valor={summary?.cost_per_result != null ? formatBRL(summary.cost_per_result) : "—"}
          variacao={
            summary?.cost_per_result != null && previousSummary?.cost_per_result != null
              ? pctChange(summary.cost_per_result, previousSummary.cost_per_result)
              : null
          }
          inverso
          icon={Percent}
        />
        <MetricCard
          titulo="ROAS"
          valor={summary?.roas != null ? `${summary.roas.toFixed(2)}x` : "—"}
          variacao={summary?.roas != null && previousSummary?.roas != null ? pctChange(summary.roas, previousSummary.roas) : null}
          icon={TrendingUpIcon}
        />
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nenhuma campanha com investimento nesse período.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <tr>
                <th className="px-4 py-2.5">Campanha</th>
                <th className="px-4 py-2.5">Investimento</th>
                <th className="px-4 py-2.5">Resultados</th>
                <th className="px-4 py-2.5">Custo por resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {campaigns.map((c) => (
                <tr key={c.campaign_id}>
                  <td className="px-4 py-3 font-medium">{c.campaign_name}</td>
                  <td className="px-4 py-3 [font-variant-numeric:tabular-nums]">{formatBRL(c.spend)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.results ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.cost_per_result != null ? formatBRL(c.cost_per_result) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
