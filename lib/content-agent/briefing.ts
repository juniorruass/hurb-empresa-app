import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { ClientBriefing, NewBriefing } from "./types";

const TABLE = "client_briefings";

export async function getBriefing(clientId: string): Promise<ClientBriefing | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("client_id", clientId).maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return null;
    throw new Error(error.message);
  }
  return (data as ClientBriefing | null) ?? null;
}

export async function upsertBriefing(clientId: string, input: NewBriefing): Promise<ClientBriefing> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ client_id: clientId, ...input, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 019 pendente).");
    }
    throw new Error(error.message);
  }
  return data as ClientBriefing;
}
