import { getCurrentClient } from "@/lib/clients/session";
import { listPerguntas } from "@/lib/agente/perguntas";
import { ModuleLocked } from "@/components/shared/module-locked";
import { AgenteChat } from "@/components/agente/agente-chat";

export const dynamic = "force-dynamic";

export default async function AgentePage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "agente")) {
    return <ModuleLocked />;
  }

  const perguntas = await listPerguntas(client.clientId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Agente</h1>
        <p className="text-sm text-muted-foreground">Pergunte sobre seu desempenho — financeiro, leads e conteúdo.</p>
      </div>

      <AgenteChat initialPerguntas={perguntas} />
    </div>
  );
}
