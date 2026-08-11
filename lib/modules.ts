export type ModuleKey =
  | "briefing"
  | "conteudo"
  | "aprovacao"
  | "relatorios"
  | "trafego_pago"
  | "financeiro"
  | "leads"
  | "site"
  | "agente"
  | "comunicacao"
  | "integracoes";

export const MODULE_REGISTRY: Record<ModuleKey, { label: string; description: string }> = {
  briefing: {
    label: "Briefing",
    description: "Identidade de marca e objetivos",
  },
  conteudo: {
    label: "Agente de Conteúdo",
    description: "Copy e roteiro de vídeo, orgânico ou tráfego pago",
  },
  aprovacao: {
    label: "Fila de aprovação",
    description: "Aprovar ou pedir ajuste no conteúdo gerado",
  },
  relatorios: {
    label: "Relatórios",
    description: "O que foi entregue e os resultados",
  },
  trafego_pago: {
    label: "Tráfego pago",
    description: "Métricas da conta de anúncio",
  },
  financeiro: {
    label: "Financeiro",
    description: "Faturas e histórico de pagamento",
  },
  leads: {
    label: "Leads",
    description: "Leads gerados pra você",
  },
  site: {
    label: "Site",
    description: "Status do site",
  },
  agente: {
    label: "Agente",
    description: "Pergunte sobre seu desempenho",
  },
  comunicacao: {
    label: "Comunicação",
    description: "Fale direto com a UPFlu",
  },
  integracoes: {
    label: "Integrações",
    description: "Conecte landing pages e sistemas externos",
  },
};

export function isModuleKey(value: string): value is ModuleKey {
  return value in MODULE_REGISTRY;
}
