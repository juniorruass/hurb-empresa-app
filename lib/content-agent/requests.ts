import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { ApprovalStatus, ContentRequest, GeneratedContent, Objetivo } from "./types";

const TABLE = "content_requests";
export const DAILY_CONTENT_LIMIT = 2;

export function countRequestsToday(requests: ContentRequest[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return requests.filter((r) => r.created_at.slice(0, 10) === today).length;
}

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

export async function updateRequestStatus(
  clientId: string,
  requestId: string,
  status: ApprovalStatus,
  comentario?: string | null,
): Promise<ContentRequest> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .update({ status, comentario: comentario ?? null })
    .eq("id", requestId)
    .eq("client_id", clientId)
    .select()
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 025 pendente).");
    }
    throw new Error(error.message);
  }
  return data as ContentRequest;
}
