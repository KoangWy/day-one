import { describe, expect, it } from 'vitest'
import { chooseHint } from './hints'

describe('hint rate limit', () => {
  it('speaks the first hint, then waits 8 s', () => {
    expect(chooseHint('walking', 0, 'candidate', 'left', 'far', null, 0)).toBe('s0-hint-candidate-left-far')
    const last = { at: 0, position: 'left' as const }
    expect(chooseHint('walking', 0, 'candidate', 'left', 'near', last, 7999)).toBeNull()
    expect(chooseHint('walking', 0, 'candidate', 'left', 'near', last, 8000)).toBe('s0-hint-candidate-left-near')
  })
  it('a new position may speak after 3 s', () => {
    const last = { at: 0, position: 'left' as const }
    expect(chooseHint('lost', 1, 'matched', 'right', 'far', last, 2999)).toBeNull()
    expect(chooseHint('lost', 1, 'matched', 'right', 'far', last, 3000)).toBe('s1-hint-matched-right-far')
  })
  it('stays silent for none, missing position or distance, and outside searching', () => {
    expect(chooseHint('walking', 0, 'none', null, null, null, 0)).toBeNull()
    expect(chooseHint('walking', 0, 'candidate', null, 'far', null, 0)).toBeNull()
    expect(chooseHint('walking', 0, 'candidate', 'ahead', null, null, 0)).toBeNull()
    for (const phase of ['idle', 'atOrigin', 'reached', 'override', 'arrived']) {
      expect(chooseHint(phase, 0, 'candidate', 'ahead', 'far', null, 0)).toBeNull()
    }
    expect(chooseHint('origin', -1, 'candidate', 'ahead', 'far', null, 0)).toBe('origin-hint-candidate-ahead-far')
  })
})
