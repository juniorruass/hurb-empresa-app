import { createAdminClient } from "@/lib/supabase/admin";
import type { Payment, PaymentStatus } from "./types";

/**
 * financeiro_payments já existe (criada no Hurb pessoal, migration
 * 003_financeiro_mrr.sql) — sem guard de tabela ausente, ela não é nova.
 */
export async function listPayments(clientId: string): Promise<Payment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("financeiro_payments")
    .select("*")
    .eq("client_id", clientId)
    .order("due_date", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Payment[];
}

export function derivePaymentStatus(payment: Payment, today: Date = new Date()): PaymentStatus {
  if (payment.paid_date) return "paid";
  const due = new Date(payment.due_date);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return due.getTime() < startOfToday.getTime() ? "late" : "pending";
}
