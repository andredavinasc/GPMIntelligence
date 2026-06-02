import { createSupabaseServer } from '@/lib/supabase-server'
import { TipoCarga, ResultadoDeteccao } from '@/lib/types/mapeamento'
import { detectarCampo, extrairColunasDoPayload } from '@/lib/fieldDictionary'

const tipoParaTabela: Record<TipoCarga, string> = {
  okrs: 'okrs',
  work_items: 'work_items',
  agilidade: 'agility_data',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo') as TipoCarga

  if (!tipo || !['okrs', 'work_items', 'agilidade'].includes(tipo)) {
    return Response.json({ error: 'tipo inválido' }, { status: 400 })
  }

  const supabase = createSupabaseServer()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      console.error('Auth error:', userError)
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const tabela = tipoParaTabela[tipo]
    console.log(`[detectar-campos] Consultando tabela: ${tabela} para tipo: ${tipo}`)

    // Fetch last 10 rows with payload
    const { data, error } = await supabase
      .from(tabela)
      .select('payload')
      .order('inserted_at', { ascending: false })
      .limit(10)

    if (error) {
      console.error(`[detectar-campos] Erro ao consultar ${tabela}:`, error)
      throw error
    }

    if (!data || data.length === 0) {
      console.log(`[detectar-campos] Nenhum dado em ${tabela}`)
      return Response.json({ error: 'Nenhum dado encontrado' }, { status: 404 })
    }

    // Extract all columns from payloads
    const colunas = new Set<string>()
    data.forEach((row: any) => {
      if (!row.payload) return

      // Handle payload as array of objects or single object
      const payloadArray = Array.isArray(row.payload) ? row.payload : [row.payload]

      payloadArray.forEach((item: any) => {
        if (item && typeof item === 'object') {
          Object.keys(item).forEach((key) => colunas.add(key))
        }
      })
    })

    // Detect fields
    const sugestoes: Record<string, { valor: string; confianca: number }> = {}
    colunas.forEach((coluna) => {
      const deteccao = detectarCampo(coluna)
      if (deteccao) {
        sugestoes[deteccao.campo] = {
          valor: coluna,
          confianca: deteccao.confianca,
        }
      }
    })

    const resultado: ResultadoDeteccao = {
      sugestoes,
      colunasEncontradas: Array.from(colunas).sort(),
    }

    console.log(`[detectar-campos] ${colunas.size} colunas encontradas, ${Object.keys(sugestoes).length} detectadas`)
    return Response.json(resultado)
  } catch (error) {
    console.error('[detectar-campos] Erro:', error)
    return Response.json(
      {
        error: 'Erro ao detectar campos',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
