import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { AgentePergunta } from "./types";

const TABLE = "agente_perguntas";

export async function listPerguntas(clientId: string): Promise<AgentePergunta[]> {
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
  return (data ?? []) as AgentePergunta[];
}

export async function createPergunta(input: {
  clientId: string;
  pergunta: string;
  resposta: string;
}): Promise<AgentePergunta> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({ client_id: input.clientId, pergunta: input.pergunta, resposta: input.resposta })
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 024 pendente).");
    }
    throw new Error(error.message);
  }
  return data as AgentePergunta;
}
