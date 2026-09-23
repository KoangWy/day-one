import type { Draft, DraftSummary, FieldProblem, ObserveResult, Review, Route, TeachJob } from './types'

export async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { cache: 'no-store', signal })
  if (!response.ok) throw new Error('Cannot load the approved route. Check the laptop connection.')
  return response.json() as Promise<T>
}

export const speechUrl = (routeId: string, key: string) =>
  `/speech/${encodeURIComponent(routeId)}/${encodeURIComponent(key)}.mp3`
export const appSpeechUrl = (key: string) => `/app-speech/${encodeURIComponent(key)}.mp3`

const TARGETS = ['matched', 'candidate', 'none'], POSITIONS = ['left', 'ahead', 'right', null], DISTANCES = ['near', 'far', null]

export async function observe(route_id: string, step_index: number, image_jpeg_640: string, signal: AbortSignal): Promise<ObserveResult> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort, { once: true })
  if (signal.aborted) controller.abort()
  // Server deadline is 10s; allow transport overhead without an unlimited client wait.
  const timer = setTimeout(abort, 12_000)
  try {
    const response = await fetch('/observe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      body: JSON.stringify({ route_id, step_index, image_jpeg_640 }), signal: controller.signal,
    })
    if (!response.ok) throw new Error(`Camera check failed (${response.status})`)
    const result: ObserveResult = await response.json()
    if (result.step_index !== step_index || !TARGETS.includes(result.target)
      || !POSITIONS.includes(result.position) || !DISTANCES.includes(result.distance)) {
      throw new Error('Invalid camera check response')
    }
    // Hazard IDs are indexes into the reviewed route; anything else is ignored.
    const hazards = Array.isArray(result.hazards) ? result.hazards.filter(h => Number.isInteger(h) && h >= 0 && h < 3) : []
    return { ...result, hazards }
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', abort)
  }
}

/* Guide API: teaching, review and publishing. Allowed on the laptop, or with the guide code. */

const PIN_KEY = 'dayone.guideCode'
export function guideCode(): string {
  try { return sessionStorage.getItem(PIN_KEY) ?? '' } catch { return '' }
}
export function setGuideCode(code: string) {
  try { if (code) sessionStorage.setItem(PIN_KEY, code); else sessionStorage.removeItem(PIN_KEY) } catch { /* private mode */ }
}

export class GuideError extends Error {
  constructor(message: string, readonly status: number, readonly fields: FieldProblem[] = []) { super(message) }
}

async function failure(response: Response) {
  let body: { detail?: unknown; fields?: FieldProblem[] } = {}
  try { body = await response.json() } catch { /* not JSON */ }
  const detail = typeof body.detail === 'string' ? body.detail
    : response.status === 403 ? 'Teaching needs the laptop or the guide code.' : `Request failed (${response.status}).`
  return new GuideError(detail, response.status, Array.isArray(body.fields) ? body.fields : [])
}

async function guide<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  const code = guideCode()
  if (code) headers.set('X-Teach-Pin', code)
  let response: Response
  try { response = await fetch(path, { ...init, headers, cache: 'no-store' }) }
  catch { throw new GuideError('Cannot reach the laptop. Check the connection.', 0) }
  if (!response.ok) throw await failure(response)
  return (response.status === 204 ? undefined : await response.json()) as T
}

export const guideAccess = () => guide<{ allowed: boolean; pin_configured: boolean }>('/guide/access')
export const listDrafts = () => guide<DraftSummary[]>('/guide/drafts')
export const getDraft = (id: string) => guide<Draft>(`/guide/drafts/${encodeURIComponent(id)}`)
export const deleteDraft = (id: string) => guide<void>(`/guide/drafts/${encodeURIComponent(id)}`, { method: 'DELETE' })
export const teachStatus = (job: string) => guide<TeachJob>(`/guide/teach/${encodeURIComponent(job)}`)
export const publishDraft = (id: string, body: { route: Route; review: Review; reviewer: string; confirmed: boolean }) =>
  guide<{ route_id: string; phrases: number }>(`/guide/drafts/${encodeURIComponent(id)}/publish`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })

/** XMLHttpRequest because fetch cannot report upload progress for a long walk video. */
export function uploadWalk(form: FormData, onProgress: (fraction: number) => void, signal: AbortSignal): Promise<TeachJob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/guide/teach')
    const code = guideCode()
    if (code) xhr.setRequestHeader('X-Teach-Pin', code)
    xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded / e.total) }
    xhr.onload = () => {
      let body: { detail?: unknown } & Partial<TeachJob> = {}
      try { body = JSON.parse(xhr.responseText) } catch { /* not JSON */ }
      if (xhr.status === 202 && body.job_id) resolve(body as TeachJob)
      else reject(new GuideError(typeof body.detail === 'string' ? body.detail : `Upload failed (${xhr.status}).`, xhr.status))
    }
    xhr.onerror = () => reject(new GuideError('The walk could not be sent. Check the connection and try again.', 0))
    xhr.onabort = () => reject(new GuideError('Upload cancelled.', 0))
    signal.addEventListener('abort', () => xhr.abort(), { once: true })
    xhr.send(form)
  })
}
