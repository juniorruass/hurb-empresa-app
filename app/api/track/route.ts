import { NextResponse } from "next/server";
import { findClientBySiteKey } from "@/lib/site/tracking";
import { recordVisit } from "@/lib/site/visits";

/**
 * Rota pública — o snippet (public/track.js) roda no domínio do site
 * do cliente, não no hub-empresas, então precisa de CORS liberado.
 * site_key é público por natureza (fica visível no HTML do site), não
 * é autenticação real — só identifica de quem é a visita.
 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const siteKey = typeof body?.siteKey === "string" ? body.siteKey : "";

  if (siteKey) {
    const match = await findClientBySiteKey(siteKey);
    if (match) {
      try {
        await recordVisit({
          clientId: match.clientId,
          path: typeof body?.path === "string" ? body.path : null,
          referrer: typeof body?.referrer === "string" ? body.referrer : null,
          visitorId: typeof body?.visitorId === "string" ? body.visitorId : null,
        });
      } catch {
        // engolido de propósito — o snippet não deve ficar tentando de novo.
      }
    }
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
