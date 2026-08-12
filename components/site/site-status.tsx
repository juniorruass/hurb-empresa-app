import type { SiteInfo } from "@/lib/site/types";

export function SiteStatus({ info }: { info: SiteInfo }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold">Site</p>
      {!info.url && !info.status ? (
        <p className="text-sm text-muted-foreground">Nenhuma informação de site cadastrada ainda.</p>
      ) : (
        <div className="flex flex-col gap-2 text-sm">
          {info.url && (
            <p>
              <span className="text-muted-foreground">Link:</span>{" "}
              <a href={info.url} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-2">
                {info.url}
              </a>
            </p>
          )}
          {info.status && (
            <p>
              <span className="text-muted-foreground">Status:</span> <span className="font-medium">{info.status}</span>
            </p>
          )}
          {info.notes && (
            <div>
              <p className="text-muted-foreground">Notas:</p>
              <p className="whitespace-pre-wrap">{info.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
