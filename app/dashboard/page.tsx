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
  const [showConfirmAnalysis, setShowConfirmAnalysis] = useState(false)
  const [validationData, setValidationData] = useState<any>(null)

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

    let retryCount = 0
    const maxRetries = 5
    const retryInterval = 120000 // 2 minutes in milliseconds

    const checkAnalysisStatus = async () => {
      try {
        const { supabase } = await import('@/lib/supabase')
        const { data, error } = await supabase
          .from('weekly_analyses')
          .select('*')
          .eq('semana_ref', formatDateISO(semanaRef))
          .single()

        if (!error && data) {
          // Analysis found, update and stop checking
          setAnalysis(data)
          setCurrentJobId(null)
          setAnalysisLoading(false)
          setAnalysisCompleted(true)

          const notification = document.createElement('div')
          notification.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 16px; max-width: 400px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: #166534; font-weight: 600; margin-bottom: 8px;">✓ Análise Concluída!</div>
              <p style="color: #166534; font-size: 14px;">A análise foi processada com sucesso. Os dados estão atualizados.</p>
            </div>
          `
          document.body.appendChild(notification)
          setTimeout(() => notification.remove(), 5000)
          return true
        }

        return false
      } catch (error) {
        console.error('Erro ao verificar análise:', error)
        return false
      }
    }

    const attemptCheck = async () => {
      const found = await checkAnalysisStatus()

      if (!found) {
        retryCount++

        if (retryCount >= maxRetries) {
          // Max retries reached
          setCurrentJobId(null)
          setAnalysisLoading(false)

          const notification = document.createElement('div')
          notification.innerHTML = `
            <div style="position: fixed; bottom: 20px; right: 20px; background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; max-width: 400px; z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <div style="color: #92400e; font-weight: 600; margin-bottom: 8px;">⏱ Análise em Processamento</div>
              <p style="color: #92400e; font-size: 14px;">Sua análise está sendo processada no fluxo BPM. Verifique se há erros no seu workflow de processamento se a análise não aparecer em breve.</p>
            </div>
          `
          document.body.appendChild(notification)
          setTimeout(() => notification.remove(), 8000)
        } else {
          // Schedule next check
          setTimeout(attemptCheck, retryInterval)
        }
      }
    }

    // Initial check after a short delay to let n8n process
    const initialDelay = setTimeout(attemptCheck, 5000)

    return () => clearTimeout(initialDelay)
  }, [currentJobId, semanaRef])

  const handleAnalysisStart = async () => {
    setAnalysisLoading(true)
    setAnalysisCompleted(false)

    try {
      const semanaRefFormatada = formatDate(semanaRef)

      // Validate data exists for this week in all required tables
      const validationResponse = await fetch(`/api/validar-dados-semana?semana_ref=${semanaRefFormatada}`)
      const validation = await validationResponse.json()

      if (!validation.valido) {
        setAnalysisLoading(false)
        alert(`⚠️ Dados Incompletos\n\n${validation.mensagem}`)
        return
      }

      // Data is valid, show confirmation modal
      setValidationData(validation)
      setShowConfirmAnalysis(true)
      setAnalysisLoading(false)
    } catch (error) {
      console.error('Erro:', error)
      alert(error instanceof Error ? error.message : 'Erro ao validar dados')
      setAnalysisLoading(false)
    }
  }

  const handleConfirmAnalysis = async () => {
    setShowConfirmAnalysis(false)
    setAnalysisLoading(true)

    try {
      const semanaRefFormatada = formatDate(semanaRef)

      // Run the analysis
      const response = await fetch('/api/rodar-analise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ semana_ref: semanaRefFormatada }),
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

  const handleCancelAnalysis = () => {
    setShowConfirmAnalysis(false)
    setValidationData(null)
  }

  const handleRefresh = async () => {
    await loadBlocos()
  }

  const isCurrentWeek = isSameWeek(semanaRef, new Date())

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a3d]"></div>
          <p className="mt-4 text-[#6b6760]">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f3]">

      {/* Topbar — sticky, full-width, fora do container com padding */}
      <header style={{ position: 'sticky', top: 0, zIndex: 200, height: '59px', background: 'var(--dark)', borderBottom: '1px solid rgba(196,162,100,.18)' }}
        className="flex flex-row items-center px-4 sm:px-7 w-full flex-shrink-0">

        {/* Logo: ícone + título + separador */}
        <div className="topbar-logo flex items-center flex-shrink-0">
          <svg className="w-7 h-7 flex-shrink-0 mr-2" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="512" height="512" rx="112" fill="#1a2e22"/>
            <circle cx="256" cy="256" r="152" stroke="rgba(250,248,243,0.88)" strokeWidth="34" strokeLinecap="round" strokeDasharray="716 239"/>
            <polygon points="0,0 -52,-30 -52,30" fill="#c4a264" transform="translate(364,149) rotate(-45)"/>
            <rect x="155" y="212" width="168" height="20" rx="10" fill="#faf8f3" opacity="0.88"/>
            <rect x="178" y="249" width="138" height="20" rx="10" fill="#faf8f3" opacity="0.62"/>
            <rect x="198" y="286" width="108" height="20" rx="10" fill="#faf8f3" opacity="0.38"/>
          </svg>
          <h1 className="gpm-logo whitespace-nowrap">
            <span className="text-[#faf8f3]">GPM </span>
            <em className="text-[#c4a264]">Intelligence</em>
          </h1>
        </div>

        {/* Ações: painel + config */}
        <div className="flex items-center gap-1 flex-1">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="p-1.5 hover:bg-[rgba(250,248,243,0.1)] rounded transition-colors flex-shrink-0 text-[rgba(250,248,243,0.6)] hover:text-[rgba(250,248,243,1)]"
            title={showPanel ? 'Ocultar painel de dados' : 'Mostrar painel de dados'}
          >
            {showPanel ? <X size={16} /> : <Menu size={16} />}
          </button>
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-1.5 hover:bg-[rgba(250,248,243,0.1)] rounded transition-colors text-[rgba(250,248,243,0.6)] hover:text-[rgba(250,248,243,1)] flex-shrink-0"
            title="Configurações"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Navegação de semana */}
        <div className="flex items-center gap-0.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={() => setSemanaRef(getPreviousWeek(semanaRef))}
            className="p-1.5 hover:bg-[rgba(250,248,243,0.1)] rounded transition-colors flex-shrink-0 text-[rgba(250,248,243,0.6)] hover:text-[rgba(250,248,243,1)]"
            title="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          {/* Mobile: mostra só dd/mm da semana */}
          <span className="sm:hidden text-xs font-semibold text-[#faf8f3]">
            {String(semanaRef.getDate()).padStart(2,'0')}/{String(semanaRef.getMonth()+1).padStart(2,'0')}
          </span>
          {/* Desktop: range completo */}
          <span className="hidden sm:inline text-sm font-semibold text-[#faf8f3] whitespace-nowrap">
            {formatWeekRange(semanaRef)}
          </span>
          <button
            onClick={() => setSemanaRef(getNextWeek(semanaRef))}
            className="p-1.5 hover:bg-[rgba(250,248,243,0.1)] rounded transition-colors flex-shrink-0 text-[rgba(250,248,243,0.6)] hover:text-[rgba(250,248,243,1)]"
            title="Próxima semana"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </header>

      {!isCurrentWeek && (
        <div className="bg-[#fdf0f0] border-b border-[#d4cfc4] px-4 sm:px-7 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <span className="text-xs sm:text-sm text-[#7a2424]">
            Você está vendo a semana de {formatWeekRange(semanaRef)}.
          </span>
          <button
            onClick={() => setSemanaRef(getCurrentWeekMonday())}
            className="text-xs sm:text-sm text-[#7a2424] hover:text-[#1a1712] font-medium whitespace-nowrap"
          >
            Ver semana atual
          </button>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-0 p-2 sm:p-3">
        {/* Mobile: Toggle between panel and report | Desktop: Side by side */}
        {/* Mobile View - showPanel toggles between panel and report */}
        {showPanel ? (
          <div className="lg:hidden w-full flex-1">
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
          <div className="lg:hidden w-full flex-1">
            {analysis ? (
              <RelatorioEmbed
                analysis={analysis}
                semanaRef={semanaRef}
                podeGerarResumo={true}
              />
            ) : (
              <div className="bg-[#faf8f3] rounded border border-[#d4cfc4] p-6 sm:p-12 flex flex-col items-center justify-center text-center min-h-[500px] sm:min-h-screen">
                <div className="mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-[#f2efe8] rounded flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl">📊</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#1a1712] mb-1 sm:mb-2">
                  Nenhuma análise disponível
                </h3>
                <p className="text-xs sm:text-sm text-[#6b6760] max-w-sm">
                  Clique em ☰ para carregar dados e rodar a análise.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Desktop View - Toggleable layout */}
        {showPanel ? (
          <div className="hidden lg:grid grid-cols-[20%_80%] gap-4 flex-1 min-h-0" style={{ height: 'calc(100vh - 59px - 24px)' }}>
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
                <div className="bg-[#faf8f3] rounded border border-[#d4cfc4] p-12 flex flex-col items-center justify-center text-center">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-[#f2efe8] rounded flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📊</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-[#1a1712] mb-2">
                    Nenhuma análise disponível
                  </h3>
                  <p className="text-sm text-[#6b6760] max-w-sm">
                    Carregue os dados da semana no painel ao lado e clique em &quot;Rodar Análise&quot; para
                    gerar o relatório.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="hidden lg:block w-full flex-1 min-h-0" style={{ height: 'calc(100vh - 59px - 24px)' }}>
            {analysis ? (
              <RelatorioEmbed
                analysis={analysis}
                semanaRef={semanaRef}
                podeGerarResumo={true}
              />
            ) : (
              <div className="bg-[#faf8f3] rounded border border-[#d4cfc4] p-12 flex flex-col items-center justify-center text-center h-full">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-[#f2efe8] rounded flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📊</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-[#1a1712] mb-2">
                  Nenhuma análise disponível
                </h3>
                <p className="text-sm text-[#6b6760] max-w-sm">
                  Clique no ☰ para abrir o painel e carregue os dados para gerar o relatório.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#faf8f3] rounded-xl border border-[#d4cfc4] shadow-xl max-w-md w-full">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-[#1a1712] mb-2">
                ✓ Dados Validados
              </h3>
              <p className="text-[#6b6760] text-sm sm:text-base mb-4">
                Todos os dados da semana foram validados com sucesso.
              </p>

              {validationData && validationData.tabelasComDados && (
                <div className="bg-[#f2efe8] rounded p-4 mb-6 text-sm">
                  <div className="space-y-2">
                    {Object.entries(validationData.tabelasComDados).map(([tabela, info]: [string, any]) => {
                      const nomeTabela =
                        tabela === 'okrs' ? 'OKRs' :
                        tabela === 'work_items' ? 'Work Items' :
                        'Dados de Agilidade'
                      return (
                        <div key={tabela} className="flex items-center justify-between">
                          <span className="text-[#3d3a33]">{nomeTabela}</span>
                          <span className="text-[#2d5a3d] font-semibold">{info.registros} registros</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <p className="text-[#3d3a33] font-medium mb-6">
                Deseja iniciar a análise da semana?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelAnalysis}
                  className="flex-1 px-4 py-2 border border-[#d4cfc4] rounded text-[#3d3a33] bg-[#f2efe8] hover:border-[#8b6f3a] font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmAnalysis}
                  className="flex-1 px-4 py-2 bg-[#1a2e22] hover:bg-[#243d2e] text-[#c4a264] rounded font-medium transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfiguracaoModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
      />
    </div>
  )
}
