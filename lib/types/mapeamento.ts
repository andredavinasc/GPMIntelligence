export type TipoCarga = 'okrs' | 'work_items' | 'agilidade'

export interface CampoDefinicao {
  nome_canonico: string
  label: string
  obrigatorio: boolean
  descricao: string
}

export interface SchemaMappingRecord {
  id: string
  tenant_id: string
  tipo_carga: TipoCarga
  mapeamento: Record<string, string>
  created_at: string
  updated_at: string
}

export interface DeteccaoAutomatica {
  campo: string
  coluna: string
  confianca: number
}

export interface ResultadoDeteccao {
  sugestoes: Record<string, { valor: string; confianca: number }>
  colunasEncontradas: string[]
}

export interface StatusDados {
  temDados: boolean
  ultimaCarga?: {
    tipo: TipoCarga
    linhas: number
    data: string
  }
}
