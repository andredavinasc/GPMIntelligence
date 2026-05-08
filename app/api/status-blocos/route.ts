import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `${supabaseUrl}/rest/v1/v_blocos_status`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch status' },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      blocos: data,
    })
  } catch (error) {
    console.error('Error fetching blocos status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
