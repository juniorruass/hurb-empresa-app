export interface ClientWebhook {
  client_id: string;
  secret: string;
  created_at: string;
  rotated_at: string | null;
}
