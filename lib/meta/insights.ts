// Parsing de insights do Meta Marketing API — portado do upflu-dashboard
// (lib/meta-insights.ts), onde já roda em produção pra conta própria da UPFlu.

export const META_BASE = "https://graph.facebook.com/v19.0";

export const RESULT_ACTIONS = [
  "lead",
  "purchase",
  "complete_registration",
  "submit_application",
  "contact",
  "offsite_conversion.fb_pixel_lead",
  "offsite_conversion.fb_pixel_purchase",
  "app_install",
  "mobile_app_install",
  "link_click",
  "post_engagement",
  "page_engagement",
  "video_view",
  "instagram_profile_visit",
  "onsite_web_view_content",
  "view_content",
  "offsite_conversion.fb_pixel_view_content",
];

export const RESULT_LABELS: Record<string, string> = {
  lead: "Leads",
  purchase: "Compras",
  complete_registration: "Cadastros",
  submit_application: "Aplicações",
  contact: "Contatos",
  "offsite_conversion.fb_pixel_lead": "Leads (Pixel)",
  "offsite_conversion.fb_pixel_purchase": "Compras (Pixel)",
  app_install: "Instalações",
  mobile_app_install: "Instalações",
  link_click: "Cliques no link",
  post_engagement: "Engajamento",
  page_engagement: "Engajamento",
  video_view: "Visualizações de vídeo",
  instagram_profile_visit: "Visitas ao perfil",
  onsite_web_view_content: "Leads (visualização de página)",
  view_content: "Leads (visualização de página)",
  "offsite_conversion.fb_pixel_view_content": "Leads (visualização de página)",
};

type ActionEntry = { action_type: string; value: string };

export function findAction(actions: ActionEntry[], types: string[]): number | null {
  for (const type of types) {
    const found = actions?.find((a) => a.action_type === type);
    if (found) return parseInt(found.value);
  }
  return null;
}

export function findResultWithLabel(actions: ActionEntry[], types: string[]): { value: number; label: string } | null {
  for (const type of types) {
    const found = actions?.find((a) => a.action_type === type);
    if (found) return { value: parseInt(found.value), label: RESULT_LABELS[type] ?? type };
  }
  return null;
}

export function findCostPerAction(cpa: ActionEntry[], types: string[]): number | null {
  for (const type of types) {
    const found = cpa?.find((a) => a.action_type === type);
    if (found) return parseFloat(found.value);
  }
  return null;
}

// Todos os action_types que representam uma venda — variam conforme onde a
// conversão acontece (checkout externo via pixel, compra dentro do próprio
// Instagram/Facebook via "onsite"/"omni"). Representam a MESMA venda, então
// usamos first-match-wins (nunca somar), igual ao resto do parsing.
export const PURCHASE_ACTION_TYPES = [
  "purchase",
  "onsite_conversion.purchase",
  "omni_purchase",
  "onsite_web_purchase",
  "onsite_app_purchase",
  "onsite_web_app_purchase",
  "offsite_conversion.fb_pixel_purchase",
];

export interface InsightsRow {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  reach: number;
  frequency: number;
  cpm: number;
  results: number | null;
  result_label: string | null;
  cost_per_result: number | null;
  purchases: number | null;
  purchase_value: number | null;
  roas: number | null;
  cost_per_purchase: number | null;
}

// Parseia uma linha "raw" da resposta do Graph API /insights num InsightsRow enxuto
// (usado tanto pro resumo de conta quanto pra cada linha de breakdown por campanha).
export function parseInsightsRow(row: Record<string, unknown>): InsightsRow {
  const actions = (row.actions as ActionEntry[]) ?? [];
  const actionValues = (row.action_values as ActionEntry[]) ?? [];
  const cpa = (row.cost_per_action_type as ActionEntry[]) ?? [];
  const resultMatch = findResultWithLabel(actions, RESULT_ACTIONS);

  const spend = parseFloat((row.spend as string) ?? "0");
  const purchases = findAction(actions, PURCHASE_ACTION_TYPES);
  const purchaseValue = findCostPerAction(actionValues, PURCHASE_ACTION_TYPES);

  return {
    spend,
    impressions: parseInt((row.impressions as string) ?? "0"),
    clicks: parseInt((row.clicks as string) ?? "0"),
    ctr: parseFloat((row.ctr as string) ?? "0"),
    reach: parseInt((row.reach as string) ?? "0"),
    frequency: parseFloat((row.frequency as string) ?? "0"),
    cpm: parseFloat((row.cpm as string) ?? "0"),
    results: resultMatch?.value ?? null,
    result_label: resultMatch?.label ?? null,
    cost_per_result: findCostPerAction(cpa, RESULT_ACTIONS),
    purchases,
    purchase_value: purchaseValue,
    roas: purchaseValue && spend > 0 ? purchaseValue / spend : null,
    cost_per_purchase: purchases && spend > 0 ? spend / purchases : null,
  };
}

export interface CampaignInsightsRow extends InsightsRow {
  campaign_id: string;
  campaign_name: string;
}

export interface FetchInsightsParams {
  accountId: string;
  token: string;
  level?: "account" | "campaign";
  datePreset?: string;
  since?: string;
  until?: string;
}

const ACCOUNT_FIELDS = ["spend", "impressions", "clicks", "ctr", "reach", "frequency", "cpm", "actions", "action_values", "cost_per_action_type"].join(",");
const CAMPAIGN_FIELDS = ["campaign_id", "campaign_name", ...ACCOUNT_FIELDS.split(",")].join(",");

export async function fetchMetaInsights(params: FetchInsightsParams & { level: "campaign" }): Promise<CampaignInsightsRow[]>;
export async function fetchMetaInsights(params: FetchInsightsParams & { level?: "account" }): Promise<InsightsRow | null>;
export async function fetchMetaInsights({ accountId, token, level = "account", datePreset, since, until }: FetchInsightsParams) {
  const qp = new URLSearchParams({
    fields: level === "campaign" ? CAMPAIGN_FIELDS : ACCOUNT_FIELDS,
    access_token: token,
  });

  if (level === "campaign") qp.set("level", "campaign");

  if (since && until) {
    qp.set("time_range", JSON.stringify({ since, until }));
  } else {
    qp.set("date_preset", datePreset || "today");
  }

  const url = `${META_BASE}/act_${accountId}/insights?${qp}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const json = await res.json();

  if (json.error) {
    const code = json.error.code ? ` (#${json.error.code})` : "";
    throw new Error(`${json.error.message}${code}`);
  }

  const rows: Record<string, unknown>[] = json.data ?? [];

  if (level === "campaign") {
    return rows.map((row) => ({
      campaign_id: row.campaign_id as string,
      campaign_name: row.campaign_name as string,
      ...parseInsightsRow(row),
    }));
  }

  return rows[0] ? parseInsightsRow(rows[0]) : null;
}

// Status da conta de anúncio (bloqueio, revisão, pagamento pendente etc.) —
// separado dos insights porque é uma chamada leve em outro endpoint (/act_{id}
// direto, não /insights) e não depende de período.
const ACCOUNT_STATUS_LABEL: Record<number, { label: string; critico: boolean }> = {
  1: { label: "Ativa", critico: false },
  2: { label: "Desabilitada", critico: true },
  3: { label: "Conta não finalizada", critico: true },
  7: { label: "Em revisão de risco", critico: true },
  8: { label: "Pagamento pendente de liquidação", critico: true },
  9: { label: "Em período de carência", critico: true },
  100: { label: "Pendente de encerramento", critico: true },
  101: { label: "Encerrada", critico: true },
  201: { label: "Anúncio ativo sem forma de pagamento", critico: true },
};

export interface AccountStatus {
  status: number;
  label: string;
  critico: boolean;
  disableReason: number | null;
}

export async function fetchMetaAccountStatus(accountId: string, token: string): Promise<AccountStatus | null> {
  const url = `${META_BASE}/act_${accountId}?fields=account_status,disable_reason&access_token=${token}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const json = await res.json();
  if (json.error) {
    const code = json.error.code ? ` (#${json.error.code})` : "";
    throw new Error(`${json.error.message}${code}`);
  }
  const status = json.account_status as number | undefined;
  if (status === undefined) return null;
  const info = ACCOUNT_STATUS_LABEL[status] ?? { label: `Status ${status}`, critico: status !== 1 };
  return { status, label: info.label, critico: info.critico, disableReason: json.disable_reason ?? null };
}

export interface SeriesInsightsRow extends InsightsRow {
  date: string;
}

// Série diária (usada pro gráfico de evolução) — mesmos campos do resumo de
// conta, um ponto por dia (`time_increment=1`), a Graph API inclui
// `date_start` em cada linha automaticamente nesse modo.
export async function fetchMetaInsightsSeries({
  accountId,
  token,
  datePreset,
  since,
  until,
}: FetchInsightsParams): Promise<SeriesInsightsRow[]> {
  const qp = new URLSearchParams({
    fields: ACCOUNT_FIELDS,
    access_token: token,
    time_increment: "1",
  });

  if (since && until) {
    qp.set("time_range", JSON.stringify({ since, until }));
  } else {
    qp.set("date_preset", datePreset || "last_30d");
  }

  const url = `${META_BASE}/act_${accountId}/insights?${qp}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  const json = await res.json();

  if (json.error) {
    const code = json.error.code ? ` (#${json.error.code})` : "";
    throw new Error(`${json.error.message}${code}`);
  }

  const rows: Record<string, unknown>[] = json.data ?? [];
  return rows.map((row) => ({
    date: row.date_start as string,
    ...parseInsightsRow(row),
  }));
}
