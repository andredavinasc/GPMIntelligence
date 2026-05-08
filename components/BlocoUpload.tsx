'use client'

import { useRef, useState } from 'react'
import { Upload } from 'lucide-react'
import { formatDate } from '@/lib/semanaRef'

interface BlocoUploadProps {
  titulo: string
  badge: 'Mensal' | 'Semanal' | 'Automático'
  ultimaAtualizacao: Date | null
  totalRegistros: number
  onUpload: (data: Record<string, unknown>[]) => Promise<void>
  loading: boolean
  readonly?: boolean
}

export function BlocoUpload({
  titulo,
  badge,
  ultimaAtualizacao,
  totalRegistros,
  onUpload,
  loading,
  readonly = false,
}: BlocoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)
    setUploading(true)

    try {
      const { parseFile } = await import('@/lib/parseFile')
      const data = await parseFile(file)
      await onUpload(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao processar arquivo')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-sm text-gray-800">{titulo}</h3>
          <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded inline-block mt-1">
            {badge}
          </span>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        {ultimaAtualizacao && (
          <p className="text-xs text-gray-600">
            Última atualização: <span className="font-medium">{formatDate(ultimaAtualizacao)}</span>
          </p>
        )}
        <p className="text-xs text-gray-700">
          {totalRegistros} <span className="text-gray-500">registros</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-2 mb-3">
          <p className="text-xs text-red-700">{error}</p>
        </div>
      )}

      {!readonly && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileSelect}
            disabled={uploading || loading}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || loading}
            className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            <Upload size={16} />
            {uploading ? 'Carregando...' : 'Upload .xlsx/.csv'}
          </button>
        </div>
      )}
    </div>
  )
}
