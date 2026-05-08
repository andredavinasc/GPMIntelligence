import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { semana: string } }
) {
  try {
    const { semana } = params

    if (!semana) {
      return NextResponse.json(
        { error: 'semana is required' },
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

    const response = await fetch(
      `${supabaseUrl}/rest/v1/weekly_analyses?semana_ref=eq.${semana}`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch analysis' },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error fetching analysis:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
