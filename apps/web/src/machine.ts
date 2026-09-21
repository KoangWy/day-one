export type Phase = 'idle' | 'origin' | 'checkingOrigin' | 'confirmOrigin' | 'originFailed'
  | 'walking' | 'checking' | 'confirm' | 'fallback' | 'override' | 'arrived'
export type State = {
  phase: Phase; index: number; misses: number; lastConfirmed: number
  overrides: number; finalUnverified: boolean; message: string
}
export const initial: State = {
  phase: 'idle', index: -1, misses: 0, lastConfirmed: -1, overrides: 0,
  finalUnverified: false, message: '',
}
export type Event = { type: 'START' | 'CHECK' | 'YES' | 'NO' | 'NEXT' }
  | { type: 'RESULT'; matched: boolean }
  | { type: 'ERROR' | 'RESET'; message: string }

export function transition(state: State, event: Event, count: number): State {
  const s = state
  if (event.type === 'RESET') return { ...initial, message: event.message }
  if (event.type === 'START' && s.phase === 'idle') return { ...initial, phase: 'origin' }
  if (event.type === 'CHECK') {
    if (['origin', 'originFailed'].includes(s.phase)) return { ...s, phase: 'checkingOrigin', message: '' }
    if (['walking', 'fallback'].includes(s.phase)) return { ...s, phase: 'checking', message: '' }
  }
  if (event.type === 'RESULT') {
    if (s.phase === 'checkingOrigin') return {
      ...s, phase: event.matched ? 'confirmOrigin' : 'originFailed',
      message: event.matched ? '' : 'I only know this saved route. The starting point was not confirmed in at least two of three photos. Check again.',
    }
    if (s.phase === 'checking') {
      const misses = event.matched ? 0 : s.misses + 1
      return { ...s, misses, phase: event.matched ? 'confirm' : misses >= 2 ? 'fallback' : 'walking',
        message: event.matched ? '' : 'The checkpoint did not match. You can check again.' }
    }
  }
  if (event.type === 'ERROR' && ['checkingOrigin', 'checking'].includes(s.phase)) {
    return { ...s, phase: s.index === -1 ? 'originFailed' : 'fallback', message: event.message }
  }
  if (event.type === 'YES') {
    if (s.phase === 'confirmOrigin') return { ...s, phase: 'walking', index: 0, message: '' }
    if (s.phase === 'confirm' || s.phase === 'override') {
      const manual = s.phase === 'override'
      const last = s.index === count - 1
      return { ...s, phase: last ? 'arrived' : 'walking', index: last ? s.index : s.index + 1,
        lastConfirmed: manual ? s.lastConfirmed : s.index,
        misses: 0, overrides: s.overrides + Number(manual), finalUnverified: last && manual,
        message: manual ? 'Manual override recorded. The skipped checkpoint was not visually verified.' : '' }
    }
  }
  if (event.type === 'NO') {
    if (s.phase === 'confirmOrigin') return { ...s, phase: 'originFailed', message: 'I only know this saved route. Check the starting point again when ready.' }
    if (s.phase === 'confirm') return { ...s, phase: 'walking', misses: 0, message: 'Your position is not confirmed. Check this checkpoint again.' }
    if (s.phase === 'override') return { ...s, phase: 'fallback', message: 'Saved directions have not advanced.' }
  }
  if (event.type === 'NEXT' && s.phase === 'fallback' && s.index >= 0) return { ...s, phase: 'override', message: '' }
  return s // AI results and double-clicks can never advance a step.
}

export function parseCommand(text: string): 'yes' | 'no' | 'repeat' | 'next' | 'stop' | null {
  const normalized = text.trim().toLowerCase().replace(/[.!?]$/, '')
  return ['yes', 'no', 'repeat', 'next', 'stop'].includes(normalized)
    ? normalized as 'yes' | 'no' | 'repeat' | 'next' | 'stop' : null
}
