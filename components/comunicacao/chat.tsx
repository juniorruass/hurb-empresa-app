"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ClientMessage } from "@/lib/comunicacao/types";

const POLL_MS = 8000;

export function Chat({ initialMessages }: { initialMessages: ClientMessage[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch("/api/comunicacao");
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    }, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setBody("");
    try {
      const res = await fetch("/api/comunicacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-[60vh] flex-col gap-4 rounded-xl bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="m-auto text-sm text-muted-foreground">Manda uma mensagem pra começar a conversa.</p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap",
              m.sender === "client" ? "self-end bg-primary text-primary-foreground" : "self-start bg-secondary/60",
            )}
          >
            {m.body}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva sua mensagem..."
          className="min-h-10 flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={sending || !body.trim()}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>
    </div>
  );
}
