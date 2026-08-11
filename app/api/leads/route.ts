import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { createLead } from "@/lib/leads/leads";

export async function POST(req: Request) {
  const client = await getCurrentClient();
  if (!client) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (!client.enabledModules.some((m) => m.key === "leads")) {
    return NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 });
  }

  const body = await req.json();
  const nome = typeof body.nome === "string" ? body.nome.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const telefone = typeof body.telefone === "string" ? body.telefone.trim() : "";

  if (!nome && !email && !telefone) {
    return NextResponse.json({ error: "Informe pelo menos nome, email ou telefone." }, { status: 400 });
  }

  try {
    const lead = await createLead(client.clientId, {
      nome: nome || null,
      email: email || null,
      telefone: telefone || null,
      mensagem: typeof body.mensagem === "string" ? body.mensagem : null,
      origem: "manual",
    });
    return NextResponse.json({ lead });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
