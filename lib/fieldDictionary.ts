import { CampoDefinicao, TipoCarga } from './types/mapeamento'

export const CAMPOS_OKRS: Record<string, CampoDefinicao> = {
  id: {
    nome_canonico: 'id',
    label: 'ID',
    obrigatorio: true,
    descricao: 'Identificador único do OKR',
  },
  parent_id: {
    nome_canonico: 'parent_id',
    label: 'Parent',
    obrigatorio: true,
    descricao: 'ID do item pai na hierarquia',
  },
  tipo: {
    nome_canonico: 'tipo',
    label: 'Tipo de Item',
    obrigatorio: true,
    descricao: 'Tipo de item (Objetivo, Resultado-Chave, etc)',
  },
  titulo: {
    nome_canonico: 'titulo',
    label: 'Título',
    obrigatorio: true,
    descricao: 'Título ou nome do OKR',
  },
  estado: {
    nome_canonico: 'estado',
    label: 'Estado',
    obrigatorio: false,
    descricao: 'Estado do OKR (Ativo, Pausado, etc)',
  },
  area: {
    nome_canonico: 'area',
    label: 'Área',
    obrigatorio: false,
    descricao: 'Área ou departamento responsável',
  },
  descricao: {
    nome_canonico: 'descricao',
    label: 'Descrição',
    obrigatorio: false,
    descricao: 'Descrição detalhada do OKR',
  },
  atual: {
    nome_canonico: 'atual',
    label: 'Valor Atual',
    obrigatorio: false,
    descricao: 'Valor atual do progresso',
  },
  meta_t1: {
    nome_canonico: 'meta_t1',
    label: 'Meta 1º Trimestre',
    obrigatorio: false,
    descricao: 'Meta para o 1º trimestre',
  },
  meta_t2: {
    nome_canonico: 'meta_t2',
    label: 'Meta 2º Trimestre',
    obrigatorio: false,
    descricao: 'Meta para o 2º trimestre',
  },
  meta_t3: {
    nome_canonico: 'meta_t3',
    label: 'Meta 3º Trimestre',
    obrigatorio: false,
    descricao: 'Meta para o 3º trimestre',
  },
  meta_t4: {
    nome_canonico: 'meta_t4',
    label: 'Meta 4º Trimestre',
    obrigatorio: false,
    descricao: 'Meta para o 4º trimestre',
  },
}

export const CAMPOS_WORK_ITEMS: Record<string, CampoDefinicao> = {
  id: {
    nome_canonico: 'id',
    label: 'ID',
    obrigatorio: true,
    descricao: 'Identificador único do Work Item',
  },
  parent_id: {
    nome_canonico: 'parent_id',
    label: 'Parent',
    obrigatorio: true,
    descricao: 'ID do item pai na hierarquia',
  },
  tipo: {
    nome_canonico: 'tipo',
    label: 'Tipo de Item',
    obrigatorio: true,
    descricao: 'Tipo de Work Item (Epic, Story, Task, etc)',
  },
  titulo: {
    nome_canonico: 'titulo',
    label: 'Título',
    obrigatorio: true,
    descricao: 'Título ou nome do Work Item',
  },
  estado: {
    nome_canonico: 'estado',
    label: 'Estado',
    obrigatorio: false,
    descricao: 'Estado do item (New, Active, Done, etc)',
  },
  area: {
    nome_canonico: 'area',
    label: 'Área',
    obrigatorio: false,
    descricao: 'Área ou equipe responsável',
  },
  descricao: {
    nome_canonico: 'descricao',
    label: 'Descrição',
    obrigatorio: false,
    descricao: 'Descrição detalhada do Work Item',
  },
  semestre: {
    nome_canonico: 'semestre',
    label: 'Semestre/Roadmap',
    obrigatorio: false,
    descricao: 'Semestre ou período do roadmap',
  },
  problema: {
    nome_canonico: 'problema',
    label: 'Problema da Iniciativa',
    obrigatorio: false,
    descricao: 'Qual problema esta iniciativa resolve',
  },
  capex_opex_pre: {
    nome_canonico: 'capex_opex_pre',
    label: 'CAPEX/OPEX Pré-Comitê',
    obrigatorio: false,
    descricao: 'Classificação CAPEX/OPEX antes do comitê',
  },
  capex_opex_comite: {
    nome_canonico: 'capex_opex_comite',
    label: 'CAPEX/OPEX Comitê (Oficial)',
    obrigatorio: false,
    descricao: 'Classificação oficial CAPEX/OPEX do comitê',
  },
}

export const CAMPOS_AGILIDADE: Record<string, CampoDefinicao> = {
  equipe: {
    nome_canonico: 'equipe',
    label: 'Equipe',
    obrigatorio: true,
    descricao: 'Nome da equipe',
  },
  vazao: {
    nome_canonico: 'vazao',
    label: 'Vazão',
    obrigatorio: true,
    descricao: 'Quantidade de itens entregues',
  },
  lead_time_p85: {
    nome_canonico: 'lead_time_p85',
    label: 'Lead Time P85',
    obrigatorio: true,
    descricao: 'Lead time no percentil 85',
  },
  cycle_time_p85: {
    nome_canonico: 'cycle_time_p85',
    label: 'Cycle Time P85',
    obrigatorio: false,
    descricao: 'Cycle time no percentil 85',
  },
  variabilidade: {
    nome_canonico: 'variabilidade',
    label: 'Variabilidade',
    obrigatorio: false,
    descricao: 'Coeficiente de variação',
  },
  lead_time_p95: {
    nome_canonico: 'lead_time_p95',
    label: 'Lead Time P95',
    obrigatorio: false,
    descricao: 'Lead time no percentil 95',
  },
  cycle_time_p95: {
    nome_canonico: 'cycle_time_p95',
    label: 'Cycle Time P95',
    obrigatorio: false,
    descricao: 'Cycle time no percentil 95',
  },
}

export function getCamposParaTipo(tipo: TipoCarga): Record<string, CampoDefinicao> {
  switch (tipo) {
    case 'okrs':
      return CAMPOS_OKRS
    case 'work_items':
      return CAMPOS_WORK_ITEMS
    case 'agilidade':
      return CAMPOS_AGILIDADE
    default:
      return {}
  }
}

// Dictionary of known column name variations
const fieldVariations: Record<string, string[]> = {
  // OKRs + Work Items
  id: ['ID', 'id', 'Id', 'item_id', 'Item ID', 'ITEM_ID', 'Id do Item'],
  parent_id: ['Parent', 'parent', 'Parent ID', 'PARENT_ID', 'parent_id', 'ID do Pai'],
  tipo: ['Tipo de Item', 'Work Item Type', 'Type', 'tipo de item', 'Tipo', 'type', 'Item Type'],
  titulo: ['Título', 'Título 1', 'Title', 'Title 1', 'título', 'titulo', 'Name'],
  estado: ['Estado', 'State', 'Status', 'estado', 'status', 'State Name'],
  area: ['Área', 'Area Path', 'Caminho da Área', 'area', 'area path', 'Area', 'Caminho'],
  descricao: ['Descrição', 'Description', 'Desc', 'descricao', 'description'],
  semestre: ['Roadmap', 'AnoSemestreRoadmap', 'SemestreRoadmap', 'semestre', 'Semestre', 'Roadmap Item'],
  problema: ['ProblemaIniciativa', 'Problema', 'IniciativaQualProblema', 'problema', 'Qual Problema'],
  capex_opex_pre: ['Pré_Classificação_Despesas', 'Pre_Expense_Classification', 'pre_expense'],
  capex_opex_comite: ['Classificação_Despesas_Comitê', 'Committee_Expense_Classification', 'expense_classification'],
  atual: ['Atual', 'Current', 'Valor Atual', 'current', 'Value'],
  meta_t1: ['Meta 1º TRI', 'Target Q1', 'Meta 1º Trimestre', 'Target 1o TRI', 'Q1 Target'],
  meta_t2: ['Meta 2º TRI', 'Target Q2', 'Meta 2º Trimestre', 'Target 2o TRI', 'Q2 Target'],
  meta_t3: ['Meta 3º TRI', 'Target Q3', 'Meta 3º Trimestre', 'Target 3o TRI', 'Q3 Target'],
  meta_t4: ['Meta 4º TRI', 'Target Q4', 'Meta 4º Trimestre', 'Target 4o TRI', 'Q4 Target'],
  // Agilidade
  equipe: ['equipe', 'Equipe', 'Team', 'team', 'Team Name'],
  vazao: ['vazao', 'Vazão', 'Throughput', 'throughput', 'Velocity'],
  lead_time_p85: ['lead_time_p85', 'Lead Time P85', 'LT P85', 'lt_p85'],
  cycle_time_p85: ['cycle_time_p85', 'Cycle Time P85', 'CT P85', 'ct_p85'],
  variabilidade: ['variabilidade', 'Variabilidade', 'Variability', 'CV'],
  lead_time_p95: ['lead_time_p95', 'Lead Time P95', 'LT P95', 'lt_p95'],
  cycle_time_p95: ['cycle_time_p95', 'Cycle Time P95', 'CT P95', 'ct_p95'],
}

export function detectarCampo(nomeColuna: string): { campo: string; confianca: number } | null {
  const coluna = nomeColuna.toLowerCase().trim()

  for (const [campo, variacoes] of Object.entries(fieldVariations)) {
    const variacoesLower = variacoes.map((v) => v.toLowerCase())

    // Exact match = 100% confidence
    if (variacoesLower.includes(coluna)) {
      return { campo, confianca: 100 }
    }

    // Partial match (starts with or contains) = 85% confidence
    if (
      variacoesLower.some(
        (v) => coluna.startsWith(v.substring(0, 4)) || v.substring(0, 4).startsWith(coluna.substring(0, 4))
      )
    ) {
      return { campo, confianca: 85 }
    }
  }

  return null
}

export function extrairColunasDoPayload(payload: Record<string, unknown>[]): string[] {
  const colunas = new Set<string>()

  payload.forEach((row) => {
    if (!row) return

    // Handle row as array of objects or single object
    const rowArray = Array.isArray(row) ? row : [row]

    rowArray.forEach((item: any) => {
      if (item && typeof item === 'object') {
        Object.keys(item).forEach((key) => colunas.add(key))
      }
    })
  })

  return Array.from(colunas).sort()
}
