export interface UploadResponse {
  success: boolean
  message: string
  jobId?: string
}

export async function uploadOKRs(
  data: Record<string, unknown>[],
  semanaRef: Date
): Promise<UploadResponse> {
  const { formatDateISO } = await import('@/lib/semanaRef')
  return fetch('/api/carga/okrs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, semana_ref: formatDateISO(semanaRef) }),
  }).then((res) => res.json())
}

export async function uploadWorkItems(
  data: Record<string, unknown>[],
  semanaRef: Date
): Promise<UploadResponse> {
  const { formatDateISO } = await import('@/lib/semanaRef')
  return fetch('/api/carga/work-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, semana_ref: formatDateISO(semanaRef) }),
  }).then((res) => res.json())
}

export async function uploadAgilidade(
  data: Record<string, unknown>[],
  semanaRef: Date
): Promise<UploadResponse> {
  const { formatDateISO } = await import('@/lib/semanaRef')
  return fetch('/api/carga/agilidade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data, semana_ref: formatDateISO(semanaRef) }),
  }).then((res) => res.json())
}

export async function uploadCapexOpex(
  capex: number,
  opex: number,
  semanaRef: Date
): Promise<UploadResponse> {
  const { formatDateISO } = await import('@/lib/semanaRef')
  return fetch('/api/carga/capex-opex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      capex_pct: capex,
      opex_pct: opex,
      semana_ref: formatDateISO(semanaRef),
    }),
  }).then((res) => res.json())
}
