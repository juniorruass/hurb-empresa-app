import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMissingTableError } from "@/lib/supabase/schema-guard";
import type { SiteInfo, SiteTracking } from "./types";

const TABLE = "client_site_tracking";

function newSiteKey() {
  return randomBytes(12).toString("hex");
}

export async function getSiteInfo(clientId: string): Promise<SiteInfo> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("clients")
    .select("site_url, site_status, site_notes")
    .eq("id", clientId)
    .maybeSingle();
  if (error || !data) return { url: null, status: null, notes: null };
  return { url: data.site_url, status: data.site_status, notes: data.site_notes };
}

export async function getOrCreateSiteTracking(clientId: string): Promise<SiteTracking | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("site_key").eq("client_id", clientId).maybeSingle();
  if (error) {
    if (isMissingTableError(error)) return null;
    throw new Error(error.message);
  }
  if (data) return { clientId, siteKey: data.site_key };

  const { data: created, error: insertError } = await supabase
    .from(TABLE)
    .insert({ client_id: clientId, site_key: newSiteKey() })
    .select("site_key")
    .single();
  if (insertError) {
    if (isMissingTableError(insertError)) return null;
    throw new Error(insertError.message);
  }
  return { clientId, siteKey: created.site_key };
}

export async function regenerateSiteTracking(clientId: string): Promise<SiteTracking> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ client_id: clientId, site_key: newSiteKey(), rotated_at: new Date().toISOString() })
    .select("site_key")
    .single();
  if (error) {
    if (isMissingTableError(error)) {
      throw new Error("Banco ainda não está pronto pra esse módulo (migration 026 pendente).");
    }
    throw new Error(error.message);
  }
  return { clientId, siteKey: data.site_key };
}

export async function findClientBySiteKey(siteKey: string): Promise<{ clientId: string } | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.from(TABLE).select("client_id").eq("site_key", siteKey).maybeSingle();
  if (error || !data) return null;
  return { clientId: data.client_id };
}
