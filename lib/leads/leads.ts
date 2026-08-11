import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { Lead, LeadStatus, NewLead } from "./types";

const TABLE = "client_leads";

export async function listLeads(clientId: string): Promise<Lead[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as Lead[];
}

export async function createLead(clientId: string, input: NewLead): Promise<Lead> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      client_id: clientId,
      nome: input.nome ?? null,
      email: input.email ?? null,
      telefone: input.telefone ?? null,
      origem: input.origem ?? "manual",
      mensagem: input.mensagem ?? null,
      raw_payload: input.raw_payload ?? null,
    })
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 021 pendente).");
    }
    throw new Error(error.message);
  }
  return data as Lead;
}

export async function updateLeadStatus(clientId: string, leadId: string, status: LeadStatus): Promise<Lead> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .eq("client_id", clientId)
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 021 pendente).");
    }
    throw new Error(error.message);
  }
  return data as Lead;
}
