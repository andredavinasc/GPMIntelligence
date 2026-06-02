import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'

// Debug endpoint to diagnose configuracao loading issues
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseServer()

    console.log('🔍 Debug: Starting configuracao query')

    // Test 1: Check if table exists and count records
    const { count, error: countError } = await supabase
      .from('configuracao')
      .select('*', { count: 'exact', head: true })

    console.log(`📊 Total records in configuracao: ${count}`)
    if (countError) console.error('Count error:', countError)

    // Test 2: Try to fetch all records
    const { data: allData, error: allError } = await supabase
      .from('configuracao')
      .select('*')

    console.log(`📋 All records:`, allData)
    if (allError) console.error('Select all error:', allError)

    // Test 3: Try maybeSingle
    const { data: singleData, error: singleError } = await supabase
      .from('configuracao')
      .select('*')
      .maybeSingle()

    console.log(`🎯 maybeSingle result:`, singleData)
    if (singleError) console.error('maybeSingle error:', singleError)

    // Test 4: Try selecting specific columns
    const { data: specificData, error: specificError } = await supabase
      .from('configuracao')
      .select('id, empresa, setor, nome, objetivo, objetivo_capex, objetivo_opex')
      .maybeSingle()

    console.log(`🎯 Specific columns result:`, specificData)
    if (specificError) console.error('Specific columns error:', specificError)

    // Return debug info
    return NextResponse.json({
      debug: true,
      timestamp: new Date().toISOString(),
      results: {
        totalRecords: count,
        allRecords: allData,
        singleRecord: singleData,
        specificColumnsRecord: specificData,
      },
      errors: {
        countError,
        allError,
        singleError,
        specificError,
      },
    })
  } catch (error) {
    console.error('❌ Debug endpoint error:', error)
    return NextResponse.json(
      {
        debug: true,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
