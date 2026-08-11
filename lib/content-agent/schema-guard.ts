/**
 * Migration 019 ainda não foi rodada em produção em todo ambiente --
 * até rodar, `client_briefings`/`content_requests` não existem. PostgREST
 * responde com PGRST205 ("Could not find the table ... in the schema
 * cache") nesse caso. Tratar como "sem dado ainda" em vez de 500 cru,
 * mesmo padrão de degradação graciosa usado no resto do projeto antes
 * de uma migration nova rodar.
 */
export function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "PGRST205" || Boolean(error.message?.includes("Could not find the table"));
}
