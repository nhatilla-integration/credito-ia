import { Router, Request, Response } from "express";
import { buscarDadosERP, buscarContasPagarOmie } from "../services/erpService";
import { montarBenchmarkAtual } from "../services/bcbService";
import { gerarAnaliseCredito } from "../services/claudeService";

export const creditoRouter = Router();

/**
 * POST /api/analise-credito
 * body: { cnpj: string, pergunta?: string }
 *
 * Orquestra as 3 fontes: ERP + benchmark BCB + Claude,
 * e devolve a análise pronta em Markdown.
 */
creditoRouter.post("/analise-credito", async (req: Request, res: Response) => {
  try {
    const { cnpj, pergunta } = req.body;

    if (!cnpj) {
      return res.status(400).json({ erro: "Campo 'cnpj' é obrigatório" });
    }

    const [dadosEmpresa, benchmarkBCB] = await Promise.all([
      buscarDadosERP(cnpj),
      montarBenchmarkAtual(),
    ]);

    const analise = await gerarAnaliseCredito({
      dadosEmpresa,
      benchmarkBCB,
      pergunta,
    });

    res.json({
      empresa: dadosEmpresa.razaoSocial,
      geradoEm: new Date().toISOString(),
      analise,
    });
  } catch (error: any) {
    console.error("Erro na análise de crédito:", error);
    res.status(500).json({ erro: error.message ?? "Erro interno" });
  }
});

// Endpoint auxiliar só pra você conferir o benchmark isoladamente
creditoRouter.get("/benchmark", async (_req: Request, res: Response) => {
  try {
    const benchmark = await montarBenchmarkAtual();
    res.json(benchmark);
  } catch (error: any) {
    res.status(500).json({ erro: error.message });
  }
});

/**
 * GET /api/debug-contexto?cnpj=...
 *
 * Monta o mesmo contexto (dadosEmpresa + benchmarkBCB) que seria
 * enviado ao Claude em /analise-credito, mas retorna o JSON puro
 * sem chamar a API da Anthropic. Útil pra depurar sem gastar crédito.
 */
creditoRouter.get("/debug-contexto", async (req: Request, res: Response) => {
  try {
    const cnpj = (req.query.cnpj as string) ?? "00.000.000/0001-00";

    const [dadosEmpresa, benchmarkBCB] = await Promise.all([
      buscarDadosERP(cnpj),
      montarBenchmarkAtual(),
    ]);

    res.json({ dadosEmpresa, benchmarkBCB });
  } catch (error: any) {
    res.status(500).json({ erro: error.message ?? "Erro interno" });
  }
});

/**
 * GET /api/debug-omie
 *
 * Chama buscarContasPagarOmie() e devolve o retorno cru do Omie,
 * pra conferir a integração isoladamente (Fase 3a).
 */
creditoRouter.get("/debug-omie", async (_req: Request, res: Response) => {
  try {
    const contasPagar = await buscarContasPagarOmie();
    res.json(contasPagar);
  } catch (error: any) {
    res.status(500).json({
      erro: error.message ?? "Erro interno",
      detalhesOmie: error.response?.data ?? null,
    });
  }
});
