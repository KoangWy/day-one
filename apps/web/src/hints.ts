import type { Distance, Position, Target } from './types'

export const HINT_GAP_MS = 8_000
export const HINT_MOVED_GAP_MS = 3_000
export type LastHint = { at: number; position: Position }

const SEARCHING = ['origin', 'walking', 'lost']

/**
 * Key of a P2 hint saying where the landmark sits in the camera frame, or null to stay quiet.
 * The caller passes only results that did not just complete the 2-of-3 arrival check.
 */
export function chooseHint(phase: string, index: number, target: Target, position: Position,
  distance: Distance, last: LastHint | null, at: number): string | null {
  if (!SEARCHING.includes(phase) || target === 'none' || !position || !distance) return null
  if (last) {
    const since = at - last.at
    if (since < HINT_GAP_MS && !(position !== last.position && since >= HINT_MOVED_GAP_MS)) return null
  }
  return `${index < 0 ? 'origin' : `s${index}`}-hint-${target}-${position}-${distance}`
}
