import { createClient } from "@/lib/supabase/server";
import { MODULE_REGISTRY, isModuleKey, type ModuleKey } from "@/lib/modules";

export interface CurrentClient {
  clientId: string;
  clientName: string;
  enabledModules: { key: ModuleKey; label: string; description: string }[];
}

/**
 * Lê o usuário logado (sessão Supabase Auth) e resolve qual empresa-cliente
 * ele representa + quais módulos estão habilitados pra ela. Passa pelo
 * client com RLS (não o admin), então só retorna dado se as policies
 * "self read"/"own client modules" (017_client_portal.sql) permitirem.
 */
export async function getCurrentClient(): Promise<CurrentClient | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: clientUser } = await supabase
    .from("client_users")
    .select("client_id, clients(name)")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!clientUser) return null;

  const clientRow = clientUser.clients as unknown as { name: string } | null;

  const { data: modules } = await supabase
    .from("client_modules")
    .select("module_key, enabled")
    .eq("client_id", clientUser.client_id)
    .eq("enabled", true);

  const enabledModules = (modules ?? [])
    .filter((m) => isModuleKey(m.module_key))
    .map((m) => {
      const key = m.module_key as ModuleKey;
      return { key, ...MODULE_REGISTRY[key] };
    });

  return {
    clientId: clientUser.client_id,
    clientName: clientRow?.name ?? "Cliente",
    enabledModules,
  };
}
