import Anthropic from "@anthropic-ai/sdk";

function buildSystemPrompt(clientName: string, context: string): string {
  return `
Você é o Agente da UPFlu pra empresa "${clientName}". Responde perguntas
sobre o desempenho real dela (financeiro, leads, conteúdo) usando só o
contexto abaixo — nunca invente número que não esteja aqui.

${context}

Regras:
- Direto, sem corporativês.
- Se a pergunta não tiver dado suficiente pra responder com precisão,
  diga isso claramente em vez de inventar.
- Frases curtas, fáceis de ler rápido.
`.trim();
}

export async function answerQuestion(clientName: string, context: string, pergunta: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY não configurada.");
  }

  const client = new Anthropic();

  const response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 1500,
    system: buildSystemPrompt(clientName, context),
    messages: [{ role: "user", content: pergunta }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("A pergunta foi recusada pelo modelo. Tente reformular.");
  }

  const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
  if (!textBlock) {
    throw new Error("Resposta da IA não trouxe conteúdo de texto.");
  }

  return textBlock.text;
}
