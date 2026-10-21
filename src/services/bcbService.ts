import axios from "axios";

/**
 * Integração com a API SGS do Banco Central do Brasil.
 * Pública, sem autenticação. Documentação:
 * https://dadosabertos.bcb.gov.br
 *
 * Cada "série" é um indicador histórico. Os códigos abaixo cobrem
 * os principais produtos domésticos citados na Etapa 2 do prompt.
 */

const BCB_BASE_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs";

export const SERIES_BCB = {
  capitalGiroAte365Dias: 20722,
  capitalGiroAcima365Dias: 20723,
  capitalGiroRotativo: 20724,
  taxaPJTotal: 20715,
  // Cheque especial / conta garantida PJ tem série própria por período;
  // vale conferir no portal de dados abertos se o código mudar.
  chequeEspecialPJ: 20718,
} as const;

export interface TaxaBCB {
  data: string; // formato dd/MM/yyyy conforme retorna a API
  valor: number; // taxa em % ao mês (ou conforme a série)
}

/**
 * Busca os últimos N valores de uma série do BCB.
 */
export async function buscarSerieBCB(
  codigoSerie: number,
  ultimosN: number = 1
): Promise<TaxaBCB[]> {
  const url = `${BCB_BASE_URL}.${codigoSerie}/dados/ultimos/${ultimosN}?formato=json`;

  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    return data.map((item: any) => ({
      data: item.data,
      valor: parseFloat(item.valor),
    }));
  } catch (error) {
    console.error(`Erro ao buscar série BCB ${codigoSerie}:`, error);
    throw new Error(`Falha ao consultar série ${codigoSerie} no Banco Central`);
  }
}

/**
 * Monta a "biblioteca de benchmark" (Etapa 2 do prompt) já atualizada,
 * pronta para ser injetada no contexto enviado ao Claude.
 */
export async function montarBenchmarkAtual() {
  const [capGiroCurto, capGiroLongo, capGiroRotativo, taxaTotal, chequeEspecial] =
    await Promise.all([
      buscarSerieBCB(SERIES_BCB.capitalGiroAte365Dias, 1),
      buscarSerieBCB(SERIES_BCB.capitalGiroAcima365Dias, 1),
      buscarSerieBCB(SERIES_BCB.capitalGiroRotativo, 1),
      buscarSerieBCB(SERIES_BCB.taxaPJTotal, 1),
      buscarSerieBCB(SERIES_BCB.chequeEspecialPJ, 1).catch(() => []), // fallback se código mudar
    ]);

  return {
    fonte: "Banco Central do Brasil - SGS",
    atualizadoEm: new Date().toISOString(),
    taxas: {
      capitalGiroAte365Dias: capGiroCurto[0] ?? null,
      capitalGiroAcima365Dias: capGiroLongo[0] ?? null,
      capitalGiroRotativo: capGiroRotativo[0] ?? null,
      taxaPJTotal: taxaTotal[0] ?? null,
      chequeEspecialPJ: chequeEspecial[0] ?? null,
    },
  };
}

// Permite rodar `npm run test:bcb` para conferir que a integração funciona
if (require.main === module) {
  montarBenchmarkAtual()
    .then((res) => console.log(JSON.stringify(res, null, 2)))
    .catch((err) => console.error(err));
}
