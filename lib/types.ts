export interface BlocoStatus {
  bloco: string
  ultima_atualizacao: string
  ultima_semana: string | null
  total_registros: number
}

export interface WeeklyAnalysis {
  id: string
  semana_ref: string
  semana_anterior_ref?: string | null
  inserted_at: string
  status?: string
  agente_produto?: string | null
  agente_estrategia?: string | null
  agente_agilidade?: string | null
  agente_mercado?: string | null
  narrativa_final?: string | null
  html_output?: string | null
}

export interface AnalysisJob {
  job_id: string
  status: 'processando' | 'concluido' | 'erro'
  semana_ref: string
}

export interface CapexOpex {
  capex_percentage: number
  opex_percentage: number
  meta_capex: number
  meta_opex: number
}

export interface UploadData {
  [key: string]: unknown
}

export interface Configuracao {
  id: string
  empresa: string
  setor: string
  nome: string
  objetivo: string
  created_at: string
  updated_at: string
}
