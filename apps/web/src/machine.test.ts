import { describe, expect, it } from 'vitest'
import { initial, parseCommand, transition, type Event, type State } from './machine'

function run(events: Event[], start = initial): State {
  return events.reduce((s, event) => transition(s, event, 4), start)
}
const origin = run([{ type: 'START' }])
const walking = run([{ type: 'START' }, { type: 'CHECK' }, { type: 'RESULT', matched: true }, { type: 'YES' }])

describe('human-confirmed replay', () => {
  it('refuses origin bypass, even after errors or wrong photos', () => {
    for (const state of [origin, run([{ type: 'CHECK' }, { type: 'RESULT', matched: false }], origin), run([{ type: 'CHECK' }, { type: 'ERROR', message: 'timeout' }], origin)]) {
      expect(run([{ type: 'NEXT' }, { type: 'YES' }], state).index).toBe(-1)
    }
  })
  it('requires origin Yes and ignores duplicate Yes', () => {
    const waiting = run([{ type: 'CHECK' }, { type: 'RESULT', matched: true }], origin)
    expect(waiting.index).toBe(-1)
    expect(run([{ type: 'YES' }, { type: 'YES' }], waiting).index).toBe(0)
    expect(run([{ type: 'NO' }], waiting).phase).toBe('originFailed')
  })
  it('never advances from an AI match; No retains the step', () => {
    const waiting = run([{ type: 'CHECK' }, { type: 'RESULT', matched: true }], walking)
    expect(waiting.index).toBe(0)
    expect(run([{ type: 'NO' }], waiting).index).toBe(0)
    expect(run([{ type: 'YES' }, { type: 'YES' }], waiting).index).toBe(1)
  })
  it('requires two misses before override and preserves last confirmed landmark', () => {
    const one = run([{ type: 'CHECK' }, { type: 'RESULT', matched: false }], walking)
    expect(one.phase).toBe('walking')
    expect(run([{ type: 'NEXT' }, { type: 'YES' }], one).index).toBe(0)
    const lost = run([{ type: 'CHECK' }, { type: 'RESULT', matched: false }], one)
    expect(lost.phase).toBe('fallback')
    const override = run([{ type: 'NEXT' }], lost)
    expect(override.index).toBe(0)
    expect(run([{ type: 'NO' }], override).index).toBe(0)
    const next = run([{ type: 'YES' }, { type: 'YES' }], override)
    expect(next.index).toBe(1); expect(next.overrides).toBe(1); expect(next.lastConfirmed).toBe(-1)
  })
  it('resets consecutive misses after a match rejected by the user', () => {
    const after = run([{ type: 'CHECK' }, { type: 'RESULT', matched: false }, { type: 'CHECK' },
      { type: 'RESULT', matched: true }, { type: 'NO' }, { type: 'CHECK' }, { type: 'RESULT', matched: false }], walking)
    expect(after.phase).toBe('walking'); expect(after.misses).toBe(1)
  })
  it('ignores late responses after reset and cannot mark manual arrival as verified', () => {
    const reset = run([{ type: 'CHECK' }, { type: 'RESET', message: 'Paused' }, { type: 'RESULT', matched: true }], walking)
    expect(reset.phase).toBe('idle'); expect(reset.index).toBe(-1)
    const end = run([{ type: 'CHECK' }, { type: 'ERROR', message: 'offline' }, { type: 'NEXT' }, { type: 'YES' }], { ...walking, index: 3 })
    expect(end.phase).toBe('arrived'); expect(end.finalUnverified).toBe(true)
  })
  it('completes four separately confirmed steps', () => {
    let state = walking
    for (let i = 0; i < 4; i++) state = run([{ type: 'CHECK' }, { type: 'RESULT', matched: true }, { type: 'YES' }], state)
    expect(state.phase).toBe('arrived'); expect(state.lastConfirmed).toBe(3)
    expect(state.finalUnverified).toBe(false)
  })
  it('accepts only the five exact commands', () => {
    expect(parseCommand(' YES. ')).toBe('yes'); expect(parseCommand('next')).toBe('next')
    expect(parseCommand('yes and next')).toBeNull(); expect(parseCommand('yesterday')).toBeNull()
  })
})
