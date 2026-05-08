import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { data, semana_ref } = body

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, message: 'Invalid data format. Expected array.' },
        { status: 400 }
      )
    }

    if (!semana_ref) {
      return NextResponse.json(
        { success: false, message: 'semana_ref is required' },
        { status: 400 }
      )
    }

    if (data.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No data to insert' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, message: 'Supabase not configured' },
        { status: 500 }
      )
    }

    // Delete existing OKRs for this week (upsert logic)
    await fetch(`${supabaseUrl}/rest/v1/okrs?semana_ref=eq.${semana_ref}`, {
      method: 'DELETE',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    })

    // Insert new OKRs data
    const response = await fetch(`${supabaseUrl}/rest/v1/okrs`, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify({
        semana_ref,
        payload: data,
        fonte: 'excel_upload',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, message: `Failed to save: ${error}` },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${data.length} OKRs saved successfully`,
    })
  } catch (error) {
    console.error('Error in okrs upload:', error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

