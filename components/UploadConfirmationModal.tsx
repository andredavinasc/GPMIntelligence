'use client'

import { AlertCircle, CheckCircle, X } from 'lucide-react'
import { formatWeekRange, getCurrentWeekMonday, isSameWeek } from '@/lib/semanaRef'

interface UploadConfirmationModalProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  semanaRef: Date
  titulo: string
  isLoading: boolean
}

export function UploadConfirmationModal({
  isOpen,
  onConfirm,
  onCancel,
  semanaRef,
  titulo,
  isLoading,
}: UploadConfirmationModalProps) {
  if (!isOpen) return null

  const isCurrentWeek = isSameWeek(semanaRef, new Date())
  const weekRange = formatWeekRange(semanaRef)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#faf8f3] rounded-xl border border-[#d4cfc4] shadow-xl max-w-sm w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#d4cfc4]">
          <div className="flex items-center gap-3">
            {isCurrentWeek ? (
              <CheckCircle size={24} className="text-[#2d5a3d]" />
            ) : (
              <AlertCircle size={24} className="text-[#8b6f3a]" />
            )}
            <h2 className="text-lg font-bold text-[#1a1712]">Confirmar Upload</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 hover:bg-[#f2efe8] rounded transition-colors disabled:opacity-50"
            title="Fechar"
          >
            <X size={20} className="text-[#6b6760]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-[#6b6760] mb-1">Tipo de arquivo:</p>
            <p className="text-lg font-semibold text-[#1a1712]">{titulo}</p>
          </div>

          {!isCurrentWeek && (
            <div className="bg-[#fdf0f0] border border-[rgba(122,36,36,0.3)] rounded p-4">
              <p className="text-sm text-[#7a2424]">
                <span className="font-semibold">⚠️ Atenção:</span> Você está em uma semana diferente da atual.
              </p>
            </div>
          )}

          <div className="bg-[#f0e6d0] border border-[rgba(139,111,58,0.3)] rounded p-4">
            <p className="text-sm text-[#3d3a33] mb-2">
              {isCurrentWeek
                ? 'Será efetuada a carga/atualização de:'
                : 'Será efetuada a carga/atualização da semana:'}
            </p>
            <p className="text-base font-bold text-[#1a1712]">
              Semana de {weekRange}
            </p>
            {!isCurrentWeek && (
              <p className="text-xs text-[#8b6f3a] mt-2">
                Semana atual: {formatWeekRange(getCurrentWeekMonday())}
              </p>
            )}
          </div>

          <div className="bg-[#f2efe8] border border-[#d4cfc4] rounded p-4">
            <p className="text-xs text-[#3d3a33]">
              Os dados já existentes nesta semana serão <span className="font-semibold">substituídos</span>.
              Certifique-se de que está na semana correta antes de prosseguir.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-[#d4cfc4] bg-[#f2efe8] rounded-b-xl">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-[#d4cfc4] rounded text-[#3d3a33] bg-[#faf8f3] hover:border-[#8b6f3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#1a2e22] text-[#c4a264] rounded hover:bg-[#243d2e] disabled:bg-[rgba(250,248,243,0.1)] disabled:text-[rgba(250,248,243,0.3)] disabled:cursor-not-allowed transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#c4a264]"></div>
                Carregando...
              </>
            ) : (
              'Confirmar Upload'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
