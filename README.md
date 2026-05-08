# GPM Intelligence Frontend

Para Group Product Managers e Product Owners.
O GPM Intelligence cruza seus OKRs, portfólio, métricas de agilidade e sinais de mercado — e entrega toda semana uma análise estratégica pronta, com riscos identificados e pauta gerada.

## Stack

* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **UI**: React 18 + Tailwind CSS
* **Database**: Supabase
* **Workflow**: N8N
* **File Parsing**: XLSX + PapaParse
* **Date Handling**: date-fns

## Estrutura do Projeto

```
/app
  /page.tsx                    → Redireciona para /dashboard
  /dashboard
    /page.tsx                  → Página principal
  /api
    /carga/work-items/route.ts → Proxy para N8N (Work Items)
    /carga/okrs/route.ts       → Proxy para N8N (OKRs)
    /carga/agilidade/route.ts  → Proxy para N8N (Agilidade)
    /rodar-analise/route.ts    → Inicia análise
    /status-blocos/route.ts    → Status dos blocos
    /historico/route.ts        → Lista análises anteriores
    /analise/\[semana]/route.ts → Busca análise específica
    /analise/status/\[job\_id]/route.ts → Status do job de análise

/components
  /BlocoUpload.tsx             → Componente reutilizável de upload
  /PainelStatus.tsx            → Painel de controle
  /RelatorioEmbed.tsx          → Renderização do relatório

/lib
  /supabase.ts                 → Cliente Supabase
  /parseFile.ts                → Leitura de CSV/Excel
  /semanaRef.ts                → Utilidades de data
  /types.ts                    → Tipos TypeScript
```

## Setup

### 1\. Variáveis de Ambiente

Crie um arquivo `.env.local` com as seguintes variáveis:

```bash
# Supabase
NEXT\_PUBLIC\_SUPABASE\_URL=https://seu-projeto.supabase.co
NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY=sua-chave-anonima
SUPABASE\_SERVICE\_KEY=sua-chave-service

# N8N Webhooks (substitua pelas URLs reais)
N8N\_WORK\_ITEMS\_WEBHOOK=https://seu-n8n/webhook/work-items
N8N\_OKRS\_WEBHOOK=https://seu-n8n/webhook/okrs
N8N\_AGILIDADE\_WEBHOOK=https://seu-n8n/webhook/agilidade
N8N\_RODAR\_ANALISE\_WEBHOOK=https://seu-n8n/webhook/rodar-analise
```

### 2\. Instalar Dependências

```bash
npm install
```

### 3\. Executar em Desenvolvimento

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Funcionalidades

### Dashboard Principal

* **Seletor de semana**: Navegação entre semanas com botões ← →
* **Painel de controle** (esquerda):

  * 5 blocos de status (OKRs, Work Items, Agilidade, CAPEX/OPEX, Clipping)
  * Upload de arquivos CSV/XLSX
  * Campos numéricos para CAPEX/OPEX
  * Botão "Rodar Análise" com spinner e mensagens rotativas
  * Histórico de análises anteriores
* **Área do relatório** (direita):

  * Renderização do HTML da análise via iframe
  * Botão "Exportar PDF" (usa window.print())
  * Botão "Resumo Mensal" (aparece quando há 4 análises no mês)
  * Estado vazio quando não há análise

### Upload de Dados

1. Usuário seleciona arquivo (.xlsx ou .csv)
2. Frontend processa o arquivo localmente
3. Dados são enviados para API Route Next.js
4. API Route envia para webhook N8N
5. N8N processa e salva no Supabase
6. Frontend atualiza status dos blocos

### Análise

1. Usuário clica "Rodar Análise"
2. Frontend faz POST em `/api/rodar-analise`
3. API inicia job em N8N
4. Frontend faz polling em `/api/analise/status/\[job\_id]` a cada 5s
5. Quando concluído, busca resultado em `/api/analise/\[semana]`
6. Renderiza HTML do relatório

## Requisitos do Supabase

O projeto espera as seguintes tabelas/views:

* `weekly\_analyses`: Análises semanais com `semana\_ref` e `html\_output`
* `v\_blocos\_status`: View com status dos 5 blocos
* `analysis\_jobs`: Rastreamento de jobs de análise

## Deploy

### Vercel

```bash
npm run build
vercel deploy
```

### Variáveis de Ambiente no Vercel

Defina as mesmas variáveis de `.env.local` nas configurações do projeto no Vercel.

## Desenvolvimento

### Adicionar novo componente

```typescript
// /components/NovoComponente.tsx
'use client'

import { useState } from 'react'

export function NovoComponente() {
  const \[state, setState] = useState(false)
  
  return (
    <div>
      {/\* Seu componente \*/}
    </div>
  )
}
```

### Adicionar novo endpoint API

```typescript
// /app/api/novo-endpoint/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // Sua lógica aqui
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro' }, { status: 500 })
  }
}
```

## Notas Importantes

* ✅ Credenciais do Supabase nunca são expostas no cliente (usam API Routes com service\_key)
* ✅ Uploads de arquivo são processados localmente antes de enviar
* ✅ Polling com timeout previne travamentos indefinidos
* ✅ Print/PDF usa window.print() para compatibilidade máxima
* ✅ Acessibilidade mínima: labels, contraste, feedback visual

## Troubleshooting

**Erro: "N8N webhook not configured"**

* Verifique as variáveis de ambiente em `.env.local`

**Arquivo não envia**

* Verifique se é CSV ou XLSX
* Verifique o console do browser para erros

**Análise não completa**

* Revise os logs do N8N
* Verifique conexão com Supabase
* Aumente o timeout se necessário

## Licença

HouseFlow.ia.br - 2026

