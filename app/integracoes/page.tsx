import { headers } from "next/headers";
import { getCurrentClient } from "@/lib/clients/session";
import { getOrCreateWebhook } from "@/lib/integracoes/webhooks";
import { ModuleLocked } from "@/components/shared/module-locked";
import { WebhookCard } from "@/components/integracoes/webhook-card";

export const dynamic = "force-dynamic";

export default async function IntegracoesPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "integracoes")) {
    return <ModuleLocked />;
  }

  const webhook = await getOrCreateWebhook(client.clientId);
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;
  const url = webhook ? `${origin}/api/webhooks/lead/${webhook.secret}` : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Integrações</h1>
        <p className="text-sm text-muted-foreground">
          Conecte sua landing page, sistema de agendamento ou de vendas — cada lead vira um registro em{" "}
          <span className="font-medium">Leads</span> automaticamente.
        </p>
      </div>

      <WebhookCard url={url} />
    </div>
  );
}
