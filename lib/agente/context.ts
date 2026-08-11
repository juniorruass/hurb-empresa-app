import { listPayments, derivePaymentStatus } from "@/lib/financeiro/payments";
import { listLeads } from "@/lib/leads/leads";
import { listRequests } from "@/lib/content-agent/requests";
import { getBriefing } from "@/lib/content-agent/briefing";

const STATUS_LABEL = { paid: "pago", late: "atrasado", pending: "pendente" } as const;

export async function gatherClientContext(clientId: string, clientName: string): Promise<string> {
  const [payments, leads, requests, briefing] = await Promise.all([
    listPayments(clientId).catch(() => []),
    listLeads(clientId),
    listRequests(clientId),
    getBriefing(clientId),
  ]);

  const parts: string[] = [`Empresa: ${clientName}`];

  if (briefing) {
    parts.push(
      `Identidade de marca: cor ${briefing.cor || "não informada"}, tom de voz ${briefing.tom_de_voz || "não informado"}, público ${briefing.publico || "não informado"}, objetivos: ${briefing.objetivos || "não informado"}`,
    );
  }

  if (payments.length > 0) {
    const linhas = payments
      .slice(0, 5)
      .map((p) => `- R$ ${p.amount.toFixed(2)}, vencimento ${p.due_date}, status ${STATUS_LABEL[derivePaymentStatus(p)]}`)
      .join("\n");
    parts.push(`Últimas faturas:\n${linhas}`);
  } else {
    parts.push("Sem faturas registradas ainda.");
  }

  if (leads.length > 0) {
    const porStatus = leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.status] = (acc[l.status] ?? 0) + 1;
      return acc;
    }, {});
    const resumoStatus = Object.entries(porStatus)
      .map(([status, count]) => `${count} ${status}`)
      .join(", ");
    const recentes = leads
      .slice(0, 5)
      .map((l) => `- ${l.nome || l.email || l.telefone || "sem nome"} (${l.status}, origem ${l.origem})`)
      .join("\n");
    parts.push(`Leads: total ${leads.length} (${resumoStatus}).\nMais recentes:\n${recentes}`);
  } else {
    parts.push("Sem leads registrados ainda.");
  }

  if (requests.length > 0) {
    const linhas = requests
      .slice(0, 5)
      .map((r) => `- ${r.created_at.slice(0, 10)}: "${r.tema}" (${r.objetivo})`)
      .join("\n");
    parts.push(`Conteúdo gerado recentemente:\n${linhas}`);
  } else {
    parts.push("Nenhum conteúdo gerado ainda.");
  }

  return parts.join("\n\n");
}
