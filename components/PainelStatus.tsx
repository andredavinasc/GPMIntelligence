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
    <div className="h-auto lg:h-full bg-[#1a2e22] border-r border-[rgba(196,162,100,0.18)] rounded p-3 sm:p-4 overflow-y-auto flex flex-col">
      <div className="mb-4 sm:mb-6 flex-1">
        <h2 className="gpm-section-label mb-2 sm:mb-3">
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
          semanaRef={semanaRef}
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
          semanaRef={semanaRef}
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
          semanaRef={semanaRef}
        />

        <CapexOpexBloco semanaRef={semanaRef} />
      </div>

      <div className="space-y-3 mb-3">
        <button
          onClick={handleAnalysis}
          disabled={!canAnalyze || analysisLoading}
          title={!canAnalyze ? 'Carregue os dados de Work Items e CAPEX/OPEX para rodar a análise' : ''}
          className="w-full py-2 bg-[rgba(45,90,61,0.6)] hover:bg-[rgba(45,90,61,0.8)] disabled:bg-[rgba(250,248,243,0.1)] disabled:cursor-not-allowed text-[#7fc49a] disabled:text-[rgba(250,248,243,0.3)] font-bold border border-[rgba(45,90,61,0.8)] rounded transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Play size={16} fill="currentColor" />
          {analysisLoading ? LOADING_MESSAGES[messageIndex] : 'RODAR ANÁLISE'}
        </button>

        {analysisLoading && (
          <div className="bg-[rgba(196,162,100,0.1)] border border-[rgba(196,162,100,0.2)] rounded p-2">
            <p className="text-xs text-[#c4a264]">Pode levar 1-2 minutos para processar...</p>
          </div>
        )}

        {analysisCompleted && (
          <div className="bg-[rgba(45,90,61,0.2)] border border-[rgba(45,90,61,0.4)] rounded p-2">
            <p className="text-xs text-[#7fc49a]">✓ Análise gerada às {formatDateTime(new Date())}</p>
          </div>
        )}

        {error && (
          <div className="bg-[rgba(122,36,36,0.2)] border border-[rgba(122,36,36,0.4)] rounded p-2">
            <p className="text-xs text-[#fdf0f0]">{error}</p>
          </div>
        )}
      </div>

      <div className="border-t border-[rgba(196,162,100,0.12)] pt-3 mt-auto">
        <div className="flex items-center justify-between">
          <div>
            {user && (
              <p className="text-xs text-[rgba(250,248,243,0.4)] truncate">{user.email}</p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-[rgba(250,248,243,0.6)] hover:text-[rgba(250,248,243,1)] hover:bg-[rgba(250,248,243,0.05)] rounded transition-colors"
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
  const [configLoading, setConfigLoading] = useState(true)
  const [metaCapex, setMetaCapex] = useState(80)
  const [metaOpex, setMetaOpex] = useState(20)

  const opex = 100 - capex

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/configuracao')
        const data = await response.json()
        if (data) {
          setMetaCapex(data.objetivo_capex ?? 80)
          setMetaOpex(data.objetivo_opex ?? 20)
          setCapex(data.objetivo_capex ?? 80)
        }
      } catch (err) {
        console.error('Erro ao carregar configuração:', err)
      } finally {
        setConfigLoading(false)
      }
    }

    loadConfig()
  }, [])

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
    <div className="bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(196,162,100,0.18)] p-3 mb-3">
      <div className="mb-3">
        <h3 className="gpm-section-label">CAPEX / OPEX</h3>
        <span className="text-xs bg-[rgba(196,162,100,0.15)] text-[#c4a264] px-2 py-1 inline-block mt-1">
          SEMANAL
        </span>
      </div>

      <div className="mb-3">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-[rgba(250,248,243,0.5)]">Distribuição</label>
          {configLoading ? (
            <p className="text-xs text-[rgba(250,248,243,0.4)]">Carregando meta...</p>
          ) : (
            <p className="text-xs text-[rgba(250,248,243,0.4)]">Meta: {metaCapex}% CAPEX / {metaOpex}% OPEX</p>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <input
              type="range"
              min="0"
              max="100"
              value={capex}
              onChange={(e) => handleCapexChange(Number(e.target.value))}
              className="w-full h-2 bg-[rgba(250,248,243,0.1)] rounded appearance-none cursor-pointer accent-[#c4a264]"
            />
          </div>

          <div className="flex gap-4 text-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-[#c4a264] rounded-sm"></div>
                <span className="text-[rgba(250,248,243,0.5)]">CAPEX</span>
              </div>
              <p className="text-2xl font-bold text-[#c4a264]">{capex}%</p>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 bg-[#2d5a3d] rounded-sm"></div>
                <span className="text-[rgba(250,248,243,0.5)]">OPEX</span>
              </div>
              <p className="text-2xl font-bold text-[#7fc49a]">{opex}%</p>
            </div>
          </div>

          <div className="w-full bg-[rgba(250,248,243,0.1)] h-6 overflow-hidden flex">
            <div
              style={{ width: `${capex}%` }}
              className="bg-[#c4a264] transition-all duration-200"
            ></div>
            <div
              style={{ width: `${opex}%` }}
              className="bg-[#2d5a3d] transition-all duration-200"
            ></div>
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-[rgba(45,90,61,0.2)] border border-[rgba(45,90,61,0.4)] rounded p-2 mb-3">
          <p className="text-xs text-[#7fc49a]">✓ CAPEX/OPEX salvo com sucesso</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading}
        className="w-full px-3 py-2 bg-[rgba(45,90,61,0.35)] hover:bg-[rgba(45,90,61,0.55)] disabled:bg-[rgba(250,248,243,0.1)] disabled:cursor-not-allowed text-[#7fc49a] disabled:text-[rgba(250,248,243,0.3)] border border-[rgba(45,90,61,0.6)] rounded text-sm font-medium transition-colors"
      >
        {loading ? 'Salvando...' : 'Salvar'}
      </button>
    </div>
  )
}

function HistoricoItem({ semana, status }: { semana: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3 bg-[rgba(0,0,0,0.15)] rounded border border-[rgba(196,162,100,0.12)]">
      <div className="flex items-center gap-2">
        <span className="text-[#7fc49a]">✓</span>
        <span className="text-sm text-[rgba(250,248,243,0.5)]">{semana}</span>
      </div>
      <button className="text-xs text-[#8b6f3a] hover:text-[#c4a264] font-medium">Ver</button>
    </div>
  )
}
