export type Objetivo = "organico" | "trafego_pago";

export interface ClientBriefing {
  client_id: string;
  cor: string | null;
  tom_de_voz: string | null;
  publico: string | null;
  objetivos: string | null;
  updated_at: string;
}

export interface NewBriefing {
  cor?: string | null;
  tom_de_voz?: string | null;
  publico?: string | null;
  objetivos?: string | null;
}

export interface ContentRequest {
  id: string;
  client_id: string;
  objetivo: Objetivo;
  rede: string | null;
  tema: string;
  copy: string;
  hashtags: string | null;
  variacoes: string[] | null;
  roteiro_video: string;
  created_at: string;
}

export interface GeneratedContent {
  copy: string;
  hashtags?: string;
  variacoes?: string[];
  roteiro_video: string;
}
