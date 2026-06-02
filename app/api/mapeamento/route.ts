import { createSupabaseServer } from '@/lib/supabase-server'
import { SchemaMappingRecord, TipoCarga } from '@/lib/types/mapeamento'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tipo = searchParams.get('tipo') as TipoCarga

  if (!tipo || !['okrs', 'work_items', 'agilidade'].includes(tipo)) {
    return Response.json({ error: 'tipo inválido' }, { status: 400 })
  }

  const supabase = createSupabaseServer()

  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('schema_mapping')
      .select('*')
      .eq('tenant_id', userData.user.id)
      .eq('tipo_carga', tipo)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No matching rows
        return Response.json(
          { id: '', tenant_id: userData.user.id, tipo_carga: tipo, mapeamento: {}, created_at: '', updated_at: '' },
          { status: 200 }
        )
      }
      throw error
    }

    return Response.json(data)
  } catch (error) {
    console.error('Erro ao carregar mapeamento:', error)
    return Response.json({ error: 'Erro ao carregar mapeamento' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const { tipoCarga, mapeamento } = (await request.json()) as {
    tipoCarga: TipoCarga
    mapeamento: Record<string, string>
  }

  if (!tipoCarga || !['okrs', 'work_items', 'agilidade'].includes(tipoCarga)) {
    return Response.json({ error: 'tipoCarga inválido' }, { status: 400 })
  }

  if (!mapeamento || typeof mapeamento !== 'object') {
    return Response.json({ error: 'mapeamento inválido' }, { status: 400 })
  }

  const supabase = createSupabaseServer()

  try {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) {
      return Response.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('schema_mapping')
      .upsert(
        {
          tenant_id: userData.user.id,
          tipo_carga: tipoCarga,
          mapeamento,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'tenant_id,tipo_carga',
        }
      )
      .select()
      .single()

    if (error) throw error

    return Response.json(data)
  } catch (error) {
    console.error('Erro ao salvar mapeamento:', error)
    return Response.json({ error: 'Erro ao salvar mapeamento' }, { status: 500 })
  }
}
