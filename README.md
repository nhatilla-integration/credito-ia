# credito-ia

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)

![Demonstração do dashboard credito-ia](docs/demo.gif)

Agente de IA que analisa a estrutura de crédito de uma empresa (PJ), compara as taxas que ela paga com os benchmarks oficiais do Banco Central e sugere trocas de produtos de crédito para reduzir custo financeiro e melhorar o caixa.

## Stack

- **Backend:** Node.js, TypeScript, Express
- **IA:** Claude API (Anthropic SDK)
- **Dados externos:** API SGS do Banco Central (taxas médias de mercado) e API do Omie ERP (contas a pagar)
- **Frontend:** HTML, CSS e JavaScript puro, servido pelo próprio Express

## Funcionalidades

- Busca em tempo real as taxas médias de crédito PJ no Banco Central (capital de giro, rotativo, cheque especial)
- Monta o "mapa de crédito" da empresa (dívidas, taxas, prazos, garantias) a partir dos dados do ERP
- Compara cada produto de crédito com o benchmark de mercado, usando taxa anual por juros compostos
- Gera, via Claude, uma análise em Markdown com recomendações de troca (ex.: cheque especial → capital de giro, CDC → FINAME) e economia estimada
- O modelo não inventa taxas: raciocina só sobre os dados recebidos e pergunta quando falta informação
- Dashboard em estilo "extrato bancário" com recomendações, plano de ação e dados do Omie (com fallback para dados de exemplo)
- Endpoints de depuração que montam o contexto completo sem consumir crédito da API

### Arquitetura

```
ERP (Omie / mock)  ──┐
                      ├──► Claude API (raciocínio) ──► Análise em Markdown ──► Dashboard
BCB SGS API (real) ──┘
```

O prompt do agente fica em [`src/prompts/systemPrompt.ts`](src/prompts/systemPrompt.ts).

## Como rodar localmente

Pré-requisito: Node.js 18+.

```bash
# 1. Clonar e instalar dependências
git clone https://github.com/nhatilla-integration/credito-ia.git
cd credito-ia
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ANTHROPIC_API_KEY` | Só para `/api/analise-credito` | Chave em [console.anthropic.com](https://console.anthropic.com) |
| `PORT` | Não (padrão `3000`) | Porta do servidor |
| `OMIE_APP_KEY` / `OMIE_APP_SECRET` | Não | Credenciais do Omie; sem elas o dashboard usa dados de exemplo |

```bash
# 3. (Opcional) Testar só a integração com o Banco Central, sem API key
npm run test:bcb

# 4. Subir o servidor em modo dev
npm run dev
# Dashboard: http://localhost:3000

# Build de produção
npm run build && npm start
```

### Endpoints

| Método | Rota | O que faz |
|---|---|---|
| GET | `/api/benchmark` | Taxas médias atuais do Banco Central |
| POST | `/api/analise-credito` | Pipeline completo (ERP + BCB → Claude). Body: `{ "cnpj": "...", "pergunta": "..." }` |
| GET | `/api/debug-contexto?cnpj=...` | Retorna o JSON que seria enviado ao Claude, sem custo de API |
| GET | `/api/debug-omie` | Retorno cru do Omie (`ListarContasPagar`) |

## Links

- **Deploy:** _ainda não publicado_
- **Repositório:** https://github.com/nhatilla-integration/credito-ia

## Próximos passos

- [x] Integração real com a API SGS do Banco Central
- [x] Prompt do agente validado com cenários de teste (transportadora e importadora)
- [x] Dashboard web servido pelo backend
- [ ] Substituir o mock do ERP pela integração completa com Omie ou ContaAzul
- [ ] Integrar Open Finance (ex.: Pluggy) para trazer extratos e contratos bancários reais
- [ ] Migrar o frontend para React + Tailwind
- [ ] Persistir histórico de análises em PostgreSQL
- [ ] Criptografia em repouso e acesso mínimo aos dados sensíveis (LGPD) antes de produção
