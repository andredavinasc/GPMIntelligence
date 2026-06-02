import { createSupabaseServer } from '@/lib/supabase-server'
import { TipoCarga, StatusDados } from '@/lib/types/mapeamento'

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
    console.log(`[status-dados] Consultando tabela: ${tabela} para tipo: ${tipo}`)

    // Check if there's data in the table
    const { data, count, error } = await supabase
      .from(tabela)
      .select('inserted_at', { count: 'exact', head: false })
      .order('inserted_at', { ascending: false })
      .limit(1)

    if (error) {
      console.error(`[status-dados] Erro ao consultar ${tabela}:`, error)
      throw error
    }

    const temDados = count && count > 0

    if (!temDados) {
      const resultado: StatusDados = { temDados: false }
      console.log(`[status-dados] Nenhum dado em ${tabela}`)
      return Response.json(resultado)
    }

    const resultado: StatusDados = {
      temDados: true,
      ultimaCarga: data?.[0]
        ? {
            tipo,
            linhas: count || 0,
            data: data[0].inserted_at,
          }
        : undefined,
    }

    console.log(`[status-dados] Dados encontrados em ${tabela}: ${count} linhas`)
    return Response.json(resultado)
  } catch (error) {
    console.error('[status-dados] Erro:', error)
    return Response.json(
      {
        error: 'Erro ao verificar status dos dados',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
