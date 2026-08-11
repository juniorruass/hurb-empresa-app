import { getCurrentClient } from "@/lib/clients/session";
import { getBriefing } from "@/lib/content-agent/briefing";
import { BriefingForm } from "@/components/briefing/briefing-form";
import { ModuleLocked } from "@/components/shared/module-locked";

export const dynamic = "force-dynamic";

export default async function BriefingPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "briefing")) {
    return <ModuleLocked />;
  }

  const briefing = await getBriefing(client.clientId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Briefing</h1>
        <p className="text-sm text-muted-foreground">
          Identidade de marca e objetivos — alimenta o Agente de Conteúdo automaticamente.
        </p>
      </div>

      <BriefingForm initial={briefing} />
    </div>
  );
}
