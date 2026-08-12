import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { updateRequestStatus } from "@/lib/content-agent/requests";
import type { ApprovalStatus } from "@/lib/content-agent/types";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "aprovacao")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status as ApprovalStatus | undefined;
  const comentario = typeof body.comentario === "string" ? body.comentario : null;

  if (status !== "aprovado" && status !== "ajuste_solicitado") {
    return NextResponse.json({ error: "Status inválido." }, { status: 400 });
  }

  try {
    const request = await updateRequestStatus(client.clientId, id, status, comentario);
    return NextResponse.json({ request });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
