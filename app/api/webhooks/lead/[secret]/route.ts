import { NextResponse } from "next/server";
import { findClientBySecret } from "@/lib/integracoes/webhooks";
import { createLead } from "@/lib/leads/leads";

/**
 * Rota pública — landing page, sistema de agendamento ou de vendas do
 * cliente manda um evento de lead aqui, sem sessão. Autenticação é o
 * secret na própria URL (proxy.ts exclui esse caminho da checagem de
 * login). Depois que o secret valida, sempre devolve 200 mesmo se o
 * corpo vier mal formado — evita retry-storm de quem está integrando.
 */
export async function POST(req: Request, { params }: { params: Promise<{ secret: string }> }) {
  const { secret } = await params;
  const match = await findClientBySecret(secret);
  if (!match) {
    return NextResponse.json({ error: "Webhook inválido." }, { status: 404 });
  }

  const body = await req.json().catch(() => null);

  try {
    await createLead(match.clientId, {
      nome: typeof body?.nome === "string" ? body.nome : null,
      email: typeof body?.email === "string" ? body.email : null,
      telefone: typeof body?.telefone === "string" ? body.telefone : null,
      mensagem: typeof body?.mensagem === "string" ? body.mensagem : null,
      origem: "webhook",
      raw_payload: body,
    });
  } catch {
    // engolido de propósito — o chamador não deve ficar tentando de novo
    // por causa de um payload que a gente não soube processar.
  }

  return NextResponse.json({ ok: true });
}
