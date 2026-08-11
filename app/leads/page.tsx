import { getCurrentClient } from "@/lib/clients/session";
import { listLeads } from "@/lib/leads/leads";
import { ModuleLocked } from "@/components/shared/module-locked";
import { NovoLeadForm } from "@/components/leads/novo-lead-form";
import { LeadsTable } from "@/components/leads/leads-table";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const client = await getCurrentClient();
  if (!client) {
    return (
      <div className="rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Sua conta ainda não está vinculada a uma empresa.
      </div>
    );
  }
  if (!client.enabledModules.some((m) => m.key === "leads")) {
    return <ModuleLocked />;
  }

  const leads = await listLeads(client.clientId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Leads</h1>
        <p className="text-sm text-muted-foreground">Leads gerados pra você — via integração ou cadastro manual.</p>
      </div>

      <NovoLeadForm />

      <LeadsTable leads={leads} />
    </div>
  );
}
