import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { getBriefing } from "@/lib/content-agent/briefing";
import { generateContent } from "@/lib/content-agent/generate";
import { createRequest } from "@/lib/content-agent/requests";
import type { Objetivo } from "@/lib/content-agent/types";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "conteudo")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  const body = await req.json();
  const objetivo = body.objetivo as Objetivo | undefined;
  const tema = typeof body.tema === "string" ? body.tema.trim() : "";
  const rede = typeof body.rede === "string" ? body.rede : null;

  if (objetivo !== "organico" && objetivo !== "trafego_pago") {
    return NextResponse.json({ error: "Objetivo inválido." }, { status: 400 });
  }
  if (!tema) {
    return NextResponse.json({ error: "Campo obrigatório: tema." }, { status: 400 });
  }

  try {
    const briefing = await getBriefing(client.clientId);
    const generated = await generateContent(client.clientName, briefing, objetivo, tema, rede);
    const request = await createRequest({ clientId: client.clientId, objetivo, tema, rede, generated });
    return NextResponse.json({ request });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
