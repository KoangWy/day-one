import type { Priority } from './machine'

/** The subset of HTMLAudioElement the queue uses; one element, unlocked by a tap on Start. */
export interface Player {
  src: string; muted: boolean
  play(): Promise<void>; pause(): void
  addEventListener(type: 'ended' | 'error', listener: () => void): void
  removeEventListener(type: 'ended' | 'error', listener: () => void): void
}

export type VoiceOptions = {
  url: (key: string) => string
  text: (key: string) => string
  /** AUDIO_DONE: finished, failed, blocked or shown as text. Starts the step clock. */
  onDone: (key: string) => void
  /** App voice off: the sentence goes to an aria-live region instead. */
  onText: (text: string, priority: Priority) => void
  onBlocked: (blocked: boolean) => void
  enabled: () => boolean
  listening: () => boolean
}

type Item = { key: string; priority: Priority }

/**
 * P0 interrupts and plays now (reserved for obstacle warnings); an interrupted P1 goes back to the
 * front of the queue. P1 is never dropped: it queues FIFO and cuts off a hint. P2 hints play only
 * when nothing is playing or queued and the microphone is closed; otherwise they are dropped.
 */
export function createVoice(player: Player, o: VoiceOptions) {
  let current: Item | null = null
  let queue: Item[] = []
  let held = false
  let token = 0

  function play(item: Item) {
    current = item
    const mine = ++token
    player.pause(); player.src = o.url(item.key); player.muted = false
    player.play().then(() => { if (mine === token) o.onBlocked(false) },
      () => { if (mine === token) failed() })
  }
  function finish() {
    const item = current
    if (!item) return
    current = null; token++
    o.onDone(item.key)
    next()
  }
  function failed() {
    // Safari autoplay block or missing audio: the text stays on screen and the clock still runs.
    if (current) o.onBlocked(true)
    finish()
  }
  function next() {
    if (current || held) return
    const item = queue.shift()
    if (item) play(item)
  }
  function interrupt() {
    token++; current = null; player.pause()
  }
  player.addEventListener('ended', () => { if (current) finish() })
  player.addEventListener('error', () => { if (current) failed() })

  return {
    /** Returns false when a hint was dropped. */
    say(key: string, priority: Priority): boolean {
      if (!o.enabled()) { o.onText(o.text(key), priority); o.onDone(key); return true }
      const item = { key, priority }
      if (priority === 2) {
        if (current || queue.length || held || o.listening()) return false
        play(item); return true
      }
      if (priority === 0) {
        if (current?.priority === 1) queue.unshift(current)
        interrupt(); play(item); return true
      }
      if (current?.priority === 2) { interrupt(); play(item); return true }
      queue.push(item); next(); return true
    },
    /** Push-to-talk opened: stop speaking now and hold queued sentences until resume(). */
    hush() {
      held = true
      if (current) { const item = current; interrupt(); o.onDone(item.key) }
    },
    resume() { held = false; next() },
    /** App voice turned off: everything pending is shown as text instead. */
    mute() {
      const pending = [...(current ? [current] : []), ...queue]
      interrupt(); queue = []
      for (const item of pending) { o.onText(o.text(item.key), item.priority); o.onDone(item.key) }
    },
    /** Reset: forget everything without AUDIO_DONE. */
    clear() { interrupt(); queue = []; held = false; o.onBlocked(false) },
    get busy() { return current !== null || queue.length > 0 },
  }
}

export type Voice = ReturnType<typeof createVoice>
