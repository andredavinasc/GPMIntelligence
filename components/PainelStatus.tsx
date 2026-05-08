'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Play, LogOut } from 'lucide-react'
import { BlocoUpload } from './BlocoUpload'
import { formatDate, formatDateTime, getMondayOfWeek } from '@/lib/semanaRef'
import { BlocoStatus } from '@/lib/types'
import { uploadOKRs, uploadWorkItems, uploadAgilidade, uploadCapexOpex } from '@/lib/uploadHandlers'
import { useAuth } from '@/lib/authContext'

const LOADING_MESSAGES = [
  'Analisando portfólio e fluxo Kanban...',
  'Avaliando progresso dos OKRs...',
  'Cruzando dados de mercado...',
  'Gerando relatório executivo...',
]

interface PainelStatusProps {
  semanaRef: Date
  blocos: BlocoStatus[]
  onAnalysisStart: () => Promise<void>
  onRefresh: () => Promise<void>
  analysisLoading: boolean
  analysisCompleted: boolean
}

export function PainelStatus({
  semanaRef,
  blocos,
  onAnalysisStart,
  onRefresh,
  analysisLoading,
  analysisCompleted,
}: PainelStatusProps) {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [messageIndex, setMessageIndex] = useState(0)

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer logout')
    }
  }

  useEffect(() => {
    if (!analysisLoading) return

    const interval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % LOADING_MESSAGES.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [analysisLoading])

  const handleAnalysis = async () => {
    setError(null)
    try {
      await onAnalysisStart()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar análise')
    }
  }

  const getBlocoByNome = (nome: string): BlocoStatus | undefined => {
    return blocos.find((b) => b.bloco === nome)
  }

  const workItemsBloco = getBlocoByNome('work_items')
  const capexOpexBloco = getBlocoByNome('capex_opex')
  const canAnalyze = workItemsBloco && capexOpexBloco && (workItemsBloco.total_registros ?? 0) > 0 && (capexOpexBloco.total_registros ?? 0) > 0

  return (
    <div className="h-auto lg:h-full bg-white rounded-lg shadow-sm p-3 sm:p-4 overflow-y-auto flex flex-col">
      <div className="mb-4 sm:mb-6 flex-1">
        <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 sm:mb-3">
          DADOS DA SEMANA
        </h2>

        <BlocoUpload
          titulo="OKRs"
          badge="Mensal"
          ultimaAtualizacao={getBlocoByNome('okrs')?.ultima_atualizacao ? new Date(getBlocoByNome('okrs')!.ultima_atualizacao) : null}
          totalRegistros={getBlocoByNome('okrs')?.total_registros || 0}
          onUpload={async (data) => {
            try {
              const result = await uploadOKRs(data, semanaRef)
              if (!result.success) throw new Error(result.message)
              await onRefresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Erro ao fazer upload de OKRs')
            }
          }}
          loading={analysisLoading}
        />

        <BlocoUpload
          titulo="Work Items (DevOps)"
          badge="Semanal"
          ultimaAtualizacao={getBlocoByNome('work_items')?.ultima_atualizacao ? new Date(getBlocoByNome('work_items')!.ultima_atualizacao) : null}
          totalRegistros={getBlocoByNome('work_items')?.total_registros || 0}
          onUpload={async (data) => {
            try {
              const result = await uploadWorkItems(data, semanaRef)
              if (!result.success) throw new Error(result.message)
              await onRefresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Erro ao fazer upload de Work Items')
            }
          }}
          loading={analysisLoading}
        />

        <BlocoUpload
          titulo="Dados de Agilidade"
          badge="Semanal"
          ultimaAtualizacao={getBlocoByNome('agility_data')?.ultima_atualizacao ? new Date(getBlocoByNome('agility_data')!.ultima_atualizacao) : null}
          totalRegistros={getBlocoByNome('agility_data')?.total_registros || 0}
          onUpload={async (data) => {
            try {
              const result = await uploadAgilidade(data, semanaRef)
              if (!result.success) throw new Error(result.message)
              await onRefresh()
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Erro ao fazer upload de Agilidade')
            }
          }}
          loading={analysisLoading}
        />

        <CapexOpexBloco semanaRef={semanaRef} />

        <BlocoUpload
          titulo="Clipping"
          badge="Automático"
          ultimaAtualizacao={getBlocoByNome('clipping')?.ultima_atualizacao ? new Date(getBlocoByNome('clipping')!.ultima_atualizacao) : null}
          totalRegistros={getBlocoByNome('clipping')?.total_registros || 0}
          onUpload={async () => {}}
          loading={false}
          readonly={true}
        />
      </div>

      <div className="space-y-3 mb-3">
        <button
          onClick={handleAnalysis}
          disabled={!canAnalyze || analysisLoading}
          title={!canAnalyze ? 'Carregue os dados de Work Items e CAPEX/OPEX para rodar a análise' : ''}
          className="w-full py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Play size={16} fill="white" />
          {analysisLoading ? LOADING_MESSAGES[messageIndex] : 'RODAR ANÁLISE'}
        </button>

        {analysisLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded p-2">
            <p className="text-xs text-blue-700">Pode levar 1-2 minutos para processar...</p>
          </div>
        )}

        {analysisCompleted && (
          <div className="bg-green-50 border border-green-200 rounded p-2">
            <p className="text-xs text-green-700">✓ Análise gerada às {formatDateTime(new Date())}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>

      <div className="border-t pt-3 mt-auto">
        <div className="flex items-center justify-between">
          <div>
            {user && (
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="Fazer logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface CapexOpexBlocoProps {
  semanaRef: Date
}

function CapexOpexBloco({ semanaRef }: CapexOpexBlocoProps) {
  const [capex, setCapex] = useState(75)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const opex = 100 - capex

  const handleCapexChange = (value: number) => {
    setCapex(value)
    setSuccess(false)
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await uploadCapexOpex(capex, opex, semanaRef)
      if (!result.success) throw new Error(result.message)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving CAPEX/OPEX:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
      <div className="mb-3">
        <h3 className="font-semibold text-sm text-gray-800">CAPEX / OPEX</h3>
        <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded inline-block mt-1">
          SEMANAL
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-gray-700">Distribuição</label>
          <p className="text-xs text-gray-600">Meta: 80% CAPEX / 20% OPEX</p>
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="range"
              min="0"
              max="100"
              value={capex}
              onChange={(e) => handleCapexChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-700"
            />
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                <span className="text-gray-600">CAPEX</span>
              </div>
              <p className="text-2xl font-bold text-green-700">{capex}%</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                <span className="text-gray-600">OPEX</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{opex}%</p>
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden flex">
            <div
              style={{ width: `${capex}%` }}
              className="bg-green-700 transition-all duration-200"
            ></div>
            <div
              style={{ width: `${opex}%` }}
              className="bg-blue-600 transition-all duration-200"
            ></div>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
          <p className="text-xs text-green-700">✓ CAPEX/OPEX salvo com sucesso</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-3 py-2 bg-green-700 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded text-sm font-medium transition-colors"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  )
}

function HistoricoItem({ semana, status }: { semana: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
      <div className="flex items-center gap-2">
        <span className="text-green-600">✓</span>
        <span className="text-sm text-gray-700">{semana}</span>
      </div>
      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">Ver</button>
    </div>
  )
}
