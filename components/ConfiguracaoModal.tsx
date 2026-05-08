'use client'

import { useState, useEffect } from 'react'
import { X, Settings, Save, Loader } from 'lucide-react'
import { Configuracao } from '@/lib/types'

interface ConfiguracaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export function ConfiguracaoModal({ isOpen, onClose, onSave }: ConfiguracaoModalProps) {
  const [configuracao, setConfiguracao] = useState<Partial<Configuracao>>({
    empresa: '',
    setor: '',
    nome: '',
    objetivo: '',
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadConfiguracao()
    }
  }, [isOpen])

  const loadConfiguracao = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/configuracao')
      const data = await response.json()
      if (data) {
        setConfiguracao(data)
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setError(null)
    setSuccess(false)

    if (!configuracao.empresa || !configuracao.setor || !configuracao.nome || !configuracao.objetivo) {
      setError('Todos os campos são obrigatórios')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/configuracao', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configuracao),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao salvar')
      }

      const data = await response.json()
      setConfiguracao(data)
      setSuccess(true)
      onSave?.()

      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar configuração')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setConfiguracao((prev) => ({
      ...prev,
      [field]: value,
    }))
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl max-w-2xl w-full sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings size={20} className="sm:w-6 sm:h-6 text-green-700" />
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">Configurações</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fechar"
          >
            <X size={20} className="sm:w-6 sm:h-6 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="p-6 sm:p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">Carregando configurações...</p>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Empresa
              </label>
              <input
                type="text"
                value={configuracao.empresa || ''}
                onChange={(e) => handleChange('empresa', e.target.value)}
                placeholder="Nome da empresa"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Setor
              </label>
              <input
                type="text"
                value={configuracao.setor || ''}
                onChange={(e) => handleChange('setor', e.target.value)}
                placeholder="Ex: Tecnologia, Financeiro, RH"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Seu Nome
              </label>
              <input
                type="text"
                value={configuracao.nome || ''}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome completo"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Objetivo da Área
              </label>
              <textarea
                value={configuracao.objetivo || ''}
                onChange={(e) => handleChange('objetivo', e.target.value)}
                placeholder="Descreva o objetivo principal da sua área"
                rows={4}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">✓ Configurações salvas com sucesso!</p>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-700 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader size={14} className="sm:w-4 sm:h-4 animate-spin" />
                    <span className="hidden sm:inline">Salvando...</span>
                    <span className="sm:hidden">Salvando</span>
                  </>
                ) : (
                  <>
                    <Save size={14} className="sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Salvar Configurações</span>
                    <span className="sm:hidden">Salvar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
