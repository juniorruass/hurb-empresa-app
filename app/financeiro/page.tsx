import { Wallet, CircleCheck, CircleAlert } from "lucide-react";
import { getCurrentClient } from "@/lib/clients/session";
import { listPayments } from "@/lib/financeiro/payments";
import { ModuleLocked } from "@/components/shared/module-locked";
import { MetricCard } from "@/components/shared/metric-card";
import { PaymentsTable } from "@/components/financeiro/payments-table";

export const dynamic = "force-dynamic";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function FinanceiroPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "financeiro")) {
    return <ModuleLocked />;
  }

  const payments = await listPayments(client.clientId);

  const totalPago = payments.filter((p) => p.paid_date).reduce((sum, p) => sum + p.amount, 0);
  const totalPendente = payments.filter((p) => !p.paid_date).reduce((sum, p) => sum + p.amount, 0);
  const proximaFatura = payments
    .filter((p) => !p.paid_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Financeiro</h1>
        <p className="text-sm text-muted-foreground">Faturas e histórico de pagamento.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <MetricCard titulo="Total pago" valor={formatBRL(totalPago)} variacao={null} icon={CircleCheck} />
        <MetricCard titulo="Em aberto" valor={formatBRL(totalPendente)} variacao={null} icon={Wallet} />
        <MetricCard
          titulo="Próximo vencimento"
          valor={proximaFatura ? new Date(proximaFatura.due_date).toLocaleDateString("pt-BR") : "—"}
          variacao={null}
          icon={CircleAlert}
        />
      </div>

      <PaymentsTable payments={payments} />
    </div>
  );
}
