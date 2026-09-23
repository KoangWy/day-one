import { chooseHint, type LastHint } from './hints'
import type { Distance, Position, Target } from './types'

export type Phase = 'idle' | 'origin' | 'atOrigin' | 'walking' | 'reached' | 'lost' | 'override' | 'arrived'
export type Priority = 0 | 1 | 2
export type Say = { key: string; priority: Priority }
export type LogEvent = 'start' | 'origin_found' | 'reached' | 'next' | 'lost' | 'where'
  | 'manual_override' | 'vision_down' | 'vision_back' | 'arrival' | 'stop' | 'hazard' | 'obstacle'
export type Log = { event: LogEvent; at: number; step: number; time_to_reach_ms?: number; verified?: boolean }
/** Per-step review data: expected_seconds sets the step's time budget. Phrases tell which
 * optional sentences (hazard actions, "On the way") the reviewer saved for this route. */
export type RouteInfo = { steps: { expected_seconds: number }[]; phrases?: Record<string, string> }

export type State = {
  phase: Phase
  index: number // -1 is the starting point
  /** Bumped whenever the capture loop changes context; results sent under another value are stale. */
  generation: number
  window: Target[] // Up to 3 most recent successful results for the current step.
  stepStartedAt: number | null // Set when the step instruction finished playing.
  originSince: number | null
  originRetried: boolean
  errors: number // Consecutive failed camera checks.
  visionDown: boolean
  overrideFrom: 'walking' | 'lost' | null
  lastP1: string | null // What Repeat plays and the screen shows.
  lastHint: LastHint | null
  overrides: number
  warned: number[] // Hazards of the current step already announced.
  unverified: boolean // Arrival reached through a manual override.
  message: string
}

export type Event =
  | { type: 'START'; at: number }
  | { type: 'OBSERVATION'; at: number; step_index: number; generation: number; target: Target; position: Position; distance: Distance; hazards?: number[] }
  | { type: 'OBSERVE_ERROR'; at: number; step_index: number; generation: number; offline?: boolean }
  | { type: 'TICK'; at: number }
  | { type: 'AUDIO_DONE'; at: number; key: string }
  | { type: 'NEXT' | 'YES' | 'NO' | 'WHERE' | 'REPEAT'; at: number }
  | { type: 'RESET'; at: number; message: string }

export type Output = { state: State; say: Say[]; log: Log[] }

export const WINDOW = 3
export const REACH_MATCHES = 2
export const ORIGIN_RETRY_MS = 30_000
export const MIN_BUDGET_MS = 30_000
export const DOWN_AFTER_ERRORS = 3

export const initial: State = {
  phase: 'idle', index: -1, generation: 0, window: [], stepStartedAt: null, originSince: null,
  originRetried: false, errors: 0, visionDown: false, overrideFrom: null, lastP1: null,
  lastHint: null, overrides: 0, warned: [], unverified: false, message: '',
}

/** The capture loop sends frames only while searching; it pauses while waiting for the user. */
export const looping = (phase: Phase) => phase === 'origin' || phase === 'walking' || phase === 'lost'
export const budgetMs = (expectedSeconds: number) => Math.max(3 * expectedSeconds * 1000, MIN_BUDGET_MS)
const p1 = (key: string): Say => ({ key, priority: 1 })

function speak(state: State, key: string): [State, Say] {
  return [{ ...state, lastP1: key }, p1(key)]
}

function walkTo(s: State, index: number, at: number, log: Log[], route: RouteInfo): Output {
  const [state, say] = speak({
    ...s, phase: 'walking', index, generation: s.generation + 1, window: [], stepStartedAt: null,
    overrideFrom: null, lastHint: null, warned: [], message: '',
  }, `s${index}-instruction`)
  // Named hazards of this step follow the direction; Repeat still replays the direction.
  const watch = `s${index}-watch`
  return { state, say: route.phrases?.[watch] ? [say, p1(watch)] : [say], log }
}

/** Warning chime + sentence for each saved hazard seen close ahead; once per step. */
function hazards(s: State, e: Extract<Event, { type: 'OBSERVATION' }>, route: RouteInfo): Output {
  let state = s
  const say: Say[] = [], log: Log[] = []
  if (s.index < 0 || !(s.phase === 'walking' || s.phase === 'lost')) return { state, say, log }
  for (const h of e.hazards ?? []) {
    const key = `s${s.index}-hazard-${h}`
    if (state.warned.includes(h) || !route.phrases?.[key]) continue
    state = { ...state, warned: [...state.warned, h] }
    say.push({ key, priority: 0 })
    log.push({ event: 'hazard', at: e.at, step: s.index })
    if (route.phrases[`${key}-action`]) {
      const [next, action] = speak(state, `${key}-action`)
      state = next; say.push(action)
    }
  }
  return { state, say, log }
}

function observed(prev: State, e: Extract<Event, { type: 'OBSERVATION' }>, route: RouteInfo): Output {
  const warned = hazards(prev, e, route)
  const s = warned.state
  let state: State = { ...s, errors: 0, visionDown: false, window: [...s.window, e.target].slice(-WINDOW) }
  const say: Say[] = [...warned.say], log: Log[] = [...warned.log]
  if (s.visionDown) {
    state = { ...state, lastP1: 'vision-back' }
    say.push(p1('vision-back')); log.push({ event: 'vision_back', at: e.at, step: s.index })
  }
  const reached = state.window.filter(t => t === 'matched').length >= REACH_MATCHES
  if (!reached) {
    const key = chooseHint(s.phase, s.index, e.target, e.position, e.distance, s.lastHint, e.at)
    if (key) { state = { ...state, lastHint: { at: e.at, position: e.position } }; say.push({ key, priority: 2 }) }
    return { state, say, log }
  }
  const paused = { ...state, generation: state.generation + 1, overrideFrom: null }
  if (s.phase === 'origin') {
    const [next, found] = speak({ ...paused, phase: 'atOrigin' }, 'origin-found')
    return { state: next, say: [...say, found], log: [...log, { event: 'origin_found', at: e.at, step: -1 }] }
  }
  const time = state.stepStartedAt === null ? undefined : e.at - state.stepStartedAt
  log.push({ event: 'reached', at: e.at, step: s.index, time_to_reach_ms: time })
  if (s.index === route.steps.length - 1) {
    const [next, arrival] = speak({ ...paused, phase: 'arrived' }, 'arrival')
    return { state: next, say: [...say, arrival], log: [...log, { event: 'arrival', at: e.at, step: s.index, verified: true }] }
  }
  const [next, reachedSay] = speak({ ...paused, phase: 'reached' }, `s${s.index}-reached`)
  return { state: next, say: [...say, reachedSay], log }
}

export function transition(s: State, e: Event, route: RouteInfo): Output {
  const same: Output = { state: s, say: [], log: [] }
  const last = s.index === route.steps.length - 1
  switch (e.type) {
    case 'RESET': {
      const log: Log[] = s.phase !== 'idle' && s.phase !== 'arrived' ? [{ event: 'stop', at: e.at, step: s.index }] : []
      return { state: { ...initial, generation: s.generation + 1, message: e.message }, say: [], log }
    }
    case 'START': {
      if (s.phase !== 'idle') return same
      const [state, say] = speak({ ...initial, phase: 'origin', generation: s.generation + 1, originSince: e.at }, 'origin-instruction')
      return { state, say: [say], log: [{ event: 'start', at: e.at, step: -1 }] }
    }
    case 'OBSERVATION':
      if (!looping(s.phase) || e.step_index !== s.index || e.generation !== s.generation) return same
      return observed(s, e, route)
    case 'OBSERVE_ERROR': {
      if (!looping(s.phase) || e.step_index !== s.index || e.generation !== s.generation) return same
      const errors = e.offline ? Math.max(s.errors + 1, DOWN_AFTER_ERRORS) : s.errors + 1
      if (s.visionDown || errors < DOWN_AFTER_ERRORS) return { ...same, state: { ...s, errors } }
      const [state, say] = speak({ ...s, errors, visionDown: true }, s.phase === 'origin' ? 'vision-down-origin' : 'vision-down')
      return { state, say: [say], log: [{ event: 'vision_down', at: e.at, step: s.index }] }
    }
    case 'TICK': {
      if (s.phase === 'origin' && !s.originRetried && s.originSince !== null && e.at - s.originSince >= ORIGIN_RETRY_MS) {
        const [state, say] = speak({ ...s, originRetried: true }, 'origin-retry')
        return { state, say: [say], log: [] }
      }
      if (s.phase === 'walking' && s.stepStartedAt !== null
        && e.at - s.stepStartedAt >= budgetMs(route.steps[s.index].expected_seconds)) {
        const [state, say] = speak({ ...s, phase: 'lost' }, `s${s.index}-lost`)
        return { state, say: [say], log: [{ event: 'lost', at: e.at, step: s.index }] }
      }
      return same
    }
    case 'AUDIO_DONE':
      // The step clock starts once the direction has been heard, even if Next was pressed meanwhile.
      if (['walking', 'lost', 'override'].includes(s.phase) && s.stepStartedAt === null && e.key === `s${s.index}-instruction`) {
        return { ...same, state: { ...s, stepStartedAt: e.at } }
      }
      return same
    case 'NEXT': {
      const log: Log[] = [{ event: 'next', at: e.at, step: s.index }]
      if (s.phase === 'atOrigin') return walkTo(s, 0, e.at, log, route)
      if (s.phase === 'reached') return walkTo(s, s.index + 1, e.at, log, route)
      if (s.phase === 'lost' || (s.phase === 'walking' && s.visionDown)) {
        const [state, say] = speak({ ...s, phase: 'override', overrideFrom: s.phase, generation: s.generation + 1 }, `s${s.index}-override`)
        return { state, say: [say], log }
      }
      return same
    }
    case 'YES': {
      if (s.phase !== 'override') return same
      const log: Log[] = [{ event: 'manual_override', at: e.at, step: s.index }]
      const counted = { ...s, overrides: s.overrides + 1 }
      if (!last) return walkTo(counted, s.index + 1, e.at, log, route)
      const [state, say] = speak({ ...counted, phase: 'arrived', unverified: true, overrideFrom: null, generation: s.generation + 1 }, 'arrival-unverified')
      return { state, say: [say], log: [...log, { event: 'arrival', at: e.at, step: s.index, verified: false }] }
    }
    case 'NO':
      if (s.phase !== 'override' || !s.overrideFrom) return same
      // Back to searching the same step; its clock keeps running and nothing is re-announced.
      return { ...same, state: { ...s, phase: s.overrideFrom, overrideFrom: null, generation: s.generation + 1 } }
    case 'WHERE':
      if (s.phase === 'walking' || s.phase === 'lost') {
        const [state, say] = speak(s, `s${s.index}-where`)
        return { state, say: [say], log: [{ event: 'where', at: e.at, step: s.index }] }
      }
      return transition(s, { type: 'REPEAT', at: e.at }, route)
    case 'REPEAT':
      return s.phase !== 'idle' && s.lastP1 ? { ...same, say: [p1(s.lastP1)] } : same
  }
}

export type Command = 'next' | 'yes' | 'no' | 'repeat' | 'where' | 'stop'

export function parseCommand(text: string): Command | null {
  const normalized = text.trim().toLowerCase().replace(/[.!?]+$/, '').replace(/\s+/g, ' ')
  if (normalized === 'where am i') return 'where'
  return ['next', 'yes', 'no', 'repeat', 'where', 'stop'].includes(normalized) ? normalized as Command : null
}
