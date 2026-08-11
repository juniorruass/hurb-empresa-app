import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function MiniSparkline({ data }: { data: number[] }) {
  const w = 100;
  const h = 28;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const x = (i: number) => (i / (data.length - 1)) * w;
  const y = (v: number) => h - ((v - min) / span) * (h - 3) - 1.5;
  const line = data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-7 w-full flex-1" aria-hidden="true">
      <path d={area} fill="color-mix(in oklch, var(--primary) 14%, transparent)" stroke="none" />
      <path d={line} fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MetricCard({
  titulo,
  valor,
  variacao: v,
  inverso,
  icon: Icon,
  sparkData,
}: {
  titulo: string;
  valor: string;
  variacao: { pct: number; up: boolean } | null;
  inverso?: boolean;
  icon: LucideIcon;
  sparkData?: number[];
}) {
  const bom = v ? (inverso ? !v.up : v.up) : null;
  return (
    <div className="relative flex min-w-[168px] flex-1 flex-col gap-1.5 overflow-hidden rounded-2xl border border-border bg-card p-[18px]">
      <Icon className="pointer-events-none absolute -right-2 -bottom-2.5 h-16 w-16 text-primary/10" aria-hidden="true" />
      <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{titulo}</span>
      <span className="text-[1.7rem] font-bold tracking-tight [font-variant-numeric:tabular-nums]">{valor}</span>
      <div className="mt-auto flex items-end justify-between gap-3">
        {v ? (
          <span className={cn("flex w-fit shrink-0 items-center gap-1 text-xs font-medium", bom ? "text-success" : "text-destructive")}>
            {v.up ? <TrendingUp className="h-3 w-3" aria-hidden="true" /> : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
            {v.pct.toFixed(1)}%
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
        {sparkData && sparkData.length > 1 && <MiniSparkline data={sparkData} />}
      </div>
    </div>
  );
}
