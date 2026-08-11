import { cn } from "@/lib/utils";
import { derivePaymentStatus } from "@/lib/financeiro/payments";
import type { Payment, PaymentStatus } from "@/lib/financeiro/types";

const STATUS_LABEL: Record<PaymentStatus, string> = {
  paid: "Pago",
  late: "Atrasado",
  pending: "Pendente",
};

const STATUS_CLASS: Record<PaymentStatus, string> = {
  paid: "bg-success/10 text-success",
  late: "bg-destructive/10 text-destructive",
  pending: "bg-warning/10 text-warning",
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Nenhuma fatura registrada ainda.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs font-medium tracking-wide text-muted-foreground uppercase">
          <tr>
            <th className="px-4 py-2.5">Valor</th>
            <th className="px-4 py-2.5">Vencimento</th>
            <th className="px-4 py-2.5">Pago em</th>
            <th className="px-4 py-2.5">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((payment) => {
            const status = derivePaymentStatus(payment);
            return (
              <tr key={payment.id}>
                <td className="px-4 py-3 font-medium [font-variant-numeric:tabular-nums]">{formatBRL(payment.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(payment.due_date).toLocaleDateString("pt-BR")}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {payment.paid_date ? new Date(payment.paid_date).toLocaleDateString("pt-BR") : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", STATUS_CLASS[status])}>
                    {STATUS_LABEL[status]}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
