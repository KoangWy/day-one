import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFrameLoop, gapAfter, observeConsumer, type ObserveOutcome } from './frameLoop'
import type { ObserveResult } from './types'

type Call = { index: number; at: number; signal: AbortSignal; resolve: (r: ObserveResult) => void; reject: (e: Error) => void }

let calls: Call[], outcomes: ObserveOutcome[], mode: 'hang' | 'ok' | 'fail', online: boolean, captures: number

function setup() {
  const consumer = observeConsumer({
    observe: (index, _jpeg, signal) => new Promise<ObserveResult>((resolve, reject) => {
      calls.push({ index, at: Date.now(), signal, resolve, reject })
      signal.addEventListener('abort', () => reject(new Error('aborted')))
      if (mode === 'ok') resolve({ step_index: index, target: 'none', position: null, distance: null })
      if (mode === 'fail') reject(new Error('503'))
    }),
    onOutcome: outcome => outcomes.push(outcome),
    online: () => online,
  })
  return createFrameLoop(() => { captures++; return 'frame' }, [consumer])
}

beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(0)
  calls = []; outcomes = []; mode = 'hang'; online = true; captures = 0
})
afterEach(() => { vi.useRealTimers() })

describe('frame loop', () => {
  it('keeps at most 2 requests in flight', async () => {
    const loop = setup()
    loop.start(0, 1)
    await vi.advanceTimersByTimeAsync(10_000)
    expect(calls).toHaveLength(2)
    expect(captures).toBe(2) // No frame is captured when no consumer wants one.
    calls[0].resolve({ step_index: 0, target: 'candidate', position: 'left', distance: 'far' })
    await vi.advanceTimersByTimeAsync(200)
    expect(calls).toHaveLength(3)
    loop.stop()
  })
  it('sends at least 1 s apart', async () => {
    mode = 'ok'
    const loop = setup()
    loop.start(-1, 1)
    await vi.advanceTimersByTimeAsync(4050)
    expect(calls.map(c => c.at)).toEqual([0, 1000, 2000, 3000, 4000])
    expect(outcomes.every(o => o.ok && o.index === -1 && o.generation === 1)).toBe(true)
    loop.stop()
  })
  it('pause and stop abort requests and deliver no late result', async () => {
    const loop = setup()
    loop.start(0, 1)
    await vi.advanceTimersByTimeAsync(1100)
    expect(calls).toHaveLength(2)
    loop.pause()
    expect(calls.every(c => c.signal.aborted)).toBe(true)
    calls[0].resolve({ step_index: 0, target: 'matched', position: null, distance: null })
    await vi.advanceTimersByTimeAsync(5000)
    expect(outcomes).toEqual([]); expect(calls).toHaveLength(2); expect(loop.running).toBe(false)
    loop.start(0, 2)
    await vi.advanceTimersByTimeAsync(100)
    expect(calls).toHaveLength(3)
    loop.stop()
    expect(calls[2].signal.aborted).toBe(true)
    await vi.advanceTimersByTimeAsync(5000)
    expect(calls).toHaveLength(3)
  })
  it('a new step aborts the old step and tags results with the context at send time', async () => {
    const loop = setup()
    loop.start(0, 3)
    await vi.advanceTimersByTimeAsync(50)
    loop.start(0, 3) // Same context: no restart.
    expect(calls[0].signal.aborted).toBe(false)
    loop.start(1, 4)
    expect(calls[0].signal.aborted).toBe(true)
    await vi.advanceTimersByTimeAsync(1000)
    const latest = calls[calls.length - 1]
    expect(latest.index).toBe(1)
    latest.resolve({ step_index: 1, target: 'none', position: null, distance: null })
    await vi.advanceTimersByTimeAsync(0)
    expect(outcomes).toEqual([expect.objectContaining({ ok: true, index: 1, generation: 4 })])
    loop.stop()
  })
  it('backs off 3 s, 5 s, 10 s after 3 errors, then returns to 1 s after a success', async () => {
    mode = 'fail'
    const loop = setup()
    loop.start(0, 1)
    await vi.advanceTimersByTimeAsync(30_050)
    expect(calls.map(c => c.at)).toEqual([0, 1000, 2000, 5000, 10_000, 20_000, 30_000])
    expect(outcomes.every(o => !o.ok)).toBe(true)
    mode = 'ok'
    await vi.advanceTimersByTimeAsync(10_000)
    await vi.advanceTimersByTimeAsync(2050)
    expect(calls.map(c => c.at).slice(7)).toEqual([40_000, 41_000, 42_000])
    loop.stop()
  })
  it('reports offline failures', async () => {
    mode = 'fail'; online = false
    const loop = setup()
    loop.start(0, 1)
    await vi.advanceTimersByTimeAsync(10)
    expect(outcomes).toEqual([{ ok: false, index: 0, generation: 1, offline: true }])
    loop.stop()
  })
  it('skips a tick when the camera is not ready', async () => {
    let ready = false
    const consumer = observeConsumer({ observe: () => new Promise(() => {}), onOutcome: () => {} })
    const loop = createFrameLoop(() => { if (!ready) throw new Error('Camera is not ready'); return 'frame' }, [consumer])
    const spy = vi.spyOn(consumer, 'consume')
    loop.start(-1, 1)
    await vi.advanceTimersByTimeAsync(500)
    expect(spy).not.toHaveBeenCalled()
    ready = true
    await vi.advanceTimersByTimeAsync(100)
    expect(spy).toHaveBeenCalledTimes(1)
    loop.stop()
  })
})

describe('gap', () => {
  it('follows the back-off table', () => {
    expect([0, 1, 2, 3, 4, 5, 9].map(gapAfter)).toEqual([1000, 1000, 1000, 3000, 5000, 10_000, 10_000])
  })
})
