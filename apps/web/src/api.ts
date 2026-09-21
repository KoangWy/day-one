import type { ReplayResult } from './types'

export async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(path, { cache: 'no-store', signal })
  if (!response.ok) throw new Error('Cannot load the approved route. Check the laptop connection.')
  return response.json() as Promise<T>
}

export async function replay(route_id: string, step_index: number, image_jpeg_640: string, signal: AbortSignal): Promise<ReplayResult> {
  const controller = new AbortController()
  const abort = () => controller.abort()
  signal.addEventListener('abort', abort, { once: true })
  if (signal.aborted) controller.abort()
  // Server deadline is 10s; allow transport overhead without an unlimited client wait.
  const timer = setTimeout(abort, 12_000)
  try {
    const response = await fetch('/replay', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
      body: JSON.stringify({ route_id, step_index, image_jpeg_640 }), signal: controller.signal,
    })
    if (!response.ok) throw new Error(response.status === 503
      ? 'Visual check is unavailable. Retry when ready.'
      : 'The photo could not be checked. Retry or ask the route guide for help.')
    const result: ReplayResult = await response.json()
    if (typeof result.matched !== 'boolean') throw new Error('Invalid visual check response. Please retry.')
    return result
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Visual check timed out or was stopped. Retry when ready.')
    throw error
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', abort)
  }
}
