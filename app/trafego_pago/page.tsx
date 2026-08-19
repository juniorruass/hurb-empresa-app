import { getCurrentClient } from "@/lib/clients/session";
import { fetchMetaInsights } from "@/lib/meta/insights";
import { rangesForPeriod } from "@/lib/periods";
import { ModuleLocked } from "@/components/shared/module-locked";
import { TrafegoPagoView } from "@/components/trafego/trafego-view";

export const dynamic = "force-dynamic";

export default async function TrafegoPagoPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "trafego_pago")) {
    return <ModuleLocked />;
  }
  if (!client.metaAdAccountId) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta de anúncio ainda não foi configurada — fale com a UPFlu.
      </div>
    );
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Métricas de anúncio ainda não configuradas neste ambiente.
      </div>
    );
  }

  const { atual, anterior } = rangesForPeriod("7d");
  const [summary, previousSummary, campaigns] = await Promise.all([
    fetchMetaInsights({ accountId: client.metaAdAccountId, token, level: "account", since: atual.since, until: atual.until }).catch(() => null),
    fetchMetaInsights({ accountId: client.metaAdAccountId, token, level: "account", since: anterior.since, until: anterior.until }).catch(() => null),
    fetchMetaInsights({ accountId: client.metaAdAccountId, token, level: "campaign", since: atual.since, until: atual.until }).catch(() => []),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Tráfego pago</h1>
        <p className="text-sm text-muted-foreground">Investimento e resultados da sua conta de anúncio, atualizados automaticamente.</p>
      </div>

      <TrafegoPagoView
        initialPeriod="7d"
        initialSummary={summary}
        initialPreviousSummary={previousSummary}
        initialCampaigns={campaigns.sort((a, b) => b.spend - a.spend)}
      />
    </div>
  );
}
