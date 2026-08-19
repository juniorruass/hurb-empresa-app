import { NextRequest, NextResponse } from "next/server";
import { getCurrentClient } from "@/lib/clients/session";
import { fetchMetaInsights } from "@/lib/meta/insights";
import { rangesForPeriod, type PeriodKey } from "@/lib/periods";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const client = await getCurrentClient();
  if (!client) return NextResponse.json({ error: "Sua conta ainda não está vinculada a uma empresa." }, { status: 401 });
  if (!client.enabledModules.some((m) => m.key === "trafego_pago")) {
    return NextResponse.json({ error: "Esse módulo não está habilitado pra você." }, { status: 403 });
  }
  if (!client.metaAdAccountId) {
    return NextResponse.json({ error: "Conta de anúncio ainda não configurada — fale com a UPFlu." }, { status: 400 });
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (!token) return NextResponse.json({ error: "META_ACCESS_TOKEN não configurado." }, { status: 400 });

  const periodKey = (req.nextUrl.searchParams.get("period") as PeriodKey) || "7d";
  const { atual, anterior } = rangesForPeriod(periodKey);

  try {
    const [summary, previousSummary, campaigns] = await Promise.all([
      fetchMetaInsights({ accountId: client.metaAdAccountId, token, level: "account", since: atual.since, until: atual.until }),
      fetchMetaInsights({ accountId: client.metaAdAccountId, token, level: "account", since: anterior.since, until: anterior.until }),
      fetchMetaInsights({ accountId: client.metaAdAccountId, token, level: "campaign", since: atual.since, until: atual.until }),
    ]);

    return NextResponse.json({
      summary,
      previousSummary,
      campaigns: campaigns.sort((a, b) => b.spend - a.spend),
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}
