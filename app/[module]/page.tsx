import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { isModuleKey, MODULE_REGISTRY } from "@/lib/modules";
import { getCurrentClient } from "@/lib/clients/session";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  if (!isModuleKey(module)) notFound();

  const client = await getCurrentClient();
  const enabled = client?.enabledModules.some((m) => m.key === module) ?? false;
  const { label } = MODULE_REGISTRY[module];

  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Voltar
      </Link>

      <div className="rounded-2xl border border-border bg-card p-10 text-center">
        {enabled ? (
          <>
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground">Em construção.</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Esse módulo não está habilitado pra você.</p>
        )}
      </div>
    </div>
  );
}
