import type { NextRequest } from "next/server";
import { createAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

const TABLE = "auth_login_attempts";
const WINDOW_MS = 15 * 60 * 1000; // 15min sem tentativa nova reseta o contador
const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 8000;

export function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

// Delay progressivo contra brute force no login -- só há uma senha
// compartilhada e nenhuma conta pra bloquear, então em vez de um lockout
// (que travaria o próprio Júnior se alguém mirasse o IP dele) a resposta
// fica cada vez mais lenta por IP até a janela expirar.
export async function getLoginDelay(ip: string): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = createAdminClient();
  const { data } = await supabase.from(TABLE).select("failed_count, last_attempt_at").eq("ip", ip).maybeSingle();
  if (!data) return 0;

  const last = new Date(data.last_attempt_at).getTime();
  if (Date.now() - last > WINDOW_MS) return 0;
  return Math.min(data.failed_count * BASE_DELAY_MS, MAX_DELAY_MS);
}

export async function recordLoginAttempt(ip: string, success: boolean): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const supabase = createAdminClient();

  if (success) {
    await supabase.from(TABLE).delete().eq("ip", ip);
    return;
  }

  const { data } = await supabase.from(TABLE).select("failed_count, last_attempt_at").eq("ip", ip).maybeSingle();
  const withinWindow = data && Date.now() - new Date(data.last_attempt_at).getTime() <= WINDOW_MS;
  const nextCount = withinWindow ? data.failed_count + 1 : 1;

  await supabase.from(TABLE).upsert({ ip, failed_count: nextCount, last_attempt_at: new Date().toISOString() });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
