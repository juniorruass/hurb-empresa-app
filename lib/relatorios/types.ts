import type { Payment } from "@/lib/financeiro/types";
import type { Lead, LeadStatus } from "@/lib/leads/types";
import type { ContentRequest } from "@/lib/content-agent/types";

export interface FinanceiroResumo {
  totalPago: number;
  totalPendente: number;
  totalAtrasado: number;
  faturas: Payment[];
}

export interface LeadsResumo {
  total: number;
  porStatus: Record<LeadStatus, number>;
  recentes: Lead[];
}

export interface ConteudoResumo {
  total: number;
  porObjetivo: { organico: number; trafego_pago: number };
  recentes: ContentRequest[];
}

export interface ClientReport {
  financeiro: FinanceiroResumo | null;
  leads: LeadsResumo | null;
  conteudo: ConteudoResumo;
}
