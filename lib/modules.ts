import {
  FileText,
  Sparkles,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Wallet,
  Users,
  Globe,
  Bot,
  MessageCircle,
  Plug,
  type LucideIcon,
} from "lucide-react";

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

export const MODULE_REGISTRY: Record<ModuleKey, { label: string; description: string; icon: LucideIcon }> = {
  briefing: {
    label: "Briefing",
    description: "Identidade de marca e objetivos",
    icon: FileText,
  },
  conteudo: {
    label: "Agente de Conteúdo",
    description: "Copy e roteiro de vídeo, orgânico ou tráfego pago",
    icon: Sparkles,
  },
  aprovacao: {
    label: "Fila de aprovação",
    description: "Aprovar ou pedir ajuste no conteúdo gerado",
    icon: CheckCircle2,
  },
  relatorios: {
    label: "Relatórios",
    description: "O que foi entregue e os resultados",
    icon: BarChart3,
  },
  trafego_pago: {
    label: "Tráfego pago",
    description: "Métricas da conta de anúncio",
    icon: TrendingUp,
  },
  financeiro: {
    label: "Financeiro",
    description: "Faturas e histórico de pagamento",
    icon: Wallet,
  },
  leads: {
    label: "Leads",
    description: "Leads gerados pra você",
    icon: Users,
  },
  site: {
    label: "Site",
    description: "Status do site",
    icon: Globe,
  },
  agente: {
    label: "Agente",
    description: "Pergunte sobre seu desempenho",
    icon: Bot,
  },
  comunicacao: {
    label: "Comunicação",
    description: "Fale direto com a UPFlu",
    icon: MessageCircle,
  },
  integracoes: {
    label: "Integrações",
    description: "Conecte landing pages e sistemas externos",
    icon: Plug,
  },
};

export function isModuleKey(value: string): value is ModuleKey {
  return value in MODULE_REGISTRY;
}
