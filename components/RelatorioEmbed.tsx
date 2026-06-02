'use client'

import { useRef, useMemo, useState } from 'react'
import { Download, Calendar } from 'lucide-react'
import { formatWeekRange } from '@/lib/semanaRef'
import { generateAnalysisHTML, generateEstrategiaHTML, generateProdutoHTML, generateAgilidadeHTML } from '@/lib/analysisHtmlGenerator'
import { generatePDFFromHTML } from '@/lib/pdfGenerator'
import { WeeklyAnalysis } from '@/lib/types'

interface RelatorioEmbedProps {
  analysis: WeeklyAnalysis
  semanaRef: Date
  onExportPDF?: () => void
  onGerarResumoMensal?: () => void
  podeGerarResumo?: boolean
}

export function RelatorioEmbed({
  analysis,
  semanaRef,
  onExportPDF,
  onGerarResumoMensal,
  podeGerarResumo = false,
}: RelatorioEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [activeTab, setActiveTab] = useState<'consolidada' | 'estrategia' | 'produto' | 'agilidade'>('consolidada')
  const [exportLoading, setExportLoading] = useState(false)

  const htmlContent = useMemo(() => {
    switch (activeTab) {
      case 'estrategia':
        return generateEstrategiaHTML(analysis)
      case 'produto':
        return generateProdutoHTML(analysis)
      case 'agilidade':
        return generateAgilidadeHTML(analysis)
      case 'consolidada':
      default:
        return generateAnalysisHTML(analysis)
    }
  }, [analysis, activeTab])

  const handleExportPDF = async () => {
    setExportLoading(true)
    try {
      const fileName = `GPM-Intelligence-${activeTab}-${formatWeekRange(semanaRef).replace(/\s+/g, '-')}.pdf`
      await generatePDFFromHTML(htmlContent, fileName)
      onExportPDF?.()
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao exportar PDF')
    } finally {
      setExportLoading(false)
    }
  }

  return (
    <div className="h-full bg-[#faf8f3] rounded border border-[#d4cfc4] overflow-hidden flex flex-col">
      {/* Tabs + Action buttons — mesma linha */}
      <div className="no-print border-b border-[#d4cfc4] flex-shrink-0">
        <div className="flex items-stretch justify-between px-2 sm:px-4 pt-1">
          {/* Tabs */}
          <div className="flex gap-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab('consolidada')}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'consolidada'
                  ? 'border-[#1a2e22] text-[#1a2e22]'
                  : 'border-transparent text-[#6b6760] hover:text-[#3d3a33]'
              }`}
            >
              📊 <span className="hidden sm:inline">Consolidada</span><span className="sm:hidden">Consol.</span>
            </button>
            <button
              onClick={() => setActiveTab('estrategia')}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'estrategia'
                  ? 'border-[#1a2e22] text-[#1a2e22]'
                  : 'border-transparent text-[#6b6760] hover:text-[#3d3a33]'
              }`}
            >
              📈 <span className="hidden sm:inline">Estratégia</span><span className="sm:hidden">Estra.</span>
            </button>
            <button
              onClick={() => setActiveTab('produto')}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'produto'
                  ? 'border-[#1a2e22] text-[#1a2e22]'
                  : 'border-transparent text-[#6b6760] hover:text-[#3d3a33]'
              }`}
            >
              🚀 <span className="hidden sm:inline">Produto</span><span className="sm:hidden">Prod.</span>
            </button>
            <button
              onClick={() => setActiveTab('agilidade')}
              className={`px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'agilidade'
                  ? 'border-[#1a2e22] text-[#1a2e22]'
                  : 'border-transparent text-[#6b6760] hover:text-[#3d3a33]'
              }`}
            >
              🏃 <span className="hidden sm:inline">Agilidade</span><span className="sm:hidden">Agil.</span>
            </button>
          </div>

          {/* Action buttons — alinhados verticalmente ao centro */}
          <div className="flex items-center gap-1 sm:gap-2 pb-1 flex-shrink-0">
            <button
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="px-2 sm:px-3 py-1 sm:py-1.5 border border-[#d4cfc4] rounded text-[#3d3a33] bg-[#f2efe8] hover:border-[#8b6f3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2 text-xs font-medium whitespace-nowrap"
            >
              <Download size={13} />
              <span className="hidden sm:inline">{exportLoading ? 'Gerando...' : 'Exportar PDF'}</span>
              <span className="sm:hidden">{exportLoading ? '...' : 'PDF'}</span>
            </button>

            {podeGerarResumo && (
              <button
                onClick={onGerarResumoMensal}
                className="px-2 sm:px-3 py-1 sm:py-1.5 bg-[#1a2e22] text-[#c4a264] rounded hover:bg-[#243d2e] transition-colors flex items-center gap-1 sm:gap-2 text-xs font-medium whitespace-nowrap"
              >
                <Calendar size={13} />
                <span className="hidden sm:inline">Resumo Mensal</span>
                <span className="sm:hidden">Resumo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto w-full">
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          className="w-full border-none"
          style={{ minHeight: '600px', height: '100%' }}
          title="Relatório da Semana"
        />
      </div>
    </div>
  )
}
