import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = createSupabaseServer()

    const { data, error } = await supabase.from('configuracao').select('*').maybeSingle()

    if (error) {
      console.error('Erro ao carregar configuração:', error)
      throw error
    }

    console.log('✓ Configuracao loaded successfully:', data ? 'Data found' : 'No data')

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao carregar configuração:', error)
    return NextResponse.json(
      { error: 'Erro ao carregar configuração' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      empresa,
      setor,
      nome,
      objetivo,
      objetivo_capex,
      objetivo_opex,
      hierarquia_trabalho,
      modelo_trabalho,
    } = await request.json()

    if (!empresa || !setor || !nome || !objetivo) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    // Validation for CAPEX/OPEX: both empty (0) or both filled and sum to 100
    const capexValue = objetivo_capex ?? 0
    const opexValue = objetivo_opex ?? 0
    const hasCapex = capexValue > 0
    const hasOpex = opexValue > 0
    const isCapexOpexValid =
      (!hasCapex && !hasOpex) || // Both empty - valid
      (hasCapex && hasOpex && capexValue + opexValue === 100) // Both set and sum to 100 - valid

    if (!isCapexOpexValid) {
      return NextResponse.json(
        { error: 'Se informar CAPEX/OPEX, ambos campos são obrigatórios e devem somar 100%' },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServer()

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
          objetivo_capex: capexValue || 0,
          objetivo_opex: opexValue || 0,
          hierarquia_trabalho: hierarquia_trabalho || '',
          modelo_trabalho: modelo_trabalho || '',
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
          objetivo_capex: capexValue || 0,
          objetivo_opex: opexValue || 0,
          hierarquia_trabalho: hierarquia_trabalho || '',
          modelo_trabalho: modelo_trabalho || '',
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
