import type { ObserveResult } from './types'

export type LoopContext = { index: number; generation: number }

/**
 * Something that wants camera frames while a walk is active. Capture is shared: the loop grabs
 * one frame only when some consumer is ready. Today the only consumer sends frames to /observe;
 * an on-device obstacle detector would be a second consumer with its own pace.
 */
export interface FrameConsumer {
  ready(now: number): boolean
  consume(frame: string, context: LoopContext, now: number): void
  /** Abort in-flight work: the context changed or the loop paused. */
  cancel(): void
  /** Walk ended: also forget error back-off. */
  reset(): void
}

export const TICK_MS = 100

export function createFrameLoop(capture: () => string, consumers: FrameConsumer[], tickMs = TICK_MS) {
  let context: LoopContext | null = null
  let timer: ReturnType<typeof setInterval> | undefined

  function tick() {
    if (!context) return
    const now = Date.now()
    const ready = consumers.filter(c => c.ready(now))
    if (!ready.length) return
    let frame: string
    try { frame = capture() } catch { return } // Camera not ready yet; try on the next tick.
    for (const consumer of ready) consumer.consume(frame, context, now)
  }
  function pause() {
    context = null
    clearInterval(timer); timer = undefined
    for (const c of consumers) c.cancel()
  }

  return {
    /** Search for step `index`; a new index or generation aborts requests of the old one. */
    start(index: number, generation: number) {
      if (context?.index === index && context.generation === generation) return
      for (const c of consumers) c.cancel()
      context = { index, generation }
      timer ??= setInterval(tick, tickMs)
      tick()
    },
    pause,
    stop() { pause(); for (const c of consumers) c.reset() },
    get running() { return context !== null },
  }
}

export type ObserveOutcome =
  | { ok: true; index: number; generation: number; result: ObserveResult; latencyMs: number }
  | { ok: false; index: number; generation: number; offline: boolean }

export const MAX_IN_FLIGHT = 2
export const MIN_GAP_MS = 1000
export const BACKOFF_MS = [3000, 5000, 10_000]
export const BACKOFF_AFTER_ERRORS = 3

/** 1 s between sends; after 3 consecutive errors 3 s, then 5 s, then 10 s until one succeeds. */
export const gapAfter = (errors: number) =>
  errors < BACKOFF_AFTER_ERRORS ? MIN_GAP_MS : BACKOFF_MS[Math.min(errors - BACKOFF_AFTER_ERRORS, BACKOFF_MS.length - 1)]

export function observeConsumer(o: {
  observe: (index: number, jpeg: string, signal: AbortSignal) => Promise<ObserveResult>
  onOutcome: (outcome: ObserveOutcome) => void
  onSend?: (index: number) => void
  online?: () => boolean
}): FrameConsumer {
  const inFlight = new Set<AbortController>()
  let lastSent = -Infinity
  let errors = 0

  function cancel() {
    for (const controller of inFlight) controller.abort()
    inFlight.clear()
  }
  return {
    ready: now => inFlight.size < MAX_IN_FLIGHT && now - lastSent >= gapAfter(errors),
    consume(frame, { index, generation }, now) {
      const controller = new AbortController()
      inFlight.add(controller); lastSent = now
      o.onSend?.(index)
      o.observe(index, frame, controller.signal).then(
        result => {
          if (controller.signal.aborted) return
          errors = 0
          o.onOutcome({ ok: true, index, generation, result, latencyMs: Date.now() - now })
        },
        () => {
          if (controller.signal.aborted) return // Stopped or paused on purpose: not an error.
          errors++
          o.onOutcome({ ok: false, index, generation, offline: o.online ? !o.online() : false })
        },
      ).finally(() => inFlight.delete(controller))
    },
    cancel,
    reset() { cancel(); errors = 0; lastSent = -Infinity },
  }
}
