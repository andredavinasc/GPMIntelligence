import { SchemaMappingRecord, TipoCarga, ResultadoDeteccao, StatusDados } from './types/mapeamento'
import { detectarCampo, extrairColunasDoPayload } from './fieldDictionary'

/**
 * Carrega o mapeamento salvo para um tipo de carga
 */
export async function carregarMapeamento(tipoCarga: TipoCarga): Promise<Record<string, string> | null> {
  try {
    const response = await fetch(`/api/mapeamento?tipo=${tipoCarga}`)
    if (!response.ok) return null

    const data: SchemaMappingRecord = await response.json()
    return data.mapeamento || null
  } catch (error) {
    console.error('Erro ao carregar mapeamento:', error)
    return null
  }
}

/**
 * Salva o mapeamento no Supabase
 */
export async function salvarMapeamento(
  tipoCarga: TipoCarga,
  mapeamento: Record<string, string>
): Promise<SchemaMappingRecord | null> {
  try {
    const response = await fetch('/api/mapeamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipoCarga, mapeamento }),
    })

    if (!response.ok) {
      throw new Error('Erro ao salvar mapeamento')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao salvar mapeamento:', error)
    throw error
  }
}

/**
 * Detecta automaticamente o mapeamento analisando os dados
 */
export async function detectarAutomaticamente(tipoCarga: TipoCarga): Promise<ResultadoDeteccao | null> {
  try {
    const response = await fetch(`/api/detectar-campos?tipo=${tipoCarga}`)

    if (!response.ok) {
      throw new Error('Erro ao detectar campos')
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao detectar automaticamente:', error)
    return null
  }
}

/**
 * Verifica se há dados disponíveis para um tipo de carga
 */
export async function verificarStatusDados(tipoCarga: TipoCarga): Promise<StatusDados> {
  try {
    const response = await fetch(`/api/status-dados?tipo=${tipoCarga}`)

    if (!response.ok) {
      return { temDados: false }
    }

    return await response.json()
  } catch (error) {
    console.error('Erro ao verificar status dos dados:', error)
    return { temDados: false }
  }
}

/**
 * Processa a detecção do lado do cliente (útil para cache/offline)
 */
export function processarDeteccaoLocal(
  payload: Record<string, unknown>[]
): { sugestoes: Record<string, { valor: string; confianca: number }>; colunasEncontradas: string[] } {
  const colunasEncontradas = extrairColunasDoPayload(payload)
  const sugestoes: Record<string, { valor: string; confianca: number }> = {}

  colunasEncontradas.forEach((coluna) => {
    const deteccao = detectarCampo(coluna)
    if (deteccao) {
      sugestoes[deteccao.campo] = {
        valor: coluna,
        confianca: deteccao.confianca,
      }
    }
  })

  return { sugestoes, colunasEncontradas }
}
