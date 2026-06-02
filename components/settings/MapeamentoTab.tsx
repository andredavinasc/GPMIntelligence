'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, AlertCircle, CheckCircle, Loader } from 'lucide-react'
import {
  carregarMapeamento,
  salvarMapeamento,
  detectarAutomaticamente,
  verificarStatusDados,
} from '@/lib/mapeamento'
import { getCamposParaTipo } from '@/lib/fieldDictionary'
import { TipoCarga, StatusDados, ResultadoDeteccao, CampoDefinicao } from '@/lib/types/mapeamento'

interface MapeamentoTabProps {
  tipo: TipoCarga
}

export default function MapeamentoTab({ tipo }: MapeamentoTabProps) {
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({})
  const [sugestoesAtivas, setSugestoesAtivas] = useState<Record<string, number>>({})
  const [statusDados, setStatusDados] = useState<StatusDados>({ temDados: false })
  const [loading, setLoading] = useState(true)
  const [detectando, setDetectando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)
  const [mudancasNaoSalvas, setMudancasNaoSalvas] = useState(false)
  const [carregandoDados, setCarregandoDados] = useState(false)

  const campos = getCamposParaTipo(tipo)
  const camposObrigatorios = Object.entries(campos)
    .filter(([_, def]) => def.obrigatorio)
    .map(([key]) => key)

  // Load data on mount or when tipo changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setCarregandoDados(true)
      setErro(null)

      try {
        const [mapData, statusData] = await Promise.all([
          carregarMapeamento(tipo),
          verificarStatusDados(tipo),
        ])

        setMapeamento(mapData || {})
        setStatusDados(statusData)
        setSugestoesAtivas({})
      } catch (err) {
        setErro('Erro ao carregar dados de mapeamento')
        console.error(err)
      } finally {
        setLoading(false)
        setCarregandoDados(false)
      }
    }

    loadData()
  }, [tipo])


  const handleDetectarAutomaticamente = async () => {
    if (!statusDados.temDados) {
      setErro('Nenhum dado disponível para análise')
      return
    }

    setDetectando(true)
    setErro(null)

    try {
      const resultado = await detectarAutomaticamente(tipo)

      if (!resultado) {
        throw new Error('Não consegui analisar os dados')
      }

      // Apply suggestions to form
      const novoMapeamento = { ...mapeamento }
      const novasSugestoes: Record<string, number> = {}

      Object.entries(resultado.sugestoes).forEach(([campo, { valor, confianca }]) => {
        novoMapeamento[campo] = valor
        novasSugestoes[campo] = confianca
      })

      setMapeamento(novoMapeamento)
      setSugestoesAtivas(novasSugestoes)
      setMudancasNaoSalvas(true)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro(
        'Não consegui analisar os dados. Configure manualmente ou tente novamente'
      )
      console.error(err)
    } finally {
      setDetectando(false)
    }
  }

  const handleMapeamentoChange = (campo: string, valor: string) => {
    setMapeamento((prev) => ({
      ...prev,
      [campo]: valor,
    }))
    setMudancasNaoSalvas(true)
  }

  const handleSalvar = async () => {
    // Validate required fields
    const camposFaltando = camposObrigatorios.filter((campo) => !mapeamento[campo])

    if (camposFaltando.length > 0) {
      setErro(
        `Você precisa mapear: ${camposFaltando.map((c) => campos[c]?.label).join(', ')}`
      )
      return
    }

    setSalvando(true)
    setErro(null)

    try {
      await salvarMapeamento(tipo, mapeamento)
      setSucesso(true)
      setMudancasNaoSalvas(false)

      setTimeout(() => setSucesso(false), 3000)
    } catch (err) {
      setErro('Erro ao salvar mapeamento')
      console.error(err)
    } finally {
      setSalvando(false)
    }
  }

  const handleCancelar = async () => {
    setErro(null)
    setSugestoesAtivas({})
    setMudancasNaoSalvas(false)

    try {
      const mapData = await carregarMapeamento(tipo)
      setMapeamento(mapData || {})
    } catch (err) {
      setErro('Erro ao recarregar dados')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
          <p className="mt-4 text-sm text-gray-600">Carregando mapeamento...</p>
        </div>
      </div>
    )
  }

  // Status bar
  const statusBar = statusDados.temDados ? (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
      <CheckCircle size={20} className="text-green-700 flex-shrink-0" />
      <div className="text-sm text-green-800">
        <p className="font-semibold">✓ Dados encontrados</p>
        {statusDados.ultimaCarga && (
          <p className="text-xs text-green-700 mt-1">
            Última carga: {statusDados.ultimaCarga.tipo.replace('_', ' ').toUpperCase()} ({statusDados.ultimaCarga.linhas} linhas) •{' '}
            {new Date(statusDados.ultimaCarga.data).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
  ) : (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3">
      <AlertCircle size={20} className="text-amber-600 flex-shrink-0" />
      <div className="text-sm text-amber-800">
        <p className="font-semibold">⚠ Nenhum dado encontrado</p>
        <p className="text-xs text-amber-700 mt-1">
          Configure manualmente ou faça um upload para ativar a detecção automática
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {statusBar}

      <button
        onClick={handleDetectarAutomaticamente}
        disabled={!statusDados.temDados || detectando}
        className="w-full px-4 py-2 bg-[#1a2e22] hover:bg-[#243d2e] disabled:bg-[rgba(250,248,243,0.1)] disabled:cursor-not-allowed text-[#c4a264] disabled:text-[rgba(250,248,243,0.3)] rounded font-medium transition-colors flex items-center justify-center gap-2"
      >
        {detectando ? (
          <>
            <Loader size={16} className="animate-spin" />
            <span>Analisando estrutura dos dados...</span>
          </>
        ) : (
          <>
            <RefreshCw size={16} />
            <span>Detectar Automaticamente</span>
          </>
        )}
      </button>

      {/* Mapping table */}
      <div className="border border-[#d4cfc4] rounded overflow-hidden">
        <div className="bg-[#f2efe8] border-b border-[#d4cfc4] p-4">
          <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-[#3d3a33]">
            <div>Campo Padrão</div>
            <div>Nome no Seu Arquivo</div>
            <div>Descrição</div>
          </div>
        </div>

        <div className="divide-y divide-[#d4cfc4]">
          {Object.entries(campos).map(([chave, campo]) => {
            const eObrigatorio = campo.obrigatorio
            const naoMapeado = eObrigatorio && !mapeamento[chave]

            return (
              <div
                key={chave}
                className={`p-4 grid grid-cols-3 gap-4 ${
                  naoMapeado ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-lg ${eObrigatorio ? 'text-red-600' : 'text-gray-400'}`}>
                    {eObrigatorio ? '📌' : '○'}
                  </span>
                  <span className="text-sm font-medium text-[#1a1712]">{campo.label}</span>
                </div>

                <div>
                  <div className="flex gap-2 items-stretch">
                    <input
                      type="text"
                      value={mapeamento[chave] || ''}
                      onChange={(e) => {
                        handleMapeamentoChange(chave, e.target.value)
                        setSugestoesAtivas((prev) => {
                          const novo = { ...prev }
                          delete novo[chave]
                          return novo
                        })
                      }}
                      placeholder="Digite o nome da coluna"
                      className={`flex-1 px-3 py-2 text-sm border rounded focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent outline-none transition-all text-[#1a1712] ${
                        naoMapeado
                          ? 'border-[rgba(122,36,36,0.5)] bg-[#fdf0f0]'
                          : 'border-[#d4cfc4] bg-[#f2efe8]'
                      }`}
                    />
                    {sugestoesAtivas[chave] && (
                      <div className={`px-3 py-2 rounded text-xs font-semibold flex items-center whitespace-nowrap ${
                        sugestoesAtivas[chave] === 100
                          ? 'bg-[rgba(45,90,61,0.2)] text-[#7fc49a]'
                          : 'bg-[rgba(196,162,100,0.15)] text-[#c4a264]'
                      }`}>
                        {sugestoesAtivas[chave]}%
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-xs text-[#6b6760] flex items-center pt-1">
                  {campo.descricao}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Messages */}
      {erro && (
        <div className="bg-[#fdf0f0] border border-[rgba(122,36,36,0.3)] rounded p-4">
          <p className="text-sm text-[#7a2424]">{erro}</p>
        </div>
      )}

      {sucesso && (
        <div className="bg-[rgba(45,90,61,0.1)] border border-[rgba(45,90,61,0.3)] rounded p-4">
          <p className="text-sm text-[#2d5a3d]">✓ Mapeamento salvo com sucesso!</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-[#d4cfc4]">
        <button
          onClick={handleCancelar}
          disabled={!mudancasNaoSalvas || salvando}
          className="flex-1 px-4 py-2 text-sm border border-[#d4cfc4] rounded text-[#3d3a33] bg-[#f2efe8] hover:border-[#8b6f3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          Cancelar
        </button>
        <button
          onClick={handleSalvar}
          disabled={!mudancasNaoSalvas || salvando}
          className="flex-1 px-4 py-2 text-sm bg-[#1a2e22] hover:bg-[#243d2e] disabled:bg-[rgba(250,248,243,0.1)] disabled:cursor-not-allowed text-[#c4a264] disabled:text-[rgba(250,248,243,0.3)] rounded transition-colors font-medium flex items-center justify-center gap-2"
        >
          {salvando ? (
            <>
              <Loader size={14} className="animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </button>
      </div>
    </div>
  )
}
