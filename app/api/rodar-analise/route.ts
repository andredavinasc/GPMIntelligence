import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { semana_ref } = body

    if (!semana_ref) {
      return NextResponse.json(
        { error: 'semana_ref is required' },
        { status: 400 }
      )
    }

    const n8nWebhook = process.env.N8N_RODAR_ANALISE_WEBHOOK
    if (!n8nWebhook) {
      return NextResponse.json(
        { error: 'N8N webhook not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(n8nWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semana_ref }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `N8N error: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      job_id: data.job_id || `job-${Date.now()}`,
      status: 'processando',
      semana_ref,
    })
  } catch (error) {
    console.error('Error in rodar-analise:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
