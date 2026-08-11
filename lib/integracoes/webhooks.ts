import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { ClientWebhook } from "./types";

const TABLE = "client_webhooks";

function newSecret() {
  return randomBytes(24).toString("hex");
}

export async function getOrCreateWebhook(clientId: string): Promise<ClientWebhook | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("*").eq("client_id", clientId).maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return null;
    throw new Error(error.message);
  }
  if (data) return data as ClientWebhook;

  const { data: created, error: insertError } = await supabase
    .from(TABLE)
    .insert({ client_id: clientId, secret: newSecret() })
    .select()
    .single();
  if (insertError) {
    if (isMissingTableError(insertError)) return null;
    throw new Error(insertError.message);
  }
  return created as ClientWebhook;
}

export async function regenerateWebhook(clientId: string): Promise<ClientWebhook> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ client_id: clientId, secret: newSecret(), rotated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 022 pendente).");
    }
    throw new Error(error.message);
  }
  return data as ClientWebhook;
}

export async function findClientBySecret(secret: string): Promise<{ clientId: string } | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("client_id").eq("secret", secret).maybeSingle();
  if (error || !data) return null;
  return { clientId: data.client_id };
}
