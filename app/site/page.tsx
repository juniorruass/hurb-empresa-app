import { headers } from "next/headers";
import { getCurrentClient } from "@/lib/clients/session";
import { getSiteInfo, getOrCreateSiteTracking } from "@/lib/site/tracking";
import { getSiteStats } from "@/lib/site/visits";
import { ModuleLocked } from "@/components/shared/module-locked";
import { SiteStatus } from "@/components/site/site-status";
import { SiteStats as SiteStatsCard } from "@/components/site/site-stats";
import { TrackingSnippet } from "@/components/site/tracking-snippet";

export const dynamic = "force-dynamic";

export default async function SitePage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "site")) {
    return <ModuleLocked />;
  }

  const [info, stats, tracking] = await Promise.all([
    getSiteInfo(client.clientId),
    getSiteStats(client.clientId),
    getOrCreateSiteTracking(client.clientId),
  ]);

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Status do site</h1>
        <p className="text-sm text-muted-foreground">Link, status e visitas reais.</p>
      </div>

      <SiteStatus info={info} />
      <SiteStatsCard stats={stats} />
      <TrackingSnippet origin={origin} siteKey={tracking?.siteKey ?? null} />
    </div>
  );
}
