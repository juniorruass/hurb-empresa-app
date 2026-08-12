import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { SiteStats, SiteVisit } from "./types";

const TABLE = "site_visits";
const WINDOW_DAYS = 30;

export async function recordVisit(input: {
  clientId: string;
  path?: string | null;
  referrer?: string | null;
  visitorId?: string | null;
}): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from(TABLE).insert({
    client_id: input.clientId,
    path: input.path ?? null,
    referrer: input.referrer ?? null,
    visitor_id: input.visitorId ?? null,
  });
  if (error && !isMissingTableError(error)) throw new Error(error.message);
}

export async function getSiteStats(clientId: string): Promise<SiteStats> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .select("path, referrer, visitor_id")
    .eq("client_id", clientId)
    .gte("created_at", since)
    .limit(5000);

  if (error) {
    if (isMissingTableError(error)) {
      return { totalVisits: 0, uniqueVisitors: 0, topPaths: [], topReferrers: [] };
    }
    throw new Error(error.message);
  }

  const visits = (data ?? []) as Pick<SiteVisit, "path" | "referrer" | "visitor_id">[];
  const uniqueVisitors = new Set(visits.map((v) => v.visitor_id).filter(Boolean)).size;

  function topCounts(values: (string | null)[]): { value: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const value of values) {
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({ value, count }));
  }

  return {
    totalVisits: visits.length,
    uniqueVisitors,
    topPaths: topCounts(visits.map((v) => v.path)).map(({ value, count }) => ({ path: value, count })),
    topReferrers: topCounts(visits.map((v) => v.referrer)).map(({ value, count }) => ({ referrer: value, count })),
  };
}
