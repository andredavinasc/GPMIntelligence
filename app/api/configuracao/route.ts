import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const { supabase } = await import('@/lib/supabase')

    const { data, error } = await supabase.from('configuracao').select('*').single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json(data || null)
  } catch (error) {
    console.error('Erro ao carregar configuração:', error)
    return NextResponse.json({ error: 'Erro ao carregar configuração' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { empresa, setor, nome, objetivo } = await request.json()

    if (!empresa || !setor || !nome || !objetivo) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    const { supabase } = await import('@/lib/supabase')

    // Buscar configuração existente
    const { data: existente, error: selectError } = await supabase
      .from('configuracao')
      .select('id')
      .maybeSingle()

    if (selectError) {
      console.error('Erro ao buscar configuração:', selectError)
      throw selectError
    }

    let result

    if (existente) {
      // Atualizar registro existente
      const { data, error } = await supabase
        .from('configuracao')
        .update({
          empresa,
          setor,
          nome,
          objetivo,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existente.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar:', error)
        throw error
      }
      result = data
    } else {
      // Inserir novo registro
      const { data, error } = await supabase
        .from('configuracao')
        .insert({
          empresa,
          setor,
          nome,
          objetivo,
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao inserir:', error)
        throw error
      }
      result = data
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erro ao salvar configuração:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar configuração'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
