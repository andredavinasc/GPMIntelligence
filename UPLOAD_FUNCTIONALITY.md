# 📤 Funcionalidade de Upload - Documentação Completa

## Visão Geral

Implementação completa do fluxo de upload de dados para todos os 4 blocos de dados (OKRs, Work Items, Agilidade, CAPEX/OPEX).

---

## 🔄 Fluxo de Upload

```
┌─────────────────┐
│  Usuário        │
│  Seleciona      │
│  Arquivo        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  BlocoUpload.tsx                    │
│  - Valida tipo (CSV/Excel)          │
│  - Parse local com xlsx/papaparse   │
│  - Retorna array de objetos JSON    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  PainelStatus.tsx (Handler)         │
│  - Chama uploadOKRs/Work/Agilidade  │
│  - Envia para API Route             │
│  - Espera resposta                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  API Route (/api/carga/*)           │
│  - Valida dados                     │
│  - Envia para N8N webhook           │
│  - OU insere direto (CAPEX/OPEX)    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  N8N / Supabase                     │
│  - Processa dados                   │
│  - Grava no Supabase com payload    │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Dashboard                          │
│  - Faz refresh automático           │
│  - Mostra novos registros           │
└─────────────────────────────────────┘
```

---

## 📁 Arquivos Principais

### **1. `components/BlocoUpload.tsx`**
Componente reutilizável que:
- Abre diálogo de seleção de arquivo
- Valida tipo (CSV/XLSX)
- Parse local do arquivo
- Chama callback `onUpload(data)`
- Mostra erro se necessário

```typescript
interface BlocoUploadProps {
  titulo: string
  badge: 'Mensal' | 'Semanal' | 'Automático'
  ultimaAtualizacao: Date | null
  totalRegistros: number
  onUpload: (data: Record<string, unknown>[]) => Promise<void>
  loading: boolean
  readonly?: boolean
}
```

### **2. `components/PainelStatus.tsx`**
Implementa handlers para cada tipo de upload:

```typescript
// OKRs Handler
onUpload={async (data) => {
  try {
    const result = await uploadOKRs(data, formatDate(semanaRef))
    if (!result.success) throw new Error(result.message)
    await onRefresh()
  } catch (err) {
    setError(...)
  }
}}
```

### **3. `lib/uploadHandlers.ts`**
Funções de upload reutilizáveis:

```typescript
export async function uploadOKRs(
  data: Record<string, unknown>[],
  semanaRef: string
): Promise<UploadResponse>

export async function uploadWorkItems(...)
export async function uploadAgilidade(...)
export async function uploadCapexOpex(...)
```

### **4. API Routes**

| Route | Method | Função |
|-------|--------|--------|
| `/api/carga/okrs` | POST | Upload de OKRs → N8N |
| `/api/carga/work-items` | POST | Upload de Work Items → N8N |
| `/api/carga/agilidade` | POST | Upload de Agilidade → N8N |
| `/api/carga/capex-opex` | POST | Salva CAPEX/OPEX direto no Supabase |

---

## 🔧 Detalhes de Cada Upload

### **OKRs Upload**

**Arquivo esperado:**
```csv
Título,Meta,Atual,Peso
Aumentar cobertura,85,78,40
Reduzir onboarding,5,7,60
```

**Fluxo:**
1. Usuário clica "Upload .xlsx" no bloco OKRs
2. Seleciona arquivo CSV/Excel
3. Frontend faz parse → array JSON
4. POST `/api/carga/okrs` com:
   ```json
   {
     "data": [
       { "Título": "Aumentar cobertura", "Meta": 85, ... },
       { "Título": "Reduzir onboarding", "Meta": 5, ... }
     ],
     "semana_ref": "2025-06-16"
   }
   ```
5. API envia para N8N webhook `N8N_OKRS_WEBHOOK`
6. N8N processa e insere em `okrs` table com payload:
   ```json
   {
     "semana_ref": "2025-06-16",
     "inserted_at": "2025-06-16T10:30:00Z",
     "fonte": "azure_devops",
     "payload": [ ... dados do CSV ... ]
   }
   ```
7. Dashboard refresh mostra novo total

**Resposta esperada:**
```json
{
  "success": true,
  "message": "3 OKRs sent for processing"
}
```

---

### **Work Items Upload**

**Arquivo esperado:**
```csv
ID,Tipo,Título,Status,Sprint
WI-001,US,Feature X,Em Progresso,Sprint 1
WI-002,Épico,Plataforma Digital,Em Progresso,2025-Q2
```

**Fluxo:**
1. Similar ao OKRs
2. POST `/api/carga/work-items`
3. N8N envia para `work_items` table
4. Payload contém hierarquia: iniciativa > release > épico > US

---

### **Agilidade Upload**

**Arquivo esperado:**
```csv
Métrica,Valor,Data
Cycle Time,12.5 dias,2025-06-16
Lead Time,18.3 dias,2025-06-16
Throughput,42 items,2025-06-16
Bloqueios,3,2025-06-16
```

**Fluxo:**
1. POST `/api/carga/agilidade`
2. Insere em `agility_data` table
3. Payload:
   ```json
   {
     "cycle_time": 12.5,
     "lead_time": 18.3,
     "throughput": 42,
     "bloqueios": 3
   }
   ```

---

### **CAPEX/OPEX Save**

**Diferente dos outros** - não usa arquivo, usa campos numéricos:

**Fluxo:**
1. Usuário ajusta sliders CAPEX/OPEX
2. Validação inline: `CAPEX + OPEX = 100%`
3. Clica "Salvar"
4. POST `/api/carga/capex-opex` com:
   ```json
   {
     "capex_pct": 75.50,
     "opex_pct": 24.50,
     "semana_ref": "2025-06-16"
   }
   ```
5. **DIRETO** no Supabase (sem N8N):
   ```sql
   INSERT INTO capex_opex (semana_ref, capex_pct, opex_pct)
   VALUES ('2025-06-16', 75.50, 24.50)
   ```
6. Resposta:
   ```json
   {
     "success": true,
     "message": "CAPEX/OPEX data saved successfully"
   }
   ```

---

## 🎯 Resposta Padrão da API

Todos os endpoints retornam:

```typescript
interface UploadResponse {
  success: boolean          // true se OK, false se erro
  message: string          // Descrição do resultado
  jobId?: string          // Opcional: ID do job N8N
}
```

**Sucesso:**
```json
{
  "success": true,
  "message": "5 work items sent for processing"
}
```

**Erro:**
```json
{
  "success": false,
  "message": "Invalid data format. Expected array."
}
```

---

## ⚙️ Variáveis de Ambiente Necessárias

```bash
# N8N Webhooks (para OKRs, Work Items, Agilidade)
N8N_OKRS_WEBHOOK=https://seu-n8n/webhook/okrs
N8N_WORK_ITEMS_WEBHOOK=https://seu-n8n/webhook/work-items
N8N_AGILIDADE_WEBHOOK=https://seu-n8n/webhook/agilidade

# Supabase (para CAPEX/OPEX direto)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-chave-service
```

---

## 🧪 Testando o Upload

### **Teste Local (sem N8N)**

1. **Configure CAPEX/OPEX** (funciona sem N8N):
   ```bash
   npm run dev
   # Vá para http://localhost:3000/dashboard
   # No bloco CAPEX/OPEX:
   # - Ajuste CAPEX para 75 e OPEX para 25
   # - Clique "Salvar"
   # - Deve ver "✓ CAPEX/OPEX data saved successfully"
   ```

2. **Teste arquivo CSV** (Com N8N configurado):
   - Crie arquivo `test.csv`:
     ```csv
     Título,Target,Atual
     OKR 1,100,85
     OKR 2,50,48
     ```
   - Upload no bloco OKRs
   - Verifique se N8N recebeu a requisição

### **Verificar Dados no Supabase**

```sql
-- Verificar uploads de OKRs
SELECT COUNT(*), max(inserted_at) FROM okrs WHERE semana_ref = '2025-06-16';

-- Verificar uploads de Work Items
SELECT COUNT(*), max(inserted_at) FROM work_items WHERE semana_ref = '2025-06-16';

-- Verificar CAPEX/OPEX
SELECT * FROM capex_opex WHERE semana_ref = '2025-06-16';
```

---

## 🛡️ Validações Implementadas

| Tipo | Validação | Onde |
|------|-----------|------|
| **Arquivo** | Tipo: CSV ou XLSX | BlocoUpload |
| **Arquivo** | Array JSON válido | BlocoUpload |
| **CAPEX/OPEX** | Soma = 100% | PainelStatus |
| **CAPEX/OPEX** | Números positivos | BlocoUpload |
| **API** | semana_ref obrigatório | API Route |
| **API** | data array válido | API Route |
| **Supabase** | semana_ref é date | Constraint DB |

---

## 🚨 Tratamento de Erros

```typescript
// Erro ao fazer parse do arquivo
"Erro ao processar arquivo"
// Causas: tipo inválido, arquivo corrompido, encoding errado

// Erro da API
"N8N error: [mensagem]"
// Causa: N8N webhook não configurado ou indisponível

// Erro de validação CAPEX/OPEX
"CAPEX + OPEX deve = 100% (atual: 95%)"
// Causa: Soma dos percentuais incorreta

// Erro ao atualizar dashboard
"Erro ao carregar status dos blocos"
// Causa: Supabase indisponível
```

---

## 📊 Estrutura do Payload no Supabase

Todos os dados são armazenados com esta estrutura:

```typescript
{
  id: uuid,                    // Chave primária
  semana_ref: date,           // Segunda-feira da semana
  inserted_at: timestamptz,   // Quando foi inserido
  fonte: text,                // 'azure_devops', 'agilidade', etc
  payload: jsonb              // Array com dados do CSV/form
}
```

**Exemplo payload OKRs:**
```json
{
  "payload": [
    {
      "Título": "Aumentar cobertura",
      "Meta": 85,
      "Atual": 78,
      "Peso": 40
    },
    {
      "Título": "Reduzir onboarding",
      "Meta": 5,
      "Atual": 7,
      "Peso": 60
    }
  ]
}
```

---

## 🔐 Segurança

✅ **Credenciais protegidas:**
- N8N webhook URL em variáveis de ambiente
- Supabase service_key nunca expostos no cliente
- API Routes fazem proxy da requisição

✅ **Validação de dados:**
- Tipo de arquivo validado
- Array JSON validado
- semana_ref obrigatório

✅ **Supabase RLS:**
- Service role tem acesso completo
- Políticas RLS habilitadas em todas as tabelas

---

## 📈 Fluxo de Análise Pós-Upload

Após cada upload:

1. ✅ Dados salvos no Supabase
2. ✅ Dashboard refresh automático
3. ✅ Blocos mostram novos registros
4. ✅ Usuário pode "Rodar Análise"
5. ✅ N8N (3 agentes) processa dados
6. ✅ Relatório HTML gerado
7. ✅ Mostrado no painel direito

---

## ✨ Próximos Passos

1. **Configure variáveis de ambiente** com URLs do N8N
2. **Configure N8N webhooks** para receber dados
3. **Teste upload de CAPEX/OPEX** primeiro (não precisa N8N)
4. **Teste uploads de arquivos** com dados de teste
5. **Roda análise** após ter dados em todos os blocos

**Pronto para usar!** 🚀
