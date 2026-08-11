import { getCurrentClient } from "@/lib/clients/session";
import { buildClientReport } from "@/lib/relatorios/aggregate";
import { ModuleLocked } from "@/components/shared/module-locked";
import { FinanceiroSection } from "@/components/relatorios/financeiro-section";
import { LeadsSection } from "@/components/relatorios/leads-section";
import { ConteudoSection } from "@/components/relatorios/conteudo-section";

export const dynamic = "force-dynamic";

export default async function RelatoriosPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "relatorios")) {
    return <ModuleLocked />;
  }

  const hasFinanceiro = client.enabledModules.some((m) => m.key === "financeiro");
  const hasLeads = client.enabledModules.some((m) => m.key === "leads");
  const report = await buildClientReport(client.clientId, { financeiro: hasFinanceiro, leads: hasLeads });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Relatórios</h1>
        <p className="text-sm text-muted-foreground">O que foi entregue e os resultados.</p>
      </div>

      <div className="flex flex-col gap-4">
        {report.financeiro && <FinanceiroSection resumo={report.financeiro} />}
        {report.leads && <LeadsSection resumo={report.leads} />}
        <ConteudoSection resumo={report.conteudo} />
      </div>
    </div>
  );
}
