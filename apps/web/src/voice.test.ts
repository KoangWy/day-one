import { beforeEach, describe, expect, it } from 'vitest'
import { createVoice, type Player } from './voice'

class FakePlayer implements Player {
  src = ''; muted = true; rejectPlay = false
  played: string[] = []
  private listeners: Record<string, (() => void)[]> = { ended: [], error: [] }
  play() {
    this.played.push(this.src)
    return this.rejectPlay ? Promise.reject(new Error('NotAllowedError')) : Promise.resolve()
  }
  pause() {}
  addEventListener(type: 'ended' | 'error', listener: () => void) { this.listeners[type].push(listener) }
  removeEventListener() {}
  emit(type: 'ended' | 'error') { for (const l of this.listeners[type]) l() }
}

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

let player: FakePlayer, done: string[], texts: [string, number][], blocked: boolean[]
let enabled: boolean, listening: boolean
function voice() {
  return createVoice(player, {
    url: key => `/speech/r/${key}.mp3`, text: key => `TEXT ${key}`,
    onDone: key => done.push(key), onText: (text, p) => texts.push([text, p]),
    onBlocked: b => blocked.push(b), enabled: () => enabled, listening: () => listening,
  })
}
const keys = () => player.played.map(url => url.replace('/speech/r/', '').replace('.mp3', ''))

beforeEach(() => {
  player = new FakePlayer(); done = []; texts = []; blocked = []; enabled = true; listening = false
})

describe('priority queue', () => {
  it('plays P1 in order and reports each as done', () => {
    const v = voice()
    v.say('a', 1); v.say('b', 1)
    expect(keys()).toEqual(['a'])
    player.emit('ended'); expect(keys()).toEqual(['a', 'b']); expect(done).toEqual(['a'])
    player.emit('ended'); expect(done).toEqual(['a', 'b']); expect(v.busy).toBe(false)
  })
  it('P0 interrupts now and keeps the P1 queue, replaying the cut sentence first', () => {
    const v = voice()
    v.say('a', 1); v.say('b', 1); v.say('warn', 0)
    expect(keys()).toEqual(['a', 'warn'])
    player.emit('ended'); expect(keys()).toEqual(['a', 'warn', 'a'])
    player.emit('ended'); player.emit('ended')
    expect(keys()).toEqual(['a', 'warn', 'a', 'b']); expect(done).toEqual(['warn', 'a', 'b'])
  })
  it('P1 is never dropped and stops a hint that is playing', () => {
    const v = voice()
    expect(v.say('hint', 2)).toBe(true)
    v.say('a', 1)
    expect(keys()).toEqual(['hint', 'a'])
    player.emit('ended'); expect(done).toEqual(['a'])
  })
  it('P2 is dropped while speaking, while sentences wait, or while the mic listens', () => {
    const v = voice()
    v.say('a', 1)
    expect(v.say('hint', 2)).toBe(false)
    v.say('b', 1); player.emit('ended')
    expect(v.say('hint', 2)).toBe(false)
    player.emit('ended')
    listening = true
    expect(v.say('hint', 2)).toBe(false)
    listening = false
    expect(v.say('hint', 2)).toBe(true)
    expect(v.say('hint2', 2)).toBe(false)
    expect(keys()).toEqual(['a', 'b', 'hint'])
  })
})

describe('fallbacks', () => {
  it('App voice off sends sentences to text and reports done at once', () => {
    enabled = false
    const v = voice()
    v.say('a', 1); v.say('hint', 2)
    expect(player.played).toEqual([])
    expect(texts).toEqual([['TEXT a', 1], ['TEXT hint', 2]]); expect(done).toEqual(['a', 'hint'])
  })
  it('a blocked or failing audio still reports done and shows Play instruction', async () => {
    player.rejectPlay = true
    const v = voice()
    v.say('a', 1); v.say('b', 1)
    await flush(); await flush()
    expect(done).toEqual(['a', 'b']); expect(blocked).toContain(true)
    player.rejectPlay = false
    v.say('c', 1); player.emit('error')
    expect(done).toEqual(['a', 'b', 'c'])
  })
  it('push-to-talk stops the sentence, holds the queue, then resumes', () => {
    const v = voice()
    v.say('a', 1); v.say('b', 1)
    v.hush()
    expect(done).toEqual(['a'])
    v.say('c', 1)
    expect(keys()).toEqual(['a'])
    v.resume()
    expect(keys()).toEqual(['a', 'b'])
    player.emit('ended'); expect(keys()).toEqual(['a', 'b', 'c'])
  })
  it('turning App voice off mid-sentence shows the rest as text', () => {
    const v = voice()
    v.say('a', 1); v.say('b', 1)
    enabled = false; v.mute()
    expect(texts).toEqual([['TEXT a', 1], ['TEXT b', 1]]); expect(done).toEqual(['a', 'b'])
    player.emit('ended'); expect(done).toEqual(['a', 'b'])
  })
  it('clear forgets everything without reporting done', () => {
    const v = voice()
    v.say('a', 1); v.say('b', 1); v.clear()
    player.emit('ended')
    expect(done).toEqual([]); expect(v.busy).toBe(false)
  })
})
