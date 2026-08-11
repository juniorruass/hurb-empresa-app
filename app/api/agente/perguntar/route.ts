import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { gatherClientContext } from "@/lib/agente/context";
import { answerQuestion } from "@/lib/agente/generate";
import { createPergunta } from "@/lib/agente/perguntas";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "agente")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  const body = await req.json();
  const pergunta = typeof body.pergunta === "string" ? body.pergunta.trim() : "";
  if (!pergunta) {
    return NextResponse.json({ error: "Campo obrigatório: pergunta." }, { status: 400 });
  }

  try {
    const context = await gatherClientContext(client.clientId, client.clientName);
    const resposta = await answerQuestion(client.clientName, context, pergunta);
    const registro = await createPergunta({ clientId: client.clientId, pergunta, resposta });
    return NextResponse.json({ pergunta: registro });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
