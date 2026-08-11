import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { ClientMessage, MessageSender } from "./types";

const TABLE = "client_messages";

export async function listMessages(clientId: string): Promise<ClientMessage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) {
    if (isMissingTableError(error)) return [];
    throw new Error(error.message);
  }
  return (data ?? []) as ClientMessage[];
}

export async function createMessage(clientId: string, sender: MessageSender, body: string): Promise<ClientMessage> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ client_id: clientId, sender, body })
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 023 pendente).");
    }
    throw new Error(error.message);
  }
  return data as ClientMessage;
}
