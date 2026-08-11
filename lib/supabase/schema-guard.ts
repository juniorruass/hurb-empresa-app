/**
 * Enquanto uma migration nova não roda em produção em todo ambiente, a
 * tabela correspondente não existe. PostgREST responde com PGRST205
 * ("Could not find the table ... in the schema cache") nesse caso.
 * Tratar como "sem dado ainda" em vez de 500 cru, mesmo padrão de
 * degradação graciosa usado em todo módulo desse projeto antes de uma
 * migration nova rodar.
 */
export function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return error.code === "PGRST205" || Boolean(error.message?.includes("Could not find the table"));
}
