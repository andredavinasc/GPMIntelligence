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
    <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col min-h-screen lg:min-h-full">
      <div className="no-print border-b border-gray-200 p-2 sm:p-4 space-y-2 sm:space-y-4 flex-shrink-0">
        {/* Título e Botões - Stack em Mobile */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <div>
            <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
              Semana de {formatWeekRange(semanaRef)}
            </h2>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
            >
              <Download size={14} className="sm:hidden" />
              <Download size={16} className="hidden sm:block" />
              <span className="hidden sm:inline">{exportLoading ? 'Gerando PDF...' : 'Exportar PDF'}</span>
              <span className="sm:hidden">{exportLoading ? 'PDF...' : 'PDF'}</span>
            </button>

            {podeGerarResumo && (
              <button
                onClick={onGerarResumoMensal}
                className="flex-1 sm:flex-none px-2 sm:px-4 py-1.5 sm:py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex items-center justify-center sm:justify-start gap-1 sm:gap-2 text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                <Calendar size={14} className="sm:hidden" />
                <Calendar size={16} className="hidden sm:block" />
                <span className="hidden sm:inline">Resumo Mensal</span>
                <span className="sm:hidden">Resumo</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs - Scroll em Mobile */}
        <div className="flex gap-1 sm:gap-2 border-b border-gray-200 overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
          <button
            onClick={() => setActiveTab('consolidada')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'consolidada'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 <span className="hidden sm:inline">Consolidada</span><span className="sm:hidden">Consol.</span>
          </button>
          <button
            onClick={() => setActiveTab('estrategia')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'estrategia'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📈 <span className="hidden sm:inline">Estratégia</span><span className="sm:hidden">Estra.</span>
          </button>
          <button
            onClick={() => setActiveTab('produto')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'produto'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🚀 <span className="hidden sm:inline">Produto</span><span className="sm:hidden">Prod.</span>
          </button>
          <button
            onClick={() => setActiveTab('agilidade')}
            className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === 'agilidade'
                ? 'border-green-700 text-green-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🏃 <span className="hidden sm:inline">Agilidade</span><span className="sm:hidden">Agil.</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto w-full">
        <iframe
          ref={iframeRef}
          srcDoc={htmlContent}
          className="w-full h-full min-h-screen lg:min-h-full border-none"
          title="Relatório da Semana"
        />
      </div>
    </div>
  )
}
