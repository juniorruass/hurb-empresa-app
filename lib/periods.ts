// Cálculo de janelas de período (atual vs anterior) — usado pelo Tráfego
// Pago (Graph API `time_range`) e pelo Financeiro (filtro de lançamentos).
// Sempre em datas UTC "de calendário" (YYYY-MM-DD).

export type PeriodKey = "hoje" | "semana" | "7d" | "14d" | "30d" | "mes";

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "semana", label: "Esta semana" },
  { key: "7d", label: "Últimos 7 dias" },
  { key: "14d", label: "Últimos 14 dias" },
  { key: "30d", label: "Últimos 30 dias" },
  { key: "mes", label: "Este mês" },
];

export interface Range {
  since: string;
  until: string;
}

export interface PeriodRanges {
  atual: Range;
  anterior: Range;
  labelAnterior: string;
}

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 86400000);
}

export function rangesForPeriod(key: PeriodKey, ref: Date = new Date()): PeriodRanges {
  const today = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));

  switch (key) {
    case "hoje":
      return {
        atual: { since: toISO(today), until: toISO(today) },
        anterior: { since: toISO(addDays(today, -1)), until: toISO(addDays(today, -1)) },
        labelAnterior: "ontem",
      };

    case "semana": {
      const dow = today.getUTCDay() === 0 ? 7 : today.getUTCDay(); // 1=seg .. 7=dom
      const monday = addDays(today, -(dow - 1));
      const lastMonday = addDays(monday, -7);
      const lastSunday = addDays(monday, -1);
      return {
        atual: { since: toISO(monday), until: toISO(today) },
        anterior: { since: toISO(lastMonday), until: toISO(lastSunday) },
        labelAnterior: "semana passada",
      };
    }

    case "7d":
      return {
        atual: { since: toISO(addDays(today, -6)), until: toISO(today) },
        anterior: { since: toISO(addDays(today, -13)), until: toISO(addDays(today, -7)) },
        labelAnterior: "os 7 dias anteriores",
      };

    case "14d":
      return {
        atual: { since: toISO(addDays(today, -13)), until: toISO(today) },
        anterior: { since: toISO(addDays(today, -27)), until: toISO(addDays(today, -14)) },
        labelAnterior: "os 14 dias anteriores",
      };

    case "30d":
      return {
        atual: { since: toISO(addDays(today, -29)), until: toISO(today) },
        anterior: { since: toISO(addDays(today, -59)), until: toISO(addDays(today, -30)) },
        labelAnterior: "os 30 dias anteriores",
      };

    case "mes": {
      const firstOfMonth = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), 1));
      const firstOfLastMonth = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth() - 1, 1));
      const lastOfLastMonth = addDays(firstOfMonth, -1);
      return {
        atual: { since: toISO(firstOfMonth), until: toISO(today) },
        anterior: { since: toISO(firstOfLastMonth), until: toISO(lastOfLastMonth) },
        labelAnterior: "mês passado",
      };
    }
  }
}
