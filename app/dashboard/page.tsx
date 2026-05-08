'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Menu, X, Settings } from 'lucide-react'
import { PainelStatus } from '@/components/PainelStatus'
import { RelatorioEmbed } from '@/components/RelatorioEmbed'
import { ConfiguracaoModal } from '@/components/ConfiguracaoModal'
import { BlocoStatus, WeeklyAnalysis } from '@/lib/types'
import { useAuth } from '@/lib/authContext'
import {
  getCurrentWeekMonday,
  getNextWeek,
  getPreviousWeek,
  formatWeekRange,
  isSameWeek,
  formatDate,
  formatDateISO,
} from '@/lib/semanaRef'

export default function Dashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [semanaRef, setSemanaRef] = useState<Date>(getCurrentWeekMonday())
  const [blocos, setBlocos] = useState<BlocoStatus[]>([])
  const [analysis, setAnalysis] = useState<WeeklyAnalysis | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [analysisCompleted, setAnalysisCompleted] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const [showConfigModal, setShowConfigModal] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  const loadBlocos = useCallback(async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('v_blocos_status')
        .select('*')

      if (error) throw error
      setBlocos(data || [])
    } catch (error) {
      console.error('Erro ao carregar status dos blocos:', error)
    } finally {
      setDataLoading(false)
    }
  }, [])

  const loadAnalysis = useCallback(async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data, error } = await supabase
        .from('weekly_analyses')
        .select('*')
        .eq('semana_ref', formatDateISO(semanaRef))
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }
      setAnalysis(data || null)
    } catch (error) {
      console.error('Erro ao carregar análise:', error)
    }
  }, [semanaRef])

  useEffect(() => {
    loadBlocos()
    loadAnalysis()
  }, [loadBlocos, loadAnalysis])

  useEffect(() => {
    if (!currentJobId) return

    const interval = setInterval(async () => {
      try {
        const statusResponse = await fetch(`/api/analise/status/${currentJobId}`)
        const statusData = await statusResponse.json()

        if (statusData.status === 'concluido') {
          await loadAnalysis()
          setCurrentJobId(null)
          setAnalysisCompleted(true)
          // Show notification
          const notification = document.createElement('div')
          notification.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 16px; max-width: 400px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: #166534; font-weight: 600; margin-bottom: 8px;">✓ Análise Concluída!</div>
              <p style="color: #166534; font-size: 14px;">A análise foi processada com sucesso. Os dados estão atualizados.</p>
            </div>
          `
          document.body.appendChild(notification)
          setTimeout(() => notification.remove(), 5000)
        } else if (statusData.status === 'erro') {
          setCurrentJobId(null)
          const notification = document.createElement('div')
          notification.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; max-width: 400px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: #991b1b; font-weight: 600; margin-bottom: 8px;">⚠ Erro na Análise</div>
              <p style="color: #991b1b; font-size: 14px;">${statusData.message || 'Erro ao processar análise'}</p>
            </div>
          `
          document.body.appendChild(notification)
          setTimeout(() => notification.remove(), 5000)
        }
      } catch (error) {
        console.error('Erro ao verificar status da análise:', error)
      }
    }, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [currentJobId, loadAnalysis])

  const handleAnalysisStart = async () => {
    setAnalysisLoading(true)
    setAnalysisCompleted(false)

    try {
      const response = await fetch('/api/rodar-analise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semana_ref: formatDate(semanaRef) }),
      })

      if (!response.ok) throw new Error('Erro ao iniciar análise')

      const data = await response.json()
      setCurrentJobId(data.job_id)
      setAnalysisLoading(false)
      alert('✓ Análise iniciada com sucesso!\n\nA análise está sendo processada e estará pronta em até 30 minutos. Você será notificado automaticamente quando estiver pronta.')
    } catch (error) {
      console.error('Erro:', error)
      alert(error instanceof Error ? error.message : 'Erro ao rodar análise')
      setAnalysisLoading(false)
    }
  }

  const handleRefresh = async () => {
    await loadBlocos()
  }

  const isCurrentWeek = isSameWeek(semanaRef, new Date())

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!isCurrentWeek && (
        <div className="bg-amber-50 border-b border-amber-200 px-3 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm text-amber-800">
            Você está vendo a semana de {formatWeekRange(semanaRef)}.
          </span>
          <button
            onClick={() => setSemanaRef(getCurrentWeekMonday())}
            className="text-xs sm:text-sm text-amber-700 hover:text-amber-900 font-medium whitespace-nowrap"
          >
            Ver semana atual
          </button>
        </div>
      )}

      <div className="max-w-full mx-auto p-2 sm:p-3">
        {/* Header - Responsivo */}
        <div className="flex flex-col sm:flex-row items-start justify-between mb-3 sm:mb-4 gap-2 sm:gap-3">
          <div className="flex items-start gap-2 sm:gap-3 w-full sm:flex-1">
            <button
              onClick={() => setShowPanel(!showPanel)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5 sm:mt-1 flex-shrink-0"
              title={showPanel ? 'Ocultar painel de dados' : 'Mostrar painel de dados'}
            >
              {showPanel ? <X size={18} className="sm:hidden" /> : <Menu size={18} className="sm:hidden" />}
              {showPanel ? <X size={20} className="hidden sm:block" /> : <Menu size={20} className="hidden sm:block" />}
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5 sm:mt-1 text-gray-600 hover:text-gray-900 flex-shrink-0"
              title="Configurações"
            >
              <Settings size={18} className="sm:hidden" />
              <Settings size={20} className="hidden sm:block" />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">GPM Intelligence</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">Análise estratégica semanal</p>
            </div>
          </div>

          {/* Navegação de Semana - Responsiva */}
          <div className="flex items-center gap-1 sm:gap-4 justify-end w-full sm:w-auto">
            <button
              onClick={() => setSemanaRef(getPreviousWeek(semanaRef))}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Semana anterior"
            >
              <ChevronLeft size={18} className="sm:hidden" />
              <ChevronLeft size={20} className="hidden sm:block" />
            </button>

            <div className="text-center px-2 sm:px-6 whitespace-nowrap min-w-max">
              <span className="text-xs sm:text-sm font-semibold text-gray-900">{formatWeekRange(semanaRef)}</span>
            </div>

            <button
              onClick={() => setSemanaRef(getNextWeek(semanaRef))}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              title="Próxima semana"
            >
              <ChevronRight size={18} className="sm:hidden" />
              <ChevronRight size={20} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* Mobile: Toggle between panel and report | Desktop: Side by side */}
        {/* Mobile View - showPanel toggles between panel and report */}
        {showPanel ? (
          <div className="lg:hidden w-full">
            <PainelStatus
              semanaRef={semanaRef}
              blocos={blocos}
              onAnalysisStart={handleAnalysisStart}
              onRefresh={handleRefresh}
              analysisLoading={analysisLoading}
              analysisCompleted={analysisCompleted}
            />
          </div>
        ) : (
          <div className="lg:hidden w-full">
            {analysis ? (
              <RelatorioEmbed
                analysis={analysis}
                semanaRef={semanaRef}
                podeGerarResumo={true}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 sm:p-12 flex flex-col items-center justify-center text-center min-h-[500px] sm:min-h-screen">
                <div className="mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl">📊</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                  Nenhuma análise disponível
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 max-w-sm">
                  Clique em ☰ para carregar dados e rodar a análise.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Desktop View - Side by side */}
        <div className="hidden lg:grid grid-cols-[20%_80%] gap-4 h-[calc(100vh-180px)]">
          <div>
            <PainelStatus
              semanaRef={semanaRef}
              blocos={blocos}
              onAnalysisStart={handleAnalysisStart}
              onRefresh={handleRefresh}
              analysisLoading={analysisLoading}
              analysisCompleted={analysisCompleted}
            />
          </div>

          <div>
            {analysis ? (
              <RelatorioEmbed
                analysis={analysis}
                semanaRef={semanaRef}
                podeGerarResumo={true}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhuma análise disponível
                </h3>
                <p className="text-sm text-gray-600 max-w-sm">
                  Carregue os dados da semana no painel ao lado e clique em &quot;Rodar Análise&quot; para
                  gerar o relatório.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfiguracaoModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  )
}
