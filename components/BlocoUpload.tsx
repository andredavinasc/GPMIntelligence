'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { formatDate } from '@/lib/semanaRef'
import { UploadConfirmationModal } from './UploadConfirmationModal'

interface BlocoUploadProps {
  titulo: string
  badge: 'Mensal' | 'Semanal' | 'Automático'
  ultimaAtualizacao: Date | null
  totalRegistros: number
  onUpload: (data: Record<string, unknown>[]) => Promise<void>
  loading: boolean
  readonly?: boolean
  semanaRef: Date
}

export function BlocoUpload({
  titulo,
  badge,
  ultimaAtualizacao,
  totalRegistros,
  onUpload,
  loading,
  readonly = false,
  semanaRef,
}: BlocoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingData, setPendingData] = useState<Record<string, unknown>[] | null>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    try {
      const { parseFile } = await import('@/lib/parseFile')
      const data = await parseFile(file)
      setPendingData(data)
      setShowConfirmation(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleConfirmUpload = async () => {
    if (!pendingData) return

    setUploading(true)
    try {
      await onUpload(pendingData)
      setShowConfirmation(false)
      setPendingData(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setShowConfirmation(false)
    setPendingData(null)
  }

  return (
    <>
      <div className="bg-[rgba(0,0,0,0.2)] rounded border border-[rgba(196,162,100,0.18)] p-3 mb-3">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-sm text-[rgba(250,248,243,0.75)]">{titulo}</h3>
            <span className="text-xs bg-[rgba(196,162,100,0.15)] text-[#c4a264] px-2 py-1 inline-block mt-1">
              {badge}
            </span>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          {ultimaAtualizacao && (
            <p className="text-xs text-[rgba(250,248,243,0.4)]">
              Última atualização: <span className="font-medium">{formatDate(ultimaAtualizacao)}</span>
            </p>
          )}
          <p className="text-xs text-[rgba(250,248,243,0.5)]">
            {totalRegistros} <span className="text-[rgba(250,248,243,0.4)]">registros</span>
          </p>
        </div>

        {error && (
          <div className="bg-[rgba(122,36,36,0.2)] border border-[rgba(122,36,36,0.4)] rounded p-2 mb-3">
            <p className="text-xs text-[#fdf0f0]">{error}</p>
          </div>
        )}

        {!readonly && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              disabled={uploading || loading || showConfirmation}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading || showConfirmation}
              className="w-full px-3 py-2 bg-[rgba(45,90,61,0.35)] hover:bg-[rgba(45,90,61,0.55)] border border-[rgba(45,90,61,0.6)] text-[#7fc49a] rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={16} />
              {uploading ? 'Carregando...' : 'Upload .xlsx/.csv'}
            </button>
          </div>
        )}
      </div>

      <UploadConfirmationModal
        isOpen={showConfirmation}
        onConfirm={handleConfirmUpload}
        onCancel={handleCancel}
        semanaRef={semanaRef}
        titulo={titulo}
        isLoading={uploading}
      />
    </>
  )
}
