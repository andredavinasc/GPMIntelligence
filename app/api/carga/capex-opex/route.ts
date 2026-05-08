import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { capex_pct, opex_pct, semana_ref } = body

    if (!semana_ref || capex_pct === undefined || opex_pct === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: semana_ref, capex_pct, opex_pct' },
        { status: 400 }
      )
    }

    if (capex_pct + opex_pct !== 100) {
      return NextResponse.json(
        { error: 'capex_pct + opex_pct must equal 100' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    // Delete existing CAPEX/OPEX data for this week (upsert logic)
    await fetch(`${supabaseUrl}/rest/v1/capex_opex?semana_ref=eq.${semana_ref}`, {
      method: 'DELETE',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    // Insert new CAPEX/OPEX data
    const response = await fetch(`${supabaseUrl}/rest/v1/capex_opex`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        semana_ref,
        capex_pct,
        opex_pct,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { success: false, error: `Supabase error: ${error}` },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'CAPEX/OPEX data saved successfully'
    })
  } catch (error) {
    console.error('Error in capex-opex upload:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
