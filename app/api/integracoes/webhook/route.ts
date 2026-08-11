import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { regenerateWebhook } from "@/lib/integracoes/webhooks";

export async function POST() {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "integracoes")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  try {
    const webhook = await regenerateWebhook(client.clientId);
    return NextResponse.json({ webhook });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
