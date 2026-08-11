import { getCurrentClient } from "@/lib/clients/session";
import { listMessages } from "@/lib/comunicacao/messages";
import { ModuleLocked } from "@/components/shared/module-locked";
import { Chat } from "@/components/comunicacao/chat";

export const dynamic = "force-dynamic";

export default async function ComunicacaoPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "comunicacao")) {
    return <ModuleLocked />;
  }

  const messages = await listMessages(client.clientId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Canal de comunicação</h1>
        <p className="text-sm text-muted-foreground">Fale direto com a UPFlu.</p>
      </div>

      <Chat initialMessages={messages} />
    </div>
  );
}
