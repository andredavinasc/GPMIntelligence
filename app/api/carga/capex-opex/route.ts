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

    // Fetch configuration to get meta values
    let metaCapex = 80
    let metaOpex = 20

    try {
      const configResponse = await fetch(`${supabaseUrl}/rest/v1/configuracao?select=objetivo_capex,objetivo_opex`, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      })

      if (configResponse.ok) {
        const configData = await configResponse.json()
        if (configData && configData.length > 0) {
          metaCapex = configData[0].objetivo_capex ?? 80
          metaOpex = configData[0].objetivo_opex ?? 20
        }
      }
    } catch (err) {
      console.warn('Failed to fetch configuration, using defaults:', err)
    }

    // Delete existing CAPEX/OPEX data for this week (upsert logic)
    const deleteResponse = await fetch(
      `${supabaseUrl}/rest/v1/capex_opex?semana_ref=eq.${semana_ref}`,
      {
        method: 'DELETE',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!deleteResponse.ok) {
      console.warn('Delete returned non-ok status, continuing:', deleteResponse.status)
    }

    // Insert new CAPEX/OPEX data with timestamps
    const now = new Date().toISOString()
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
        meta_capex: metaCapex,
        meta_opex: metaOpex,
        inserted_at: now,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { success: false, error: `Supabase error: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('CAPEX/OPEX saved successfully for week:', semana_ref)

    return NextResponse.json({
      success: true,
      message: 'CAPEX/OPEX data saved successfully for the current week',
      data,
    })
  } catch (error) {
    console.error('Error in capex-opex upload:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
