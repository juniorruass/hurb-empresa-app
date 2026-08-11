import { NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { createMessage, listMessages } from "@/lib/comunicacao/messages";

async function authorize() {
  const client = await getCurrentClient();
  if (!client) return { error: NextResponse.json({ error: "Não autenticado." }, { status: 401 }) } as const;
  if (!client.enabledModules.some((m) => m.key === "comunicacao")) {
    return { error: NextResponse.json({ error: "Módulo não habilitado." }, { status: 403 }) } as const;
  }
  return { client } as const;
}

export async function GET() {
  const auth = await authorize();
  if (auth.error) return auth.error;

  try {
    const messages = await listMessages(auth.client.clientId);
    return NextResponse.json({ messages });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}

export async function POST(req: Request) {
  const auth = await authorize();
  if (auth.error) return auth.error;

  const body = await req.json();
  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text) {
    return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });
  }

  try {
    const message = await createMessage(auth.client.clientId, "client", text);
    return NextResponse.json({ message });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
