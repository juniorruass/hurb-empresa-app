import Anthropic from "@anthropic-ai/sdk";
import type { ClientBriefing, GeneratedContent, Objetivo } from "./types";

const CONTENT_SCHEMA = {
  type: "object",
  properties: {
    copy: { type: "string" },
    hashtags: { type: "string" },
    variacoes: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 3 },
    roteiro_video: { type: "string" },
  },
  required: ["copy", "roteiro_video"],
  additionalProperties: false,
} as const;

function buildSystemPrompt(clientName: string, briefing: ClientBriefing | null): string {
  const brandContext = briefing
    ? `
Identidade de marca do cliente:
- Cor principal: ${briefing.cor || "não informada"}
- Tom de voz: ${briefing.tom_de_voz || "não informado"}
- Público-alvo: ${briefing.publico || "não informado"}
- Objetivos do negócio: ${briefing.objetivos || "não informado"}
`.trim()
    : "Esse cliente ainda não preencheu o briefing de marca — use um tom profissional e direto, genérico o suficiente pra servir qualquer pequena/média empresa.";

  return `
Você é o Agente de Conteúdo da UPFlu, agência de marketing digital.
Está ajudando o cliente "${clientName}" a criar conteúdo pras redes
sociais dele. Escreva pensando NO NEGÓCIO DELE, não na UPFlu.

${brandContext}

Regras gerais:
- Direto, sem corporativês, sem jargão de marketing em inglês desnecessário.
- Nunca soar "genérico de IA" — cada frase deve parecer escrita por
  alguém que conhece esse negócio específico, não um template.
- Frases curtas, fáceis de gravar/falar em vídeo.
`.trim();
}

function buildUserPrompt(objetivo: Objetivo, tema: string, rede?: string | null): string {
  if (objetivo === "trafego_pago") {
    return `
Preciso de conteúdo pra uma campanha de TRÁFEGO PAGO sobre: "${tema}".

Gere:
- "copy": a melhor variação de copy do anúncio (título + texto principal + CTA), pronta pra usar.
- "variacoes": mais 2 a 3 variações alternativas de copy (título + texto + CTA cada, como texto corrido), pra testar.
- "roteiro_video": roteiro de vídeo curto (15-30s) pensado pra anúncio — gancho nos primeiros 3 segundos, cena a cena, com indicação do que aparece na tela e o que é falado/legendado.
`.trim();
  }

  return `
Preciso de conteúdo ORGÂNICO pra rede social "${rede || "Instagram"}" sobre: "${tema}".

Gere:
- "copy": a legenda completa do post (hook na primeira linha, contexto, CTA no fim).
- "hashtags": 8 a 12 hashtags relevantes, separadas por espaço, sem numerar.
- "roteiro_video": roteiro de vídeo cena a cena (ou guia de slides se fizer mais sentido como carrossel), com indicação do que aparece na tela e o que é falado/legendado.
`.trim();
}

export async function generateContent(
  clientName: string,
  briefing: ClientBriefing | null,
  objetivo: Objetivo,
  tema: string,
  rede?: string | null,
): Promise<GeneratedContent> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }

  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 4000,
    output_config: {
      format: { type: "json_schema", schema: CONTENT_SCHEMA },
    },
    system: buildSystemPrompt(clientName, briefing),
    messages: [{ role: "user", content: buildUserPrompt(objetivo, tema, rede) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("A geração foi recusada pelo modelo. Tente reformular o tema.");
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) {
    throw new Error("Resposta da IA não trouxe conteúdo de texto.");
  }

  try {
    return JSON.parse(textBlock.text) as GeneratedContent;
  } catch {
    throw new Error("Resposta da IA não veio em JSON válido.");
  }
}
