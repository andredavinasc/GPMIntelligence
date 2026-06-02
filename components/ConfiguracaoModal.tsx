'use client'

import { useState, useEffect } from 'react'
import { X, Settings, Save, Loader } from 'lucide-react'
import { Configuracao } from '@/lib/types'
import MapeamentoCampos from './settings/MapeamentoCampos'

interface ConfiguracaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

type AbaType = 'configuracoes' | 'mapeamento'

export function ConfiguracaoModal({ isOpen, onClose, onSave }: ConfiguracaoModalProps) {
  const [abaAtiva, setAbaAtiva] = useState<AbaType>('configuracoes')
  const [configuracao, setConfiguracao] = useState<Partial<Configuracao>>({
    empresa: '',
    setor: '',
    nome: '',
    objetivo: '',
    objetivo_capex: 80,
    objetivo_opex: 20,
    hierarquia_trabalho: '',
    modelo_trabalho: '',
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
    setError(null)
    try {
      const response = await fetch('/api/configuracao')
      if (!response.ok) {
        throw new Error('Erro ao carregar configuração')
      }
      const data = await response.json()
      if (data && typeof data === 'object') {
        setConfiguracao({
          empresa: data.empresa || '',
          setor: data.setor || '',
          nome: data.nome || '',
          objetivo: data.objetivo || '',
          objetivo_capex: data.objetivo_capex ?? 80,
          objetivo_opex: data.objetivo_opex ?? 20,
          hierarquia_trabalho: data.hierarquia_trabalho || '',
          modelo_trabalho: data.modelo_trabalho || '',
        })
      }
    } catch (err) {
      console.error('Erro ao carregar configuração:', err)
      setError('Erro ao carregar dados de configuração')
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

    const capexValue = parseInt(String(configuracao.objetivo_capex ?? 0))
    const opexValue = parseInt(String(configuracao.objetivo_opex ?? 0))

    // If both are 0 (empty/not set), that's valid - agent won't use this data
    // If either is set (non-zero), both must be set and sum to 100
    const hasCapex = capexValue > 0
    const hasOpex = opexValue > 0
    const isCapexOpexValid =
      (!hasCapex && !hasOpex) || // Both empty - valid
      (hasCapex && hasOpex && capexValue + opexValue === 100) // Both set and sum to 100 - valid

    if (!isCapexOpexValid) {
      if (hasCapex || hasOpex) {
        setError('Se informar CAPEX/OPEX, ambos campos são obrigatórios e devem somar 100%')
      }
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

  const handleChange = (field: string, value: string | number) => {
    setConfiguracao((prev) => {
      const newValue = typeof value === 'string' ? value : value
      return {
        ...prev,
        [field]: newValue,
      }
    })
    setError(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#faf8f3] rounded-t-xl sm:rounded-xl border border-[#d4cfc4] shadow-xl max-w-2xl w-full sm:mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#d4cfc4] sticky top-0 bg-[#faf8f3] z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Settings size={20} className="sm:w-6 sm:h-6 text-[#8b6f3a]" />
            <h2 className="text-lg sm:text-2xl font-bold text-[#1a1712]">Configurações</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#f2efe8] rounded transition-colors"
            title="Fechar"
          >
            <X size={20} className="sm:w-6 sm:h-6 text-[#6b6760]" />
          </button>
        </div>

        {/* Abas */}
        <div className="border-b border-[#d4cfc4] bg-[#faf8f3] sticky top-[70px] z-10 sm:static sm:top-auto">
          <div className="flex gap-4 px-4 sm:px-6 overflow-x-auto">
            <button
              onClick={() => setAbaAtiva('configuracoes')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                abaAtiva === 'configuracoes'
                  ? 'border-[#1a2e22] text-[#1a2e22]'
                  : 'border-transparent text-[#6b6760] hover:text-[#3d3a33]'
              }`}
            >
              Configurações
            </button>
            <button
              onClick={() => setAbaAtiva('mapeamento')}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                abaAtiva === 'mapeamento'
                  ? 'border-[#1a2e22] text-[#1a2e22]'
                  : 'border-transparent text-[#6b6760] hover:text-[#3d3a33]'
              }`}
            >
              Mapeamento de Campos
            </button>
          </div>
        </div>

        {abaAtiva === 'configuracoes' ? (
          loading ? (
            <div className="p-6 sm:p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a3d]"></div>
                <p className="mt-4 text-sm sm:text-base text-[#6b6760]">Carregando configurações...</p>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                Empresa
              </label>
              <input
                type="text"
                value={configuracao.empresa || ''}
                onChange={(e) => handleChange('empresa', e.target.value)}
                placeholder="Nome da empresa"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all bg-[#f2efe8] text-[#1a1712]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                Setor
              </label>
              <input
                type="text"
                value={configuracao.setor || ''}
                onChange={(e) => handleChange('setor', e.target.value)}
                placeholder="Ex: Tecnologia, Financeiro, RH"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all bg-[#f2efe8] text-[#1a1712]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                Seu Nome
              </label>
              <input
                type="text"
                value={configuracao.nome || ''}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="Nome completo"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all bg-[#f2efe8] text-[#1a1712]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                Objetivo da Área
              </label>
              <textarea
                value={configuracao.objetivo || ''}
                onChange={(e) => handleChange('objetivo', e.target.value)}
                placeholder="Descreva o objetivo principal da sua área"
                rows={4}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all resize-none bg-[#f2efe8] text-[#1a1712]"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                Hierarquia de Trabalho
              </label>
              <input
                type="text"
                value={configuracao.hierarquia_trabalho || ''}
                onChange={(e) => handleChange('hierarquia_trabalho', e.target.value)}
                placeholder="Ex: Iniciativa → Release → Épico → User Story"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all bg-[#f2efe8] text-[#1a1712]"
              />
              <p className="text-xs text-[#6b6760] mt-1">Exemplo: Iniciativa → Release → Épico → User Story</p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                Modelo de Trabalho
              </label>
              <input
                type="text"
                value={configuracao.modelo_trabalho || ''}
                onChange={(e) => handleChange('modelo_trabalho', e.target.value)}
                placeholder="Ex: Kanban, Scrum, Sprints, Cascata"
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all bg-[#f2efe8] text-[#1a1712]"
              />
              <p className="text-xs text-[#6b6760] mt-1">Exemplo: Kanban, Scrum, Sprints, Cascata</p>
            </div>

            <div className="bg-[#f2efe8] rounded p-4 space-y-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#3d3a33]">Objetivos CAPEX / OPEX (Opcional)</h3>
                <span className="text-xs text-[#6b6760]">Deixe em branco para não usar</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                    CAPEX (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ex: 80"
                    value={configuracao.objetivo_capex && configuracao.objetivo_capex > 0 ? configuracao.objetivo_capex : ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                      if (value >= 0 && value <= 100) {
                        handleChange('objetivo_capex', value)
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all bg-[#f2efe8] text-[#1a1712]"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs sm:text-sm font-semibold text-[#3d3a33] mb-2">
                    OPEX (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Ex: 20"
                    value={configuracao.objetivo_opex && configuracao.objetivo_opex > 0 ? configuracao.objetivo_opex : ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                      if (value >= 0 && value <= 100) {
                        handleChange('objetivo_opex', value)
                      }
                    }}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all bg-[#f2efe8] text-[#1a1712]"
                  />
                </div>
              </div>
              {(parseInt(String(configuracao.objetivo_capex ?? 0)) > 0 || parseInt(String(configuracao.objetivo_opex ?? 0)) > 0) && (
                <div className="text-xs sm:text-sm text-[#6b6760] flex items-center justify-between pt-2 border-t border-[#d4cfc4]">
                  <span>Total:</span>
                  <span className={`font-semibold ${(parseInt(String(configuracao.objetivo_capex ?? 0)) + parseInt(String(configuracao.objetivo_opex ?? 0))) === 100 ? 'text-[#2d5a3d]' : 'text-[#7a2424]'}`}>
                    {parseInt(String(configuracao.objetivo_capex ?? 0)) + parseInt(String(configuracao.objetivo_opex ?? 0))}%
                  </span>
                </div>
              )}
              {!(parseInt(String(configuracao.objetivo_capex ?? 0)) > 0 || parseInt(String(configuracao.objetivo_opex ?? 0)) > 0) && (
                <div className="text-xs text-[#6b6760] italic pt-2">
                  Deixar em branco significa que o agente não considerará CAPEX/OPEX na análise
                </div>
              )}
            </div>

            {error && (
              <div className="bg-[#fdf0f0] border border-[rgba(122,36,36,0.3)] rounded p-4">
                <p className="text-sm text-[#7a2424]">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-[rgba(45,90,61,0.1)] border border-[rgba(45,90,61,0.3)] rounded p-4">
                <p className="text-sm text-[#2d5a3d]">✓ Configurações salvas com sucesso!</p>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-[#d4cfc4] sticky bottom-0 bg-[#faf8f3]">
              <button
                onClick={onClose}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-[#d4cfc4] rounded text-[#3d3a33] bg-[#f2efe8] hover:border-[#8b6f3a] transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-[#1a2e22] text-[#c4a264] rounded hover:bg-[#243d2e] disabled:bg-[rgba(250,248,243,0.1)] disabled:text-[rgba(250,248,243,0.3)] disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
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
          )
        ) : (
          <div className="p-4 sm:p-6">
            <MapeamentoCampos />
          </div>
        )}
      </div>
    </div>
  )
}
