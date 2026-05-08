import { WeeklyAnalysis } from './types'

interface NarrativaFinal {
  semana_ref: string
  resumo_executivo?: string
  saude_geral?: {
    score?: number
    classificacao?: string
    justificativa?: string
  }
  capex_opex?: {
    percentual_real_controladoria?: number
    status_meta_real?: string
    percentual_tendencia_iniciativas?: number
    tendencia_direcao?: string
    principal_problema?: string
    projecao_com_pre_classificacao?: string
    acao_recomendada?: string
  }
  agilidade_resumo?: {
    equipe_melhor_desempenho?: string
    equipe_maior_risco?: string
    principal_sinal?: string
    impacto_nos_okrs?: string
  }
  sinais_externos?: {
    indicadores_economicos?: string
    regulatorio_impacta_portfolio?: Array<{
      norma?: string
      iniciativa_afetada?: string
      risco?: string
      acao?: string
    }>
    mercado_impacta_estrategia?: string
    alerta_cyber?: string
  }
  okrs_vs_portfolio?: Array<{
    okr_titulo?: string
    atingimento_trimestre?: string
    iniciativas_contribuindo?: string[]
    saude_execucao?: string
    gap?: string
    risco?: string
  }>
  iniciativas_criticas?: Array<{
    titulo?: string
    equipe_responsavel?: string
    semestre?: string
    motivo?: string
    acao?: string
  }>
  comparacao_semana_anterior?: {
    status?: string
    narrativa?: string
  }
  pauta_reuniao?: Array<{
    ordem?: number
    topico?: string
    tempo_sugerido?: string
    tipo?: string
    contexto?: string
    resultado_esperado?: string
  }>
  alertas?: Array<{
    nivel?: string
    fonte?: string
    mensagem?: string
    acao_recomendada?: string
  }>
  recomendacoes_proxima_semana?: Array<{
    prioridade?: number
    acao?: string
    impacto_esperado?: string
    fonte_evidencia?: string
  }>
}

interface AgenteProduto {
  total_iniciativas: number
  total_releases: number
  total_epicos: number
  total_user_stories: number
  capex_opex_portfolio: {
    iniciativas_capex: number
    iniciativas_opex: number
    iniciativas_sem_classificacao: number
    percentual_capex_estimado: number
    status_meta: string
    interpretacao: string
  }
  padroes_identificados: string
  alertas: Array<{
    nivel: string
    mensagem: string
    acao_recomendada: string
  }>
}

interface AgentEstrategia {
  total_objetivos: number
  total_key_results: number
  area_foco: string
  gaps_estrategicos: string[]
  recomendacoes: Array<{
    prioridade: number
    acao: string
    motivo: string
  }>
}

interface AgenteAgilidade {
  semana_ref: string
  saude_geral_fluxo: {
    score: number
    classificacao: string
    justificativa: string
  }
  consolidado_geral: {
    vazao: number
    lead_time_p85: number
    cycle_time_p85: number
    variabilidade: number
    interpretacao: string
  }
  equipes: Array<{
    equipe: string
    vazao: number
    variabilidade: number
    lead_time_p85: number
    cycle_time_p85: number
    saude: string
    pontos_positivos: string[]
    pontos_atencao: string[]
    interpretacao: string
  }>
  comparacao_equipes: string
  alertas: Array<{
    nivel: string
    equipe: string
    mensagem: string
    acao_recomendada: string
  }>
  recomendacoes: Array<{
    prioridade: number
    equipe: string
    acao: string
    impacto_esperado: string
  }>
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'critico':
      return '#dc2626'
    case 'atencao':
    case 'amarelo':
      return '#ea580c'
    case 'info':
    case 'verde':
      return '#16a34a'
    default:
      return '#6b7280'
  }
}

function getHealthScore(score: number): string {
  if (score < 30) return 'Crítico'
  if (score < 60) return 'Atenção'
  if (score < 80) return 'Aceitável'
  return 'Saudável'
}

export function generateAnalysisHTML(analysis: WeeklyAnalysis): string {
  try {
    let narrativa: NarrativaFinal = {
      semana_ref: analysis.semana_ref,
    }

    if (analysis.narrativa_final) {
      try {
        const parsed = JSON.parse(
          typeof analysis.narrativa_final === 'string'
            ? analysis.narrativa_final
            : JSON.stringify(analysis.narrativa_final)
        )
        narrativa = { ...narrativa, ...parsed }
      } catch (e) {
        console.error('Error parsing narrativa_final:', e)
      }
    }

    const resumoExecutivo = narrativa.resumo_executivo || 'Análise em processamento...'

    const saudeGeral = narrativa.saude_geral || {}
    const saudeScore = saudeGeral.score || 0
    const saudeClassificacao = saudeGeral.classificacao || 'indefinido'
    const saudeJustificativa = saudeGeral.justificativa || 'Análise em andamento'

    const capexOpex = narrativa.capex_opex || {}
    const capexPercentual = capexOpex.percentual_real_controladoria ?? 0
    const capexStatus = capexOpex.status_meta_real?.toUpperCase() || 'PENDENTE'
    const capexProblema = capexOpex.principal_problema || ''
    const capexAcao = capexOpex.acao_recomendada || ''

    const alertas = Array.isArray(narrativa.alertas) ? narrativa.alertas : []
    const okrsVsPortfolio = Array.isArray(narrativa.okrs_vs_portfolio) ? narrativa.okrs_vs_portfolio : []
    const recomendacoes = Array.isArray(narrativa.recomendacoes_proxima_semana) ? narrativa.recomendacoes_proxima_semana : []
    const pautaReuniao = Array.isArray(narrativa.pauta_reuniao) ? narrativa.pauta_reuniao : []

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GPM Intelligence - Análise Semanal</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      color: #1f2937;
      line-height: 1.6;
      background-color: #f9fafb;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
      background-color: white;
    }
    .header {
      border-bottom: 3px solid #2d5a3d;
      padding-bottom: 24px;
      margin-bottom: 32px;
    }
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .header p {
      color: #6b7280;
      font-size: 16px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 2px solid #e5e7eb;
    }
    .health-score {
      display: flex;
      align-items: center;
      gap: 20px;
      background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .score-circle {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 40px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .score-info h3 {
      font-size: 18px;
      margin-bottom: 8px;
    }
    .score-info p {
      color: #6b7280;
      font-size: 14px;
    }
    .alert {
      margin-bottom: 16px;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid;
    }
    .alert.critico {
      background-color: #fee2e2;
      border-left-color: #dc2626;
    }
    .alert.critico .alert-title {
      color: #991b1b;
    }
    .alert.atencao {
      background-color: #fed7aa;
      border-left-color: #ea580c;
    }
    .alert.atencao .alert-title {
      color: #92400e;
    }
    .alert.info {
      background-color: #dbeafe;
      border-left-color: #0284c7;
    }
    .alert.info .alert-title {
      color: #0c2340;
    }
    .alert-title {
      font-weight: 600;
      margin-bottom: 4px;
      font-size: 14px;
    }
    .alert-message {
      font-size: 14px;
      margin-bottom: 8px;
    }
    .alert-action {
      font-size: 13px;
      font-style: italic;
      color: #6b7280;
    }
    .capex-opex-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      border: 1px solid #bfdbfe;
    }
    .capex-value {
      font-size: 48px;
      font-weight: 700;
      color: #0284c7;
      margin: 12px 0;
    }
    .capex-meta {
      color: #6b7280;
      font-size: 14px;
      margin-top: 8px;
    }
    .recommendation {
      background: #f9fafb;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 6px;
      border-left: 4px solid #2d5a3d;
    }
    .recommendation-header {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 8px;
    }
    .priority-badge {
      background: #2d5a3d;
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      min-width: 60px;
      text-align: center;
    }
    .recommendation-title {
      font-weight: 600;
      color: #1f2937;
      flex: 1;
    }
    .recommendation-impact {
      font-size: 13px;
      color: #6b7280;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #e5e7eb;
    }
    .okr-item {
      background: #f9fafb;
      padding: 16px;
      margin-bottom: 12px;
      border-radius: 6px;
      border-left: 4px solid #6b7280;
    }
    .okr-title {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .okr-gap {
      font-size: 13px;
      color: #6b7280;
      margin: 8px 0;
    }
    .okr-risk {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .risk-alto {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .risk-medio {
      background-color: #fed7aa;
      color: #92400e;
    }
    .risk-baixo {
      background-color: #dcfce7;
      color: #15803d;
    }
    .narrative-box {
      background: #fffbeb;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .narrative-box p {
      color: #78350f;
      line-height: 1.6;
      font-size: 14px;
    }
    @media print {
      .container {
        max-width: 100%;
        padding: 20px;
      }
      body {
        background-color: white;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 GPM Intelligence - Análise Semanal</h1>
      <p>Semana de ${new Date(analysis.semana_ref).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <!-- RESUMO EXECUTIVO -->
    <div class="section">
      <div class="section-title">📋 Resumo Executivo</div>
      <div class="narrative-box">
        <p>${resumoExecutivo}</p>
      </div>
    </div>

    <!-- SAÚDE GERAL -->
    ${saudeScore > 0 ? `
    <div class="section">
      <div class="section-title">🏥 Saúde Geral do Portfólio</div>
      <div class="health-score">
        <div class="score-circle" style="background-color: ${getStatusColor(saudeClassificacao)}">
          ${saudeScore}
        </div>
        <div class="score-info">
          <h3>${getHealthScore(saudeScore)} - ${saudeClassificacao.toUpperCase()}</h3>
          <p>${saudeJustificativa}</p>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- CAPEX/OPEX -->
    <div class="section">
      <div class="section-title">💰 CAPEX / OPEX</div>
      <div class="capex-opex-card">
        <div style="color: #6b7280; font-size: 14px;">Percentual de Iniciativas CAPEX</div>
        <div class="capex-value">${capexPercentual}%</div>
        <div class="capex-meta">Meta: 80% | Status: <strong>${capexStatus}</strong></div>
      </div>
      ${capexProblema ? `
      <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
        <div style="font-weight: 600; color: #15803d; margin-bottom: 8px;">Problema Principal:</div>
        <p style="color: #166534; font-size: 14px;">${capexProblema}</p>
      </div>
      ` : ''}
      ${capexAcao ? `
      <div style="background: #e0e7ff; padding: 16px; border-radius: 8px;">
        <div style="font-weight: 600; color: #3730a3; margin-bottom: 8px;">Ação Recomendada:</div>
        <p style="color: #312e81; font-size: 14px;">${capexAcao}</p>
      </div>
      ` : ''}
    </div>

    <!-- ALERTAS -->
    ${alertas.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠️ Alertas</div>
      ${alertas
        .map(
          (alert) => {
            const nivel = alert.nivel || 'info'
            const fonte = alert.fonte ? `[${alert.fonte}] ` : ''
            return `
        <div class="alert ${nivel.toLowerCase()}">
          <div class="alert-title">${fonte}${nivel.toUpperCase()}</div>
          <div class="alert-message">${alert.mensagem || ''}</div>
          ${alert.acao_recomendada ? `<div class="alert-action">✓ ${alert.acao_recomendada}</div>` : ''}
        </div>
      `
          }
        )
        .join('')}
    </div>
    ` : ''}

    <!-- OKRs vs Portfolio -->
    ${okrsVsPortfolio.length > 0 ? `
    <div class="section">
      <div class="section-title">🎯 OKRs vs Portfolio</div>
      ${okrsVsPortfolio
        .map(
          (okr) => {
            const risco = okr.risco || 'medio'
            const iniciativas = Array.isArray(okr.iniciativas_contribuindo) ? okr.iniciativas_contribuindo : []
            return `
        <div class="okr-item">
          <div class="okr-title">${okr.okr_titulo || 'OKR sem título'}</div>
          ${okr.gap ? `<div class="okr-gap"><strong>Gap Identificado:</strong> ${okr.gap}</div>` : ''}
          <div>Iniciativas: ${iniciativas.length > 0 ? iniciativas.join(', ') : 'Nenhuma vinculada'}</div>
          <div style="margin-top: 8px;">
            <span class="okr-risk risk-${risco}">Risco: ${risco.toUpperCase()}</span>
          </div>
        </div>
      `
          }
        )
        .join('')}
    </div>
    ` : ''}

    <!-- RECOMENDAÇÕES -->
    ${recomendacoes.length > 0 ? `
    <div class="section">
      <div class="section-title">💡 Recomendações para a Próxima Semana</div>
      ${recomendacoes
        .filter(r => r.prioridade !== undefined && r.prioridade !== null)
        .sort((a, b) => (a.prioridade ?? 999) - (b.prioridade ?? 999))
        .map(
          (rec) => `
        <div class="recommendation">
          <div class="recommendation-header">
            <span class="priority-badge">P${rec.prioridade}</span>
            <span class="recommendation-title">${rec.acao || ''}</span>
          </div>
          ${rec.impacto_esperado ? `
          <div class="recommendation-impact">
            <strong>Impacto Esperado:</strong> ${rec.impacto_esperado}
          </div>
          ` : ''}
          ${rec.fonte_evidencia ? `<div style="font-size: 12px; color: #6b7280; margin-top: 6px;"><strong>Fonte:</strong> ${rec.fonte_evidencia}</div>` : ''}
        </div>
      `
        )
        .join('')}
    </div>
    ` : ''}

    <!-- PAUTA DE REUNIÃO -->
    ${pautaReuniao.length > 0 ? `
    <div class="section">
      <div class="section-title">📅 Pauta de Reunião Recomendada</div>
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;">
        ${pautaReuniao
          .filter(item => item.ordem !== undefined && item.ordem !== null)
          .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999))
          .map(
            (item) => `
          <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #dcfce7;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <div style="background: #15803d; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700;">${item.ordem}</div>
              <div style="font-weight: 600; color: #15803d;">${item.topico || ''}</div>
              ${item.tempo_sugerido ? `<div style="font-size: 12px; color: #6b7280; margin-left: auto;">${item.tempo_sugerido}</div>` : ''}
            </div>
            ${item.contexto ? `<p style="color: #166534; font-size: 13px; margin-left: 44px;">${item.contexto}</p>` : ''}
            ${item.tipo ? `<div style="font-size: 12px; color: #6b7280; margin-left: 44px; margin-top: 4px;"><strong>Tipo:</strong> ${item.tipo}</div>` : ''}
            ${item.resultado_esperado ? `<div style="font-size: 12px; color: #166534; margin-left: 44px; margin-top: 4px;"><strong>Resultado Esperado:</strong> ${item.resultado_esperado}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    </div>
    ` : ''}

    <!-- RODAPÉ -->
    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>GPM Intelligence | Análise Automática | ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `

    return html
  } catch (error) {
    console.error('Error generating analysis HTML:', error)
    return `<div style="padding: 20px; color: #dc2626;">Erro ao gerar relatório. Por favor, tente novamente.</div>`
  }
}

export function generateEstrategiaHTML(analysis: WeeklyAnalysis): string {
  try {
    let estrategia: AgentEstrategia | null = null

    if (analysis.agente_estrategia) {
      try {
        estrategia = JSON.parse(
          typeof analysis.agente_estrategia === 'string'
            ? analysis.agente_estrategia
            : JSON.stringify(analysis.agente_estrategia)
        )
      } catch (e) {
        console.error('Error parsing agente_estrategia:', e)
      }
    }

    if (!estrategia) {
      return `<div style="padding: 20px; color: #6b7280;">Dados de estratégia não disponíveis.</div>`
    }

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GPM Intelligence - Visão Estratégia</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #1f2937; line-height: 1.6; background-color: #f9fafb; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; background-color: white; }
    .header { border-bottom: 3px solid #2d5a3d; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
    .metric { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 16px; }
    .metric-label { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
    .metric-value { font-size: 28px; font-weight: 700; color: #2d5a3d; }
    .gap-item { background: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin-bottom: 12px; border-radius: 4px; }
    .gap-item-title { font-weight: 600; color: #991b1b; margin-bottom: 4px; }
    .gap-item-text { color: #7f1d1d; font-size: 14px; }
    .recommendation { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin-bottom: 12px; border-radius: 4px; }
    .recommendation-header { display: flex; gap: 12px; margin-bottom: 8px; align-items: center; }
    .priority-badge { background: #16a34a; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; white-space: nowrap; }
    .recommendation-title { font-weight: 600; color: #166534; }
    .recommendation-reason { color: #166534; font-size: 14px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Visão Estratégia</h1>
      <p style="color: #6b7280;">Análise de OKRs e Estratégia Semanal</p>
    </div>

    <!-- MÉTRICAS GERAIS -->
    <div class="section">
      <div class="section-title">📈 Métricas Gerais</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div class="metric">
          <div class="metric-label">Total de Objetivos</div>
          <div class="metric-value">${estrategia.total_objetivos}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total de Key Results</div>
          <div class="metric-value">${estrategia.total_key_results}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Área de Foco Principal</div>
          <div style="font-size: 18px; font-weight: 600; color: #2d5a3d; margin-top: 8px;">${estrategia.area_foco}</div>
        </div>
      </div>
    </div>

    <!-- GAPS ESTRATÉGICOS -->
    ${estrategia.gaps_estrategicos && estrategia.gaps_estrategicos.length > 0
      ? `
    <div class="section">
      <div class="section-title">⚠️ Gaps Estratégicos Identificados</div>
      ${estrategia.gaps_estrategicos
        .map(
          (gap) => `
        <div class="gap-item">
          <div class="gap-item-title">• ${gap}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
      : ''
    }

    <!-- RECOMENDAÇÕES -->
    ${estrategia.recomendacoes && estrategia.recomendacoes.length > 0
      ? `
    <div class="section">
      <div class="section-title">💡 Recomendações Estratégicas</div>
      ${estrategia.recomendacoes
        .sort((a, b) => a.prioridade - b.prioridade)
        .map(
          (rec) => `
        <div class="recommendation">
          <div class="recommendation-header">
            <span class="priority-badge">P${rec.prioridade}</span>
            <span class="recommendation-title">${rec.acao}</span>
          </div>
          <div class="recommendation-reason">
            <strong>Motivo:</strong> ${rec.motivo}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    `
      : ''
    }

    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>GPM Intelligence | Visão Estratégia | ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `

    return html
  } catch (error) {
    console.error('Error generating estrategia HTML:', error)
    return `<div style="padding: 20px; color: #dc2626;">Erro ao gerar relatório de estratégia. Por favor, tente novamente.</div>`
  }
}

export function generateProdutoHTML(analysis: WeeklyAnalysis): string {
  try {
    let produto: AgenteProduto | null = null

    if (analysis.agente_produto) {
      try {
        produto = JSON.parse(
          typeof analysis.agente_produto === 'string'
            ? analysis.agente_produto
            : JSON.stringify(analysis.agente_produto)
        )
      } catch (e) {
        console.error('Error parsing agente_produto:', e)
      }
    }

    if (!produto) {
      return `<div style="padding: 20px; color: #6b7280;">Dados de produto não disponíveis.</div>`
    }

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GPM Intelligence - Visão Produto</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #1f2937; line-height: 1.6; background-color: #f9fafb; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; background-color: white; }
    .header { border-bottom: 3px solid #0369a1; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
    .metric { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 16px; }
    .metric-label { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
    .metric-value { font-size: 28px; font-weight: 700; color: #0369a1; }
    .alert { padding: 16px; border-radius: 8px; border-left: 4px solid; margin-bottom: 16px; }
    .alert.critico { background-color: #fee2e2; border-left-color: #dc2626; }
    .alert.critico .alert-title { color: #991b1b; }
    .alert.atencao { background-color: #fed7aa; border-left-color: #ea580c; }
    .alert.atencao .alert-title { color: #92400e; }
    .alert.info { background-color: #dbeafe; border-left-color: #0284c7; }
    .alert.info .alert-title { color: #0c2d6b; }
    .alert-title { font-weight: 600; margin-bottom: 4px; }
    .alert-message { font-size: 14px; }
    .capex-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Visão Produto</h1>
      <p style="color: #6b7280;">Análise de Desenvolvimento e Portfolio Semanal</p>
    </div>

    <!-- MÉTRICAS GERAIS -->
    <div class="section">
      <div class="section-title">📊 Métricas do Portfolio</div>
      <div class="capex-grid">
        <div class="metric">
          <div class="metric-label">Total de Iniciativas</div>
          <div class="metric-value">${produto.total_iniciativas}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total de Releases</div>
          <div class="metric-value">${produto.total_releases}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total de Épicos</div>
          <div class="metric-value">${produto.total_epicos}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Total de User Stories</div>
          <div class="metric-value">${produto.total_user_stories}</div>
        </div>
      </div>
    </div>

    <!-- CAPEX/OPEX PORTFOLIO -->
    ${produto.capex_opex_portfolio
      ? `
    <div class="section">
      <div class="section-title">💰 Análise CAPEX / OPEX</div>
      <div style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 24px; border-radius: 8px;">
        <div class="capex-grid">
          <div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Iniciativas CAPEX</p>
            <p style="font-size: 24px; font-weight: 700; color: #0369a1;">${produto.capex_opex_portfolio.iniciativas_capex}</p>
          </div>
          <div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Iniciativas OPEX</p>
            <p style="font-size: 24px; font-weight: 700; color: #0369a1;">${produto.capex_opex_portfolio.iniciativas_opex}</p>
          </div>
          <div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">Sem Classificação</p>
            <p style="font-size: 24px; font-weight: 700; color: #6b7280;">${produto.capex_opex_portfolio.iniciativas_sem_classificacao}</p>
          </div>
          <div>
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 8px;">% CAPEX Estimado</p>
            <p style="font-size: 24px; font-weight: 700; color: #0369a1;">${produto.capex_opex_portfolio.percentual_capex_estimado}%</p>
          </div>
        </div>
        <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;"><strong>Status da Meta:</strong> ${produto.capex_opex_portfolio.status_meta}</p>
          <p style="color: #1f2937; font-size: 14px;">${produto.capex_opex_portfolio.interpretacao}</p>
        </div>
      </div>
    </div>
    `
      : ''
    }

    <!-- PADRÕES IDENTIFICADOS -->
    ${produto.padroes_identificados
      ? `
    <div class="section">
      <div class="section-title">🔍 Padrões Identificados</div>
      <div style="background: #f0f9ff; border-left: 4px solid #0284c7; padding: 20px; border-radius: 8px;">
        <p style="color: #0c2d6b; line-height: 1.8;">${produto.padroes_identificados}</p>
      </div>
    </div>
    `
      : ''
    }

    <!-- ALERTAS -->
    ${produto.alertas && produto.alertas.length > 0
      ? `
    <div class="section">
      <div class="section-title">⚠️ Alertas</div>
      ${produto.alertas
        .map(
          (alerta) => `
        <div class="alert ${alerta.nivel.toLowerCase()}">
          <div class="alert-title">${alerta.mensagem}</div>
          <div class="alert-message"><strong>Ação Recomendada:</strong> ${alerta.acao_recomendada}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
      : ''
    }

    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>GPM Intelligence | Visão Produto | ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `

    return html
  } catch (error) {
    console.error('Error generating produto HTML:', error)
    return `<div style="padding: 20px; color: #dc2626;">Erro ao gerar relatório de produto. Por favor, tente novamente.</div>`
  }
}

export function generateAgilidadeHTML(analysis: WeeklyAnalysis): string {
  try {
    let agilidade: AgenteAgilidade | null = null

    if (analysis.agente_agilidade) {
      try {
        agilidade = JSON.parse(
          typeof analysis.agente_agilidade === 'string'
            ? analysis.agente_agilidade
            : JSON.stringify(analysis.agente_agilidade)
        )
      } catch (e) {
        console.error('Error parsing agente_agilidade:', e)
      }
    }

    if (!agilidade) {
      return `<div style="padding: 20px; color: #6b7280;">Dados de agilidade não disponíveis.</div>`
    }

    function getSaudeColor(saude: string): string {
      switch (saude.toLowerCase()) {
        case 'verde':
          return '#16a34a'
        case 'amarelo':
        case 'atencao':
          return '#ea580c'
        case 'vermelho':
        case 'critico':
          return '#dc2626'
        default:
          return '#6b7280'
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GPM Intelligence - Visão Agilidade</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; color: #1f2937; line-height: 1.6; background-color: #f9fafb; }
    .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; background-color: white; }
    .header { border-bottom: 3px solid #7c3aed; padding-bottom: 24px; margin-bottom: 32px; }
    .header h1 { font-size: 32px; font-weight: 700; color: #1f2937; margin-bottom: 8px; }
    .section { margin-bottom: 40px; }
    .section-title { font-size: 24px; font-weight: 700; color: #1f2937; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; }
    .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .metric { background: #f9fafb; padding: 20px; border-radius: 8px; }
    .metric-label { color: #6b7280; font-size: 14px; margin-bottom: 8px; }
    .metric-value { font-size: 28px; font-weight: 700; color: #7c3aed; }
    .health-box { background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); padding: 24px; border-radius: 8px; margin-bottom: 24px; }
    .health-score { display: flex; align-items: center; gap: 20px; }
    .score-circle { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 40px; font-weight: 700; flex-shrink: 0; }
    .score-info h3 { font-size: 18px; margin-bottom: 8px; color: #1f2937; }
    .score-info p { color: #6b7280; font-size: 14px; }
    .equipe-card { background: #f9fafb; border-left: 4px solid; padding: 20px; margin-bottom: 16px; border-radius: 4px; }
    .equipe-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .equipe-nome { font-size: 18px; font-weight: 600; color: #1f2937; }
    .equipe-saude { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; color: white; }
    .equipe-metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 12px; }
    .equipe-metric { font-size: 12px; }
    .equipe-metric-label { color: #6b7280; }
    .equipe-metric-value { font-size: 18px; font-weight: 600; color: #7c3aed; }
    .equipe-items { margin-top: 12px; }
    .equipe-item { font-size: 12px; margin: 4px 0; padding: 4px 0; }
    .item-positivo { color: #166534; }
    .item-atencao { color: #92400e; }
    .alert { padding: 16px; border-radius: 8px; border-left: 4px solid; margin-bottom: 16px; }
    .alert.critico { background-color: #fee2e2; border-left-color: #dc2626; }
    .alert.critico .alert-title { color: #991b1b; }
    .alert.atencao { background-color: #fed7aa; border-left-color: #ea580c; }
    .alert.atencao .alert-title { color: #92400e; }
    .alert.info { background-color: #dbeafe; border-left-color: #0284c7; }
    .alert.info .alert-title { color: #0c2d6b; }
    .alert-title { font-weight: 600; margin-bottom: 4px; }
    .alert-message { font-size: 14px; }
    .recommendation { background: #f0fdf4; border-left: 4px solid #16a34a; padding: 16px; margin-bottom: 12px; border-radius: 4px; }
    .recommendation-header { display: flex; gap: 12px; margin-bottom: 8px; align-items: center; }
    .priority-badge { background: #16a34a; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; white-space: nowrap; }
    .recommendation-title { font-weight: 600; color: #166534; }
    .recommendation-impact { color: #166534; font-size: 14px; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏃 Visão Agilidade</h1>
      <p style="color: #6b7280;">Métricas de Fluxo e Performance</p>
    </div>

    <!-- SAÚDE GERAL DO FLUXO -->
    <div class="section">
      <div class="section-title">🏥 Saúde Geral do Fluxo</div>
      <div class="health-box">
        <div class="health-score">
          <div class="score-circle" style="background: ${getSaudeColor(agilidade.saude_geral_fluxo.classificacao)};">${agilidade.saude_geral_fluxo.score}</div>
          <div class="score-info">
            <h3>${agilidade.saude_geral_fluxo.classificacao}</h3>
            <p>${agilidade.saude_geral_fluxo.justificativa}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- CONSOLIDADO GERAL -->
    <div class="section">
      <div class="section-title">📊 Consolidado Geral</div>
      <div class="metric-grid">
        <div class="metric">
          <div class="metric-label">Vazão (items/semana)</div>
          <div class="metric-value">${agilidade.consolidado_geral.vazao}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Lead Time P85 (dias)</div>
          <div class="metric-value">${agilidade.consolidado_geral.lead_time_p85}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Cycle Time P85 (dias)</div>
          <div class="metric-value">${agilidade.consolidado_geral.cycle_time_p85}</div>
        </div>
        <div class="metric">
          <div class="metric-label">Variabilidade</div>
          <div class="metric-value">${agilidade.consolidado_geral.variabilidade}%</div>
        </div>
      </div>
      <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a;">
        <p style="font-size: 14px; color: #166534;">${agilidade.consolidado_geral.interpretacao}</p>
      </div>
    </div>

    <!-- ANÁLISE POR EQUIPES -->
    <div class="section">
      <div class="section-title">👥 Análise por Equipes</div>
      ${agilidade.equipes
        .map(
          (equipe) => `
        <div class="equipe-card" style="border-left-color: ${getSaudeColor(equipe.saude)};">
          <div class="equipe-header">
            <span class="equipe-nome">${equipe.equipe}</span>
            <span class="equipe-saude" style="background: ${getSaudeColor(equipe.saude)};">${equipe.saude.toUpperCase()}</span>
          </div>

          <div class="equipe-metrics">
            <div class="equipe-metric">
              <div class="equipe-metric-label">Vazão</div>
              <div class="equipe-metric-value">${equipe.vazao}</div>
            </div>
            <div class="equipe-metric">
              <div class="equipe-metric-label">Lead Time P85</div>
              <div class="equipe-metric-value">${equipe.lead_time_p85}d</div>
            </div>
            <div class="equipe-metric">
              <div class="equipe-metric-label">Cycle Time P85</div>
              <div class="equipe-metric-value">${equipe.cycle_time_p85}d</div>
            </div>
            <div class="equipe-metric">
              <div class="equipe-metric-label">Variabilidade</div>
              <div class="equipe-metric-value">${equipe.variabilidade}%</div>
            </div>
          </div>

          <div class="equipe-items">
            <div style="font-weight: 600; font-size: 12px; margin-bottom: 6px; color: #166534;">✓ Pontos Positivos:</div>
            ${equipe.pontos_positivos.map((ponto) => `<div class="equipe-item item-positivo">• ${ponto}</div>`).join('')}

            <div style="font-weight: 600; font-size: 12px; margin: 8px 0 6px 0; color: #92400e;">⚠ Pontos de Atenção:</div>
            ${equipe.pontos_atencao.map((ponto) => `<div class="equipe-item item-atencao">• ${ponto}</div>`).join('')}

            <div style="font-size: 12px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; color: #6b7280;">
              <strong>Interpretação:</strong> ${equipe.interpretacao}
            </div>
          </div>
        </div>
      `
        )
        .join('')}

      <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border-left: 4px solid #16a34a; margin-top: 20px;">
        <p style="font-size: 14px; color: #166534;"><strong>Comparação:</strong> ${agilidade.comparacao_equipes}</p>
      </div>
    </div>

    <!-- ALERTAS -->
    ${agilidade.alertas && agilidade.alertas.length > 0
      ? `
    <div class="section">
      <div class="section-title">⚠️ Alertas</div>
      ${agilidade.alertas
        .map(
          (alerta) => `
        <div class="alert ${alerta.nivel.toLowerCase()}">
          <div class="alert-title">[${alerta.equipe}] ${alerta.mensagem}</div>
          <div class="alert-message"><strong>Ação Recomendada:</strong> ${alerta.acao_recomendada}</div>
        </div>
      `
        )
        .join('')}
    </div>
    `
      : ''
    }

    <!-- RECOMENDAÇÕES -->
    ${agilidade.recomendacoes && agilidade.recomendacoes.length > 0
      ? `
    <div class="section">
      <div class="section-title">💡 Recomendações</div>
      ${agilidade.recomendacoes
        .sort((a, b) => a.prioridade - b.prioridade)
        .map(
          (rec) => `
        <div class="recommendation">
          <div class="recommendation-header">
            <span class="priority-badge">P${rec.prioridade}</span>
            <span class="recommendation-title">[${rec.equipe}] ${rec.acao}</span>
          </div>
          <div class="recommendation-impact">
            <strong>Impacto Esperado:</strong> ${rec.impacto_esperado}
          </div>
        </div>
      `
        )
        .join('')}
    </div>
    `
      : ''
    }

    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
      <p>GPM Intelligence | Visão Agilidade | ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
    `

    return html
  } catch (error) {
    console.error('Error generating agilidade HTML:', error)
    return `<div style="padding: 20px; color: #dc2626;">Erro ao gerar relatório de agilidade. Por favor, tente novamente.</div>`
  }
}
