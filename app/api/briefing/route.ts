import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { upsertBriefing } from "@/lib/content-agent/briefing";

export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "briefing")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  const body = await req.json();

  try {
    const briefing = await upsertBriefing(client.clientId, {
      cor: typeof body.cor === "string" ? body.cor : null,
      tom_de_voz: typeof body.tom_de_voz === "string" ? body.tom_de_voz : null,
      publico: typeof body.publico === "string" ? body.publico : null,
      objetivos: typeof body.objetivos === "string" ? body.objetivos : null,
    });
    return NextResponse.json({ briefing });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
