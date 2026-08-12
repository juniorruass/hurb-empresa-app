import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { regenerateSiteTracking } from "@/lib/site/tracking";

export async function POST() {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "site")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  try {
    const tracking = await regenerateSiteTracking(client.clientId);
    return NextResponse.json({ tracking });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
