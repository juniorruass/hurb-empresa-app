import type { ContentRequest } from "@/lib/content-agent/types";

const OBJETIVO_LABEL: Record<ContentRequest["objetivo"], string> = {
  organico: "Orgânico",
  trafego_pago: "Tráfego pago",
};

export function ConteudoHistorico({ requests }: { requests: ContentRequest[] }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
        Nada gerado ainda.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium">Histórico</p>
      {requests.map((r) => (
        <details key={r.id} className="group rounded-xl border border-border bg-card p-4">
          <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {OBJETIVO_LABEL[r.objetivo]}
              </span>
              <span className="font-medium">{r.tema}</span>
            </span>
            <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("pt-BR")}</span>
          </summary>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Copy</p>
              <p className="whitespace-pre-wrap">{r.copy}</p>
            </div>
            {r.hashtags && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Hashtags</p>
                <p className="whitespace-pre-wrap text-muted-foreground">{r.hashtags}</p>
              </div>
            )}
            {r.variacoes && r.variacoes.length > 0 && (
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Variações</p>
                <div className="flex flex-col gap-2">
                  {r.variacoes.map((v, i) => (
                    <p key={i} className="whitespace-pre-wrap rounded-md bg-secondary/40 p-2">
                      {v}
                    </p>
                  ))}
                </div>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Roteiro de vídeo</p>
              <p className="whitespace-pre-wrap">{r.roteiro_video}</p>
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
