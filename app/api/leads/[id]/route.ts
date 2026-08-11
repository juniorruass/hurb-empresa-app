import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { updateLeadStatus } from "@/lib/leads/leads";
import { LEAD_STATUS_LABEL, type LeadStatus } from "@/lib/leads/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "leads")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status as LeadStatus | undefined;

  if (!status || !(status in LEAD_STATUS_LABEL)) {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  try {
    const lead = await updateLeadStatus(client.clientId, id, status);
    return NextResponse.json({ lead });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
