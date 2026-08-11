import Link from "next/link";
import { getCurrentClient } from "@/lib/clients/session";
import { getBriefing } from "@/lib/content-agent/briefing";
import { listRequests } from "@/lib/content-agent/requests";
import { ConteudoForm } from "@/components/conteudo/conteudo-form";
import { ConteudoHistorico } from "@/components/conteudo/conteudo-historico";
import { ModuleLocked } from "@/components/shared/module-locked";

export const dynamic = "force-dynamic";

export default async function ConteudoPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "conteudo")) {
    return <ModuleLocked />;
  }

  const [briefing, requests] = await Promise.all([getBriefing(client.clientId), listRequests(client.clientId)]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Agente de Conteúdo</h1>
        <p className="text-sm text-muted-foreground">Copy e roteiro de vídeo, orgânico ou tráfego pago.</p>
      </div>

      {!briefing && (
        <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          Você ainda não preencheu o{" "}
          <Link href="/briefing" className="font-medium underline underline-offset-2">
            briefing
          </Link>
          . O agente vai usar um contexto genérico — preencher deixa o resultado bem melhor.
        </div>
      )}

      <ConteudoForm />

      <ConteudoHistorico requests={requests} />
    </div>
  );
}
