import { describe, expect, it } from 'vitest'
import { initial, parseCommand, transition, type Event, type Log, type Output, type Say, type State } from './machine'
import type { Distance, Position, Target } from './types'

const route = { steps: [{ expected_seconds: 8 }, { expected_seconds: 20 }] } // Budgets 30 s and 60 s.

type Step = Event | ((s: State) => Event)
function run(steps: Step[], start: State = initial) {
  let state = start
  const say: Say[] = [], log: Log[] = []
  for (const step of steps) {
    const out: Output = transition(state, typeof step === 'function' ? step(state) : step, route)
    state = out.state; say.push(...out.say); log.push(...out.log)
  }
  return { state, say, log, keys: say.map(s => s.key) }
}

const obs = (target: Target, at = 0, position: Position = 'left', distance: Distance = 'far') =>
  (s: State): Event => ({ type: 'OBSERVATION', at, step_index: s.index, generation: s.generation, target, position, distance })
const fail = (at = 0, offline = false) =>
  (s: State): Event => ({ type: 'OBSERVE_ERROR', at, step_index: s.index, generation: s.generation, offline })
const ev = (type: 'START' | 'NEXT' | 'YES' | 'NO' | 'WHERE' | 'REPEAT' | 'TICK', at = 0) => ({ type, at }) as Event
const done = (key: string, at = 0): Event => ({ type: 'AUDIO_DONE', at, key })

const origin = run([ev('START')]).state
const atOrigin = run([obs('matched'), obs('matched')], origin).state
const walking0 = run([ev('NEXT'), done('s0-instruction', 1000)], atOrigin).state
const reached0 = run([obs('matched', 5000), obs('matched', 6000)], walking0).state
const walking1 = run([ev('NEXT', 7000), done('s1-instruction', 10_000)], reached0).state

describe('arrival check: 2 matched in the 3 latest successful results', () => {
  it('Start speaks the origin instruction and starts the loop', () => {
    const r = run([ev('START')])
    expect(r.state.phase).toBe('origin'); expect(r.state.index).toBe(-1)
    expect(r.say).toEqual([{ key: 'origin-instruction', priority: 1 }])
    expect(r.log.map(l => l.event)).toEqual(['start'])
  })
  it('finds the origin with the first two matches', () => {
    const r = run([obs('matched'), obs('matched')], origin)
    expect(r.state.phase).toBe('atOrigin')
    expect(r.keys).toEqual(['origin-hint-matched-left-far', 'origin-found'])
    expect(r.log.map(l => l.event)).toEqual(['origin_found'])
  })
  it('a single match never advances, even after many candidates', () => {
    const r = run([obs('matched'), obs('none'), obs('none'), obs('candidate'), obs('candidate')], origin)
    expect(r.state.phase).toBe('origin')
    const r2 = run([obs('matched'), obs('candidate'), obs('candidate'), obs('matched')], walking0)
    expect(r2.state.phase).toBe('walking') // The first match has left the window of 3.
  })
  it('2 of 3 with a miss in between still counts', () => {
    expect(run([obs('matched'), obs('none'), obs('matched')], walking0).state.phase).toBe('reached')
  })
  it('candidates never advance a step', () => {
    const r = run(Array.from({ length: 20 }, (_, i) => obs('candidate', i * 1000)), walking0)
    expect(r.state.phase).toBe('walking'); expect(r.state.index).toBe(0)
  })
  it('reached waits for Next; Next means ready and moves to the next step', () => {
    expect(reached0.phase).toBe('reached'); expect(reached0.lastP1).toBe('s0-reached')
    const r = run([ev('NEXT')], reached0)
    expect(r.state.phase).toBe('walking'); expect(r.state.index).toBe(1)
    expect(r.keys).toEqual(['s1-instruction']); expect(r.state.window).toEqual([])
  })
  it('the last checkpoint goes straight to a verified arrival', () => {
    const r = run([obs('matched', 20_000), obs('matched', 21_000)], walking1)
    expect(r.state.phase).toBe('arrived'); expect(r.state.unverified).toBe(false)
    expect(r.keys).toEqual(['s1-hint-matched-left-far', 'arrival'])
    expect(r.log).toEqual([
      { event: 'reached', at: 21_000, step: 1, time_to_reach_ms: 11_000 },
      { event: 'arrival', at: 21_000, step: 1, verified: true },
    ])
  })
  it('logs time to reach from the end of the instruction audio', () => {
    const r = run([obs('matched', 5000), obs('matched', 6000)], walking0)
    expect(r.log).toEqual([{ event: 'reached', at: 6000, step: 0, time_to_reach_ms: 5000 }])
  })
})

describe('stale results', () => {
  it('ignores results from another step or generation, and while waiting', () => {
    const wrongStep = (s: State): Event => ({ type: 'OBSERVATION', at: 0, step_index: s.index + 1, generation: s.generation, target: 'matched', position: null, distance: null })
    const oldGen = (s: State): Event => ({ type: 'OBSERVATION', at: 0, step_index: s.index, generation: s.generation - 1, target: 'matched', position: null, distance: null })
    expect(run([wrongStep, wrongStep, oldGen, oldGen], walking0).state).toBe(walking0)
    expect(run([obs('matched'), obs('matched')], reached0).state).toBe(reached0)
    expect(run([obs('matched'), obs('matched')], atOrigin).state).toBe(atOrigin)
  })
  it('results sent before an override are dropped when searching resumes', () => {
    const lost = run([ev('TICK', 31_000)], walking0).state
    const before = lost.generation
    const back = run([ev('NEXT'), ev('NO')], lost).state
    const late: Event = { type: 'OBSERVATION', at: 0, step_index: 0, generation: before, target: 'matched', position: null, distance: null }
    expect(transition(back, late, route).state).toBe(back)
  })
  it('a result arriving after Stop cannot touch the new walk', () => {
    const late: Event = { type: 'OBSERVATION', at: 0, step_index: -1, generation: origin.generation, target: 'matched', position: null, distance: null }
    const restarted = run([{ type: 'RESET', at: 0, message: 'Stopped' }, ev('START')], origin).state
    expect(restarted.phase).toBe('origin')
    expect(transition(restarted, late, route).state).toBe(restarted)
  })
  it('stale errors do not count toward vision down', () => {
    const stale = (s: State): Event => ({ type: 'OBSERVE_ERROR', at: 0, step_index: s.index, generation: s.generation - 1 })
    expect(run([stale, stale, stale], walking0).state.visionDown).toBe(false)
  })
})

describe('step clock', () => {
  it('starts only when the instruction audio is done', () => {
    const noAudio = run([ev('NEXT', 0)], atOrigin).state
    expect(run([ev('TICK', 120_000)], noAudio).state.phase).toBe('walking')
    expect(run([done('origin-found', 5000)], noAudio).state.stepStartedAt).toBeNull()
  })
  it('budget is max(3 × expected, 30 s) from the end of the instruction', () => {
    expect(run([ev('TICK', 30_999)], walking0).state.phase).toBe('walking')
    const lost = run([ev('TICK', 31_000)], walking0)
    expect(lost.state.phase).toBe('lost'); expect(lost.keys).toEqual(['s0-lost'])
    expect(lost.log.map(l => l.event)).toEqual(['lost'])
    expect(run([ev('TICK', 69_999)], walking1).state.phase).toBe('walking')
    expect(run([ev('TICK', 70_000)], walking1).state.phase).toBe('lost')
  })
  it('replaying the instruction does not restart the clock', () => {
    const r = run([done('s0-instruction', 20_000), ev('TICK', 31_000)], walking0)
    expect(r.state.phase).toBe('lost')
  })
  it('lost says its phrase once, keeps searching and can still reach the checkpoint', () => {
    const r = run([ev('TICK', 31_000), ev('TICK', 32_000), ev('TICK', 90_000), obs('matched', 91_000), obs('matched', 92_000)], walking0)
    expect(r.keys.filter(k => k === 's0-lost')).toHaveLength(1)
    expect(r.state.phase).toBe('reached')
  })
  it('the clock starts even if the instruction ends during an override', () => {
    const down = run([ev('NEXT', 0), fail(), fail(), fail()], atOrigin).state
    const r = run([ev('NEXT'), done('s0-instruction', 4000), ev('NO'), ev('TICK', 34_000)], down)
    expect(r.state.phase).toBe('lost')
  })
})

describe('origin', () => {
  it('says the retry phrase once after 30 s and keeps looking', () => {
    const r = run([ev('TICK', 29_000), ev('TICK', 30_000), ev('TICK', 60_000)], origin)
    expect(r.keys).toEqual(['origin-retry']); expect(r.state.phase).toBe('origin')
  })
  it('has no override, not even when vision is down', () => {
    const down = run([fail(), fail(), fail()], origin)
    expect(down.state.visionDown).toBe(true); expect(down.keys).toEqual(['vision-down-origin'])
    const r = run([ev('NEXT'), ev('YES'), ev('NEXT')], down.state)
    expect(r.state.phase).toBe('origin'); expect(r.state.index).toBe(-1); expect(r.say).toEqual([])
  })
})

describe('override', () => {
  const lost = run([ev('TICK', 31_000)], walking0).state
  it('Next while lost asks before using saved directions', () => {
    const r = run([ev('NEXT')], lost)
    expect(r.state.phase).toBe('override'); expect(r.keys).toEqual(['s0-override'])
  })
  it('Yes moves on and records a manual override', () => {
    const r = run([ev('NEXT'), ev('YES', 40_000)], lost)
    expect(r.state.phase).toBe('walking'); expect(r.state.index).toBe(1); expect(r.state.overrides).toBe(1)
    expect(r.log.map(l => l.event)).toEqual(['next', 'manual_override'])
  })
  it('No returns to the exact previous state without speaking', () => {
    const r = run([ev('NEXT'), ev('NO')], lost)
    expect(r.state.phase).toBe('lost'); expect(r.state.stepStartedAt).toBe(lost.stepStartedAt)
    expect(r.keys).toEqual(['s0-override'])
    const down = run([fail(), fail(), fail()], walking0).state
    const back = run([ev('NEXT'), ev('NO')], down)
    expect(back.state.phase).toBe('walking'); expect(back.state.stepStartedAt).toBe(1000)
  })
  it('override on the last step ends as an unverified arrival', () => {
    const lastLost = run([ev('TICK', 70_000)], walking1).state
    const r = run([ev('NEXT'), ev('YES', 71_000)], lastLost)
    expect(r.state.phase).toBe('arrived'); expect(r.state.unverified).toBe(true)
    expect(r.keys).toEqual(['s1-override', 'arrival-unverified'])
    expect(r.log.map(l => l.event)).toEqual(['next', 'manual_override', 'arrival'])
    expect(r.log[2].verified).toBe(false)
  })
  it('Next while walking does nothing unless vision is down', () => {
    expect(run([ev('NEXT'), ev('YES')], walking0).state).toBe(walking0)
  })
})

describe('vision down', () => {
  it('turns on after 3 consecutive errors and off after one success', () => {
    const two = run([fail(), fail(), obs('none'), fail(), fail()], walking0)
    expect(two.state.visionDown).toBe(false)
    const down = run([fail(), fail(), fail(), fail()], walking0)
    expect(down.state.visionDown).toBe(true)
    expect(down.keys).toEqual(['vision-down']); expect(down.log.map(l => l.event)).toEqual(['vision_down'])
    const back = run([obs('none')], down.state)
    expect(back.state.visionDown).toBe(false); expect(back.keys).toEqual(['vision-back'])
    expect(back.log.map(l => l.event)).toEqual(['vision_back'])
  })
  it('going offline turns it on at once', () => {
    expect(run([fail(0, true)], walking0).state.visionDown).toBe(true)
  })
  it('Next while vision is down opens the override from walking', () => {
    const down = run([fail(), fail(), fail()], walking0).state
    expect(run([ev('NEXT')], down).state.overrideFrom).toBe('walking')
  })
})

describe('where, repeat, duplicates and reset', () => {
  it('Where names the last passed place while searching, and repeats elsewhere', () => {
    const r = run([ev('WHERE')], walking0)
    expect(r.keys).toEqual(['s0-where']); expect(r.state.phase).toBe('walking')
    expect(r.state.window).toEqual(walking0.window)
    expect(run([ev('WHERE')], reached0).keys).toEqual(['s0-reached'])
  })
  it('Repeat replays the latest P1 without changing state', () => {
    const r = run([ev('REPEAT')], reached0)
    expect(r.state).toBe(reached0); expect(r.say).toEqual([{ key: 's0-reached', priority: 1 }])
    expect(run([ev('REPEAT')], initial).say).toEqual([])
  })
  it('repeated Next never skips a step', () => {
    const r = run([ev('NEXT'), ev('NEXT'), ev('NEXT')], reached0)
    expect(r.state.index).toBe(1); expect(r.keys).toEqual(['s1-instruction'])
    expect(run([ev('NEXT'), ev('NEXT')], atOrigin).state.index).toBe(0)
  })
  it('Yes and No mean nothing outside the override', () => {
    for (const s of [origin, atOrigin, walking0, reached0]) expect(run([ev('YES'), ev('NO')], s).state).toBe(s)
  })
  it('reset returns to idle, logs stop only during a walk, and bumps the generation', () => {
    const r = run([{ type: 'RESET', at: 5, message: 'Paused' }], walking0)
    expect(r.state.phase).toBe('idle'); expect(r.state.message).toBe('Paused')
    expect(r.state.generation).toBeGreaterThan(walking0.generation)
    expect(r.log).toEqual([{ event: 'stop', at: 5, step: 0 }])
    expect(run([{ type: 'RESET', at: 5, message: '' }]).log).toEqual([])
  })
})

describe('hints from the machine', () => {
  it('speaks a P2 hint for candidates, rate-limited, and never for none', () => {
    const r = run([obs('candidate', 0, 'left', 'far'), obs('candidate', 2000, 'left', 'far'), obs('none', 9000), obs('candidate', 9000, 'left', 'far')], walking0)
    expect(r.say).toEqual([{ key: 's0-hint-candidate-left-far', priority: 2 }, { key: 's0-hint-candidate-left-far', priority: 2 }])
  })
  it('the matched result that completes 2/3 speaks the arrival phrase, not a hint', () => {
    const r = run([obs('matched', 0, 'ahead', 'near'), obs('matched', 10_000, 'ahead', 'near')], walking0)
    expect(r.keys).toEqual(['s0-hint-matched-ahead-near', 's0-reached'])
  })
  it('origin hints use the origin prefix', () => {
    expect(run([obs('candidate', 0, 'right', 'near')], origin).keys).toEqual(['origin-hint-candidate-right-near'])
  })
})

describe('commands', () => {
  it('accepts only the exact commands, including where am I', () => {
    expect(parseCommand(' YES. ')).toBe('yes'); expect(parseCommand('next')).toBe('next')
    expect(parseCommand('Where am I?')).toBe('where'); expect(parseCommand('where')).toBe('where')
    expect(parseCommand('repeat')).toBe('repeat'); expect(parseCommand('stop!')).toBe('stop')
    expect(parseCommand('yes and next')).toBeNull(); expect(parseCommand('yesterday')).toBeNull()
  })
})
