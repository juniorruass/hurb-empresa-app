export type PaymentStatus = "paid" | "late" | "pending";

export interface Payment {
  id: string;
  client_id: string;
  amount: number;
  due_date: string;
  paid_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
