import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "../prompts/systemPrompt";
import { DadosEmpresa } from "./erpService";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GerarAnaliseParams {
  dadosEmpresa: DadosEmpresa;
  benchmarkBCB: unknown;
  pergunta?: string;
}

export async function gerarAnaliseCredito({
  dadosEmpresa,
  benchmarkBCB,
  pergunta,
}: GerarAnaliseParams): Promise<string> {
  const contexto = JSON.stringify(
    { dadosEmpresa, benchmarkBCB, pergunta: pergunta ?? null },
    null,
    2
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analise os dados abaixo e gere a saída no formato definido:\n\n${contexto}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
}
