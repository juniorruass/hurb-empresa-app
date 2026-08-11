import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCurrentClient } from "@/lib/clients/session";

export const dynamic = "force-dynamic";

export default async function Home() {
  const client = await getCurrentClient();

  if (!client) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-10 text-center">
        <p className="font-medium">Sua conta ainda não está vinculada a uma empresa.</p>
        <p className="text-sm text-muted-foreground">Fale com a UPFlu pra liberar seu acesso.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Olá, {client.clientName}</h1>
        <p className="text-sm text-muted-foreground">Seus módulos habilitados</p>
      </div>

      {client.enabledModules.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="font-medium">Nenhum módulo habilitado ainda.</p>
          <p className="text-sm text-muted-foreground">Fale com a UPFlu pra ativar o que você precisa.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {client.enabledModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.key}
                href={`/${mod.key}`}
                className="relative flex flex-col gap-2 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50"
              >
                <Icon className="pointer-events-none absolute -right-2 -bottom-2.5 h-16 w-16 text-primary/10" aria-hidden="true" />
                <span className="font-medium">{mod.label}</span>
                <span className="text-sm text-muted-foreground">{mod.description}</span>
                <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                  Abrir
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
