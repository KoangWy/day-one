import type { ObserveResult } from './types'

export async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { cache: 'no-store', signal })
  if (!response.ok) throw new Error('Cannot load the approved route. Check the laptop connection.')
  return response.json() as Promise<T>
}

export const speechUrl = (routeId: string, key: string) =>
  `/speech/${encodeURIComponent(routeId)}/${encodeURIComponent(key)}.mp3`

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
    return result
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', abort)
  }
}
