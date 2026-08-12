/**
 * Enquanto uma migration nova não roda em produção em todo ambiente, a
 * tabela (ou coluna, no caso de um `alter table` como as migrations
 * 025/026) correspondente não existe. PostgREST responde com PGRST205
 * ("Could not find the table ... in the schema cache") ou PGRST204
 * ("Could not find the '<coluna>' column ... in the schema cache")
 * nesses casos. Tratar como "sem dado ainda" em vez de 500 cru, mesmo
 * padrão de degradação graciosa usado em todo módulo desse projeto
 * antes de uma migration nova rodar.
 */
export function isMissingTableError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  if (error.code === "PGRST205" || error.code === "PGRST204") return true;
  const message = error.message ?? "";
  return message.includes("Could not find the table") || (message.includes("Could not find the") && message.includes("column"));
}
