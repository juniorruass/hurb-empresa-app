export type MessageSender = "client" | "agencia";

export interface ClientMessage {
  id: string;
  client_id: string;
  sender: MessageSender;
  body: string;
  created_at: string;
  read_at: string | null;
}
