import { createSupabaseServer } from '@/lib/supabase-server'

function converterDataParaISO(dataStr: string): string {
  if (!dataStr) return dataStr

  // Se já está em formato ISO (YYYY-MM-DD), retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
    return dataStr
  }

  // Converte de DD/MM/YYYY para YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
    const [dia, mes, ano] = dataStr.split('/')
    return `${ano}-${mes}-${dia}`
  }

  return dataStr
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const semanaRef = searchParams.get('semana_ref')

  if (!semanaRef) {
    return Response.json(
      { error: 'semana_ref is required' },
      { status: 400 }
    )
  }

  // Converter para formato ISO se necessário
  const semanaRefISO = converterDataParaISO(semanaRef)

  const supabase = createSupabaseServer()

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser()
    if (userError || !userData.user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const tabelas = ['okrs', 'work_items', 'agility_data']
    const resultados: Record<string, { temDados: boolean; registros: number }> = {}

    for (const tabela of tabelas) {
      const { count, error } = await supabase
        .from(tabela)
        .select('*', { count: 'exact', head: true })
        .eq('semana_ref', semanaRefISO)

      if (error) {
        console.error(`[validar-dados-semana] Erro ao consultar ${tabela}:`, error)
        return Response.json(
          { error: `Erro ao verificar dados de ${tabela}` },
          { status: 500 }
        )
      }

      resultados[tabela] = {
        temDados: (count ?? 0) > 0,
        registros: count ?? 0,
      }
    }

    const todosComDados = Object.values(resultados).every((r) => r.temDados)

    if (!todosComDados) {
      const tabelasSemDados = Object.entries(resultados)
        .filter(([_, r]) => !r.temDados)
        .map(([tabela]) => {
          if (tabela === 'okrs') return 'OKRs'
          if (tabela === 'work_items') return 'Work Items'
          if (tabela === 'agility_data') return 'Dados de Agilidade'
          return tabela
        })

      return Response.json(
        {
          valido: false,
          mensagem: `Dados faltando para a semana ${semanaRef}: ${tabelasSemDados.join(', ')}. Por favor, carregue os dados necessários antes de rodar a análise.`,
          tabelasComDados: resultados,
        },
        { status: 200 }
      )
    }

    return Response.json({
      valido: true,
      mensagem: 'Todos os dados necessários estão presentes',
      tabelasComDados: resultados,
    })
  } catch (error) {
    console.error('[validar-dados-semana] Erro:', error)
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
