export type LeadStatus = "novo" | "contatado" | "qualificado" | "convertido" | "descartado";

export interface Lead {
  id: string;
  client_id: string;
  nome: string | null;
  email: string | null;
  telefone: string | null;
  origem: string;
  mensagem: string | null;
  status: LeadStatus;
  raw_payload: unknown;
  created_at: string;
  updated_at: string;
}

export interface NewLead {
  nome?: string | null;
  email?: string | null;
  telefone?: string | null;
  origem?: string;
  mensagem?: string | null;
  raw_payload?: unknown;
}

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  qualificado: "Qualificado",
  convertido: "Convertido",
  descartado: "Descartado",
};
