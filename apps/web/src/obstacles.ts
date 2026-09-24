/**
 * On-device obstacle awareness: turns object detections from the phone's camera into at most
 * one spoken warning per obstacle. Pure logic; detector.ts supplies detections, the app speaks.
 * A wayfinding aid, not a safety device: silence never means the path is clear.
 */

/** Normalised to the camera frame: 0..1, origin top-left. */
export type Box = { x: number; y: number; w: number; h: number }
export type Detection = { label: string; score: number; box: Box }
export type ObstacleKind = 'person' | 'object'

export const OBJECTS = ['chair', 'couch', 'bench', 'suitcase', 'bicycle', 'motorcycle', 'potted plant', 'dining table', 'dog']
export const LABELS = ['person', ...OBJECTS]

/** The walking corridor: the middle 40% of a forward-facing chest camera. */
export const CORRIDOR = [0.3, 0.7] as const
/** A standing person this tall in the frame is roughly 4 m away with a chest-height phone.
 * Tuned on the team's corridor footage: warns about 4 s before an oncoming person passes. */
export const PERSON_NEAR_HEIGHT = 0.4
export const PERSON_MIN_SCORE = 0.45
export const OBJECT_MIN_SCORE = 0.55
/** Consecutive frames before warning (4 frames a second). Objects need longer, so furniture that
 * only sweeps across the frame while the walker turns (or sits behind a glass wall) stays quiet. */
export const CONFIRM_FRAMES: Record<ObstacleKind, number> = { person: 2, object: 3 }
/** No detection for this long ends the warning. */
export const CLEAR_MS = 1500
/** The same kind is not announced again within this time, even if it disappears and returns. */
export const REPEAT_MS = 8000

export function inPath({ x, w }: Box): boolean {
  const overlap = Math.min(x + w, CORRIDOR[1]) - Math.max(x, CORRIDOR[0])
  return overlap > 0 && overlap >= 0.4 * Math.min(w, CORRIDOR[1] - CORRIDOR[0])
}

/** The kind of obstacle close ahead in this frame, people first; null when nothing qualifies. */
export function classify(detections: Detection[]): ObstacleKind | null {
  let found: ObstacleKind | null = null
  for (const d of detections) {
    if (!inPath(d.box)) continue
    if (d.label === 'person' && d.score >= PERSON_MIN_SCORE && d.box.h >= PERSON_NEAR_HEIGHT) return 'person'
    const low = d.box.y + d.box.h >= 0.8 // Standing on the floor just ahead, not far down the corridor.
    const centred = Math.abs(d.box.x + d.box.w / 2 - 0.5) <= 0.15
    if (OBJECTS.includes(d.label) && d.score >= OBJECT_MIN_SCORE && low && centred && (d.box.h >= 0.3 || d.box.w >= 0.35)) found = 'object'
  }
  return found
}

export type Tracker = {
  candidate: ObstacleKind | null; streak: number
  active: ObstacleKind | null; lastSeen: number
  announced: Record<ObstacleKind, number>
}
export const idle: Tracker = { candidate: null, streak: 0, active: null, lastSeen: -Infinity, announced: { person: -Infinity, object: -Infinity } }

export type Assessment = { tracker: Tracker; alert: ObstacleKind | null; cleared: boolean }

export function assess(t: Tracker, detections: Detection[], now: number): Assessment {
  const kind = classify(detections)
  if (!kind) {
    const over = t.active !== null && now - t.lastSeen >= CLEAR_MS
    return { tracker: { ...t, candidate: null, streak: 0, active: over ? null : t.active }, alert: null, cleared: over }
  }
  const streak = kind === t.candidate ? t.streak + 1 : 1
  let tracker: Tracker = { ...t, candidate: kind, streak, lastSeen: now }
  if (streak < CONFIRM_FRAMES[kind] || t.active === kind) return { tracker, alert: null, cleared: false }
  // Confirmed and not already shown. A person outranks an object that is already on screen.
  const fresh = now - t.announced[kind] >= REPEAT_MS
  tracker = { ...tracker, active: kind, announced: fresh ? { ...t.announced, [kind]: now } : t.announced }
  return { tracker, alert: fresh ? kind : null, cleared: false }
}

export type Watch = { start(): void; stop(): void; readonly active: ObstacleKind | null }

/**
 * Runs the detector a few times a second while started. onShow fires for every confirmed obstacle
 * (banner), onAlert only when it should also be spoken, onClear when the banner should go.
 */
export function createWatch(o: {
  detect: (now: number) => Detection[] | null
  onShow: (kind: ObstacleKind) => void
  onAlert: (kind: ObstacleKind) => void
  onClear: () => void
  intervalMs?: number
  now?: () => number
}): Watch {
  const now = o.now ?? (() => performance.now())
  let tracker = idle
  let timer: ReturnType<typeof setInterval> | undefined

  function tick() {
    let detections: Detection[] | null
    try { detections = o.detect(now()) } catch { detections = null }
    if (!detections) return // Camera not ready or a detector hiccup: keep the current state.
    const before = tracker.active
    const result = assess(tracker, detections, now())
    tracker = result.tracker
    if (result.alert) o.onAlert(result.alert)
    if (tracker.active && tracker.active !== before) o.onShow(tracker.active)
    if (result.cleared) o.onClear()
  }

  return {
    start() { timer ??= setInterval(tick, o.intervalMs ?? 250) },
    stop() {
      clearInterval(timer); timer = undefined
      const shown = tracker.active
      tracker = { ...idle, announced: tracker.announced } // Keep the repeat guard across pauses.
      if (shown) o.onClear()
    },
    get active() { return tracker.active },
  }
}
