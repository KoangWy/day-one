import { afterEach, describe, expect, it, vi } from 'vitest'
import { assess, classify, createWatch, idle, inPath, CLEAR_MS, REPEAT_MS, type Detection } from './obstacles'

const person = (x = 0.4, h = 0.6, score = 0.8): Detection => ({ label: 'person', score, box: { x, y: 0.2, w: 0.2, h } })
const chair = (x = 0.35, y = 0.55, h = 0.35): Detection => ({ label: 'chair', score: 0.7, box: { x, y, w: 0.3, h } })

describe('what counts as an obstacle ahead', () => {
  it('only boxes in the middle of the frame are in the walking path', () => {
    expect(inPath({ x: 0.4, y: 0, w: 0.2, h: 1 })).toBe(true)
    expect(inPath({ x: 0.62, y: 0, w: 0.15, h: 1 })).toBe(true) // Half of it inside the corridor.
    expect(inPath({ x: 0.66, y: 0, w: 0.2, h: 1 })).toBe(false) // Just a shoulder at the edge.
    expect(inPath({ x: 0.0, y: 0, w: 0.25, h: 1 })).toBe(false)
    expect(inPath({ x: 0.0, y: 0, w: 1, h: 1 })).toBe(true) // Fills the frame.
  })
  it('a person must be close (tall in the frame) and confidently detected', () => {
    expect(classify([person()])).toBe('person')
    expect(classify([person(0.4, 0.3)])).toBe(null) // Far down the corridor.
    expect(classify([person(0.4, 0.6, 0.3)])).toBe(null)
    expect(classify([person(0.05)])).toBe(null) // Walking past on the left.
  })
  it('objects must stand on the floor just ahead; people take priority', () => {
    expect(classify([chair()])).toBe('object')
    expect(classify([chair(0.35, 0.1, 0.35)])).toBe(null) // Seen high in the frame: still far.
    expect(classify([chair(0.55)])).toBe(null) // In the corridor but off-centre, e.g. sweeping past while turning.
    expect(classify([{ ...chair(), label: 'tv' }])).toBe(null) // Not an obstacle class.
    expect(classify([chair(), person()])).toBe('person')
  })
})

describe('one warning per obstacle', () => {
  function feed(frames: Detection[][], step = 250, start = idle, t0 = 0) {
    let tracker = start
    const alerts: (string | null)[] = [], cleared: number[] = []
    frames.forEach((detections, i) => {
      const r = assess(tracker, detections, t0 + i * step)
      tracker = r.tracker; alerts.push(r.alert)
      if (r.cleared) cleared.push(i)
    })
    return { tracker, alerts, cleared }
  }

  it('needs two frames in a row, then warns once while the person stays', () => {
    const r = feed([[person()], [person()], [person()], [person()]])
    expect(r.alerts).toEqual([null, 'person', null, null])
    expect(r.tracker.active).toBe('person')
    expect(feed([[person()], [], [person()], []]).alerts.every(a => a === null)).toBe(true) // Flicker.
  })
  it('clears after 1.5 s without the person, and does not repeat within 8 s', () => {
    const gone = Array.from({ length: CLEAR_MS / 250 + 1 }, () => [] as Detection[])
    const r = feed([[person()], [person()], ...gone, [person()], [person()]])
    expect(r.cleared).toEqual([1 + CLEAR_MS / 250]) // Last seen at frame 1.
    expect(r.alerts.filter(Boolean)).toEqual(['person']) // Came back within 8 s: shown, not spoken.
    expect(r.tracker.active).toBe('person')
    const later = feed([[person()], [person()]], 250, { ...r.tracker, active: null, candidate: null, streak: 0 }, 250 * 20 + REPEAT_MS)
    expect(later.alerts).toEqual([null, 'person'])
  })
  it('objects need three frames; a person stepping in front of a chair gets its own warning', () => {
    const r = feed([[chair()], [chair()], [chair()], [chair(), person()], [chair(), person()]])
    expect(r.alerts).toEqual([null, null, 'object', null, 'person'])
  })
})

describe('watch loop', () => {
  afterEach(() => { vi.useRealTimers() })
  it('shows, speaks and clears through callbacks, and stop clears the banner', () => {
    vi.useFakeTimers()
    let clock = 0, frame: Detection[] | null = [person()]
    const events: string[] = []
    const watch = createWatch({
      detect: () => frame, now: () => clock, intervalMs: 250,
      onShow: k => events.push(`show ${k}`), onAlert: k => events.push(`alert ${k}`), onClear: () => events.push('clear'),
    })
    watch.start(); watch.start() // Idempotent.
    for (let i = 0; i < 3; i++) { clock += 250; vi.advanceTimersByTime(250) }
    expect(events).toEqual(['alert person', 'show person'])
    frame = null; clock += 250; vi.advanceTimersByTime(250) // Detector not ready: nothing changes.
    expect(watch.active).toBe('person')
    watch.stop()
    expect(events).toEqual(['alert person', 'show person', 'clear'])
    frame = [person()]; clock += 1000; vi.advanceTimersByTime(1000)
    expect(events.length).toBe(3) // Stopped: no more detection.
  })
  it('a detector error is skipped, not fatal', () => {
    vi.useFakeTimers()
    let calls = 0
    const watch = createWatch({ detect: () => { calls++; throw new Error('gpu lost') }, onShow() {}, onAlert() {}, onClear() {} })
    watch.start(); vi.advanceTimersByTime(1000)
    expect(calls).toBe(4); expect(watch.active).toBe(null)
    watch.stop()
  })
})
