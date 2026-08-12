import { getCurrentClient } from "@/lib/clients/session";
import { listRequests } from "@/lib/content-agent/requests";
import { ModuleLocked } from "@/components/shared/module-locked";
import { AprovacaoItem } from "@/components/aprovacao/aprovacao-item";

export const dynamic = "force-dynamic";

export default async function AprovacaoPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "aprovacao")) {
    return <ModuleLocked />;
  }

  const requests = await listRequests(client.clientId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Fila de aprovação</h1>
        <p className="text-sm text-muted-foreground">Aprove ou peça ajuste no conteúdo gerado pra você.</p>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Nada gerado ainda.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <AprovacaoItem key={r.id} request={r} />
          ))}
        </div>
      )}
    </div>
  );
}
