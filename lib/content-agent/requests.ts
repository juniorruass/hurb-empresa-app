import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "./schema-guard";
import type { ContentRequest, GeneratedContent, Objetivo } from "./types";

const TABLE = "content_requests";

export async function listRequests(clientId: string): Promise<ContentRequest[]> {
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
  return (data ?? []) as ContentRequest[];
}

export async function createRequest(input: {
  clientId: string;
  objetivo: Objetivo;
  tema: string;
  rede?: string | null;
  generated: GeneratedContent;
}): Promise<ContentRequest> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      client_id: input.clientId,
      objetivo: input.objetivo,
      tema: input.tema,
      rede: input.rede ?? null,
      copy: input.generated.copy,
      hashtags: input.generated.hashtags ?? null,
      variacoes: input.generated.variacoes ?? null,
      roteiro_video: input.generated.roteiro_video,
    })
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 019 pendente).");
    }
    throw new Error(error.message);
  }
  return data as ContentRequest;
}
