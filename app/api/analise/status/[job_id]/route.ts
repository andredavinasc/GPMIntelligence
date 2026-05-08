import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { job_id: string } }
) {
  try {
    const { job_id } = params

    if (!job_id) {
      return NextResponse.json(
        { error: 'job_id is required' },
        { status: 400 }
      )
    }

    // Query the database for job status
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${supabaseUrl}/rest/v1/analysis_jobs?job_id=eq.${job_id}`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to query status' },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      return NextResponse.json(
        { status: 'nao_encontrado', message: 'Job not found' },
        { status: 404 }
      )
    }

    const job = data[0]

    return NextResponse.json({
      job_id,
      status: job.status,
      semana_ref: job.semana_ref,
      created_at: job.created_at,
      updated_at: job.updated_at,
      message: job.error_message || undefined,
    })
  } catch (error) {
    console.error('Error getting job status:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
