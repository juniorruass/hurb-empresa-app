import { listPayments } from "@/lib/financeiro/payments";
import { listLeads } from "@/lib/leads/leads";
import { listRequests } from "@/lib/content-agent/requests";
import type { LeadStatus } from "@/lib/leads/types";
import type { ClientReport, ConteudoResumo, FinanceiroResumo, LeadsResumo } from "./types";

const LEAD_STATUSES: LeadStatus[] = ["novo", "contatado", "qualificado", "convertido", "descartado"];

export async function buildClientReport(
  clientId: string,
  options: { financeiro: boolean; leads: boolean },
): Promise<ClientReport> {
  const [payments, leads, requests] = await Promise.all([
    options.financeiro ? listPayments(clientId) : Promise.resolve(null),
    options.leads ? listLeads(clientId) : Promise.resolve(null),
    listRequests(clientId),
  ]);

  const financeiro: FinanceiroResumo | null = payments
    ? {
        totalPago: payments.filter((p) => p.paid_date).reduce((sum, p) => sum + p.amount, 0),
        totalPendente: payments.filter((p) => !p.paid_date).reduce((sum, p) => sum + p.amount, 0),
        totalAtrasado: payments
          .filter((p) => !p.paid_date && new Date(p.due_date) < new Date())
          .reduce((sum, p) => sum + p.amount, 0),
        faturas: payments.slice(0, 5),
      }
    : null;

  const leadsResumo: LeadsResumo | null = leads
    ? {
        total: leads.length,
        porStatus: LEAD_STATUSES.reduce(
          (acc, status) => ({ ...acc, [status]: leads.filter((l) => l.status === status).length }),
          {} as Record<LeadStatus, number>,
        ),
        recentes: leads.slice(0, 5),
      }
    : null;

  const conteudo: ConteudoResumo = {
    total: requests.length,
    porObjetivo: {
      organico: requests.filter((r) => r.objetivo === "organico").length,
      trafego_pago: requests.filter((r) => r.objetivo === "trafego_pago").length,
    },
    recentes: requests.slice(0, 5),
  };

  return { financeiro, leads: leadsResumo, conteudo };
}
