/**
 * Camada de dados do ERP (Etapa 1 do prompt: "Mapa de Crédito Atual").
 *
 * Por enquanto retorna um mock realista para você testar o pipeline
 * ponta a ponta. Na Fase 3, troque `buscarDadosERP` pela chamada real
 * à API do Omie/ContaAzul/Bling, mantendo o mesmo formato de retorno
 * (DadosEmpresa) para não precisar mexer no resto do sistema.
 */

import axios from "axios";

const OMIE_CONTAS_PAGAR_URL = "https://app.omie.com.br/api/v1/financas/contapagar/";

/**
 * Lista as contas a pagar cadastradas no Omie (Fase 3a).
 * Requer OMIE_APP_KEY e OMIE_APP_SECRET no .env (console.omie.com.br).
 */
export async function buscarContasPagarOmie(): Promise<any> {
  const appKey = process.env.OMIE_APP_KEY;
  const appSecret = process.env.OMIE_APP_SECRET;

  const { data } = await axios.post(OMIE_CONTAS_PAGAR_URL, {
    call: "ListarContasPagar",
    app_key: appKey,
    app_secret: appSecret,
    param: [
      {
        pagina: 1,
        registros_por_pagina: 50,
        apenas_importado_api: "N",
      },
    ],
  });

  return data;
}

export interface ProdutoCreditoAtual {
  produto: string;
  saldoDevedor: number;
  taxaMensal: number; // em %
  prazoRestanteMeses: number;
  carenciaMeses: number;
  banco: string;
  garantia: string;
  finalidade: string;
}

export interface DadosEmpresa {
  razaoSocial: string;
  cnpj: string;
  setor: string;
  faturamentoAnualMedio: number;
  prazoMedioPagamentoDias: number; // PMP
  prazoMedioRecebimentoDias: number; // PMR
  prazoMedioEstoqueDias?: number; // PME, se aplicável
  importaOuExporta: "nenhum" | "importa" | "exporta" | "ambos";
  produtosCreditoAtuais: ProdutoCreditoAtual[];
  despesasFinanceirasAnuais: number;
}

export async function buscarDadosERP(cnpj: string): Promise<DadosEmpresa> {
  // TODO Fase 3: substituir por chamada real, ex:
  // const { data } = await axios.get(`https://app.omie.com.br/api/v1/...`, {...})

  return {
    razaoSocial: "Transportadora Exemplo LTDA",
    cnpj,
    setor: "Transporte de cargas",
    faturamentoAnualMedio: 4_800_000,
    prazoMedioPagamentoDias: 30,
    prazoMedioRecebimentoDias: 55,
    importaOuExporta: "nenhum",
    despesasFinanceirasAnuais: 312_000,
    produtosCreditoAtuais: [
      {
        produto: "Cheque especial / LIS PJ",
        saldoDevedor: 180_000,
        taxaMensal: 11.5,
        prazoRestanteMeses: 0, // rotativo, sem prazo fixo
        carenciaMeses: 0,
        banco: "Banco A",
        garantia: "Nenhuma",
        finalidade: "Cobrir descasamento de caixa recorrente",
      },
      {
        produto: "CDC veículo (caminhão)",
        saldoDevedor: 420_000,
        taxaMensal: 1.9,
        prazoRestanteMeses: 36,
        carenciaMeses: 0,
        banco: "Banco B",
        garantia: "Alienação fiduciária do veículo",
        finalidade: "Compra de caminhão para frota própria",
      },
    ],
  };
}
