import raw from './timeline.json'

export type SceneId = 'teach' | 'route' | 'collision'
export type Anchor = 'lead' | 'loading' | 'learned'

export type SourceSpec = {
  fileId: string
  file: string
  durationSeconds: number
  width: number
  height: number
  fps: number
  colorTransfer: string
}

type CueBase = { id: string; text: string; warning?: boolean }
export type AbsoluteCue = CueBase & { at: number }
export type AnchoredCue = CueBase & { anchor: Anchor; offset: number }
export type AbsoluteSpeechCue = AbsoluteCue & { windowSeconds: number }
export type AnchoredSpeechCue = AnchoredCue & { windowSeconds: number }

type SceneBase = {
  order: number
  media: string
  source: keyof Timeline['sources']
  title: string
  summary: string
  instructions: string
  primaryLabel: string
  stageLabel: string
  videoAriaLabel: string
  recordChip: boolean
  keepSourceAudio: boolean
}

export type TeachScene = SceneBase & {
  leadSeconds: number
  loadingSeconds: number
  tailSeconds: number
  captions: AnchoredCue[]
  tts: AnchoredSpeechCue[]
}

export type MeasuredScene = SceneBase & {
  captions: AbsoluteCue[]
  tts: AbsoluteSpeechCue[]
}

export type CollisionScene = MeasuredScene & {
  clipStartSeconds: number
  clipSeconds: number
  chimeAtSeconds: number
}

export type SceneSpec = TeachScene | MeasuredScene | CollisionScene

export type Timeline = {
  schemaVersion: number
  ttsVoice: string
  encode: {
    width: number
    height: number
    fps: number
    videoCrf: number
    videoPreset: string
    audioBitrate: string
    audioSampleRate: number
  }
  sources: Record<'teach' | 'route' | 'collision', SourceSpec>
  scenes: Record<SceneId, SceneSpec>
}

export const timeline = raw as unknown as Timeline

export const sceneIds: SceneId[] = (['teach', 'route', 'collision'] as SceneId[])
  .sort((a, b) => timeline.scenes[a].order - timeline.scenes[b].order)

export function isSceneId(value: string | null | undefined): value is SceneId {
  return value === 'teach' || value === 'route' || value === 'collision'
}

export function sceneSpec(id: SceneId): SceneSpec {
  return timeline.scenes[id]
}

export function sourceSpec(scene: SceneSpec): SourceSpec {
  return timeline.sources[scene.source]
}

export function isTeach(scene: SceneSpec): scene is TeachScene {
  return 'leadSeconds' in scene
}

export function isCollision(scene: SceneSpec): scene is CollisionScene {
  return 'clipSeconds' in scene
}

export function demoMediaUrl(file: string): string {
  return `/demo-media/${file}`
}

/** Start time of each anchored cue, in seconds from the first frame of the prepared clip. */
export function anchorSeconds(scene: SceneSpec, anchor: Anchor): number {
  if (!isTeach(scene)) throw new Error(`${scene.media} has no anchored cues`)
  const source = sourceSpec(scene).durationSeconds
  if (anchor === 'lead') return 0
  if (anchor === 'loading') return scene.leadSeconds + source
  return scene.leadSeconds + source + scene.loadingSeconds
}

export function sceneDurationSeconds(scene: SceneSpec): number {
  if (isTeach(scene)) {
    return scene.leadSeconds + sourceSpec(scene).durationSeconds + scene.loadingSeconds + scene.tailSeconds
  }
  if (isCollision(scene)) return scene.clipSeconds
  return sourceSpec(scene).durationSeconds
}

export function captionCues(scene: SceneSpec): AbsoluteCue[] {
  return isTeach(scene)
    ? scene.captions.map(cue => ({ id: cue.id, text: cue.text, warning: cue.warning, at: anchorSeconds(scene, cue.anchor) + cue.offset }))
    : scene.captions
}

export function speechCues(scene: SceneSpec): AbsoluteSpeechCue[] {
  return isTeach(scene)
    ? scene.tts.map(cue => ({ id: cue.id, text: cue.text, at: anchorSeconds(scene, cue.anchor) + cue.offset, windowSeconds: cue.windowSeconds }))
    : scene.tts
}

export type DemoPhase =
  | 'idle' | 'lead' | 'recording' | 'loading' | 'learned'
  | 'navigating' | 'arrived' | 'watching' | 'warning' | 'cleared'

export type DemoSnapshot = {
  phase: DemoPhase
  caption: string
  warning: boolean
  /** Teach only: show the loading panel instead of the camera viewport. */
  learningPanel: boolean
  /** Teach only: record chip and elapsed timer are live. */
  recording: boolean
  elapsedSeconds: number
  progress: number
}

const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max))

function cueTextAt(cues: AbsoluteCue[], time: number): AbsoluteCue {
  let current = cues[0]
  for (const cue of cues) if (time >= cue.at) current = cue
  return current
}

/**
 * Pure mapping from video.currentTime to the visible phase. The player never runs its own clock,
 * so pause, resume, restart and seeking all stay aligned with the baked narration.
 */
export function snapshotAt(id: SceneId, currentTime: number, started: boolean): DemoSnapshot {
  const scene = sceneSpec(id)
  const cues = captionCues(scene)
  const duration = sceneDurationSeconds(scene)
  const active = started ? clamp(currentTime, duration) : 0
  const progress = duration > 0 ? active / duration : 0
  const cue = active > 0 ? cueTextAt(cues, active) : cues[0]
  const caption = started ? cue.text : cues[0].text
  const warning = Boolean(cue.warning) && started

  if (!started) {
    return { phase: 'idle', caption, warning: false, learningPanel: false, recording: false, elapsedSeconds: 0, progress: 0 }
  }

  if (isTeach(scene)) {
    const source = sourceSpec(scene).durationSeconds
    const loadingAt = scene.leadSeconds + source
    const learnedAt = loadingAt + scene.loadingSeconds
    if (active < scene.leadSeconds) {
      return { phase: 'lead', caption, warning: false, learningPanel: false, recording: true, elapsedSeconds: active, progress }
    }
    if (active < loadingAt) {
      return { phase: 'recording', caption, warning: false, learningPanel: false, recording: true, elapsedSeconds: active, progress }
    }
    if (active < learnedAt) {
      return { phase: 'loading', caption, warning: false, learningPanel: true, recording: false, elapsedSeconds: loadingAt, progress }
    }
    return { phase: 'learned', caption, warning: false, learningPanel: true, recording: false, elapsedSeconds: loadingAt, progress }
  }

  if (isCollision(scene)) {
    const warningAt = cues[1]?.at ?? 1
    const warningUntil = cues[2]?.at ?? scene.clipSeconds
    const phase: DemoPhase = active < warningAt ? 'watching' : active < warningUntil ? 'warning' : 'cleared'
    return { phase, caption, warning: phase === 'warning', learningPanel: false, recording: false, elapsedSeconds: active, progress }
  }

  const arrivalAt = cues[cues.length - 1].at
  const phase: DemoPhase = active < arrivalAt ? 'navigating' : 'arrived'
  return { phase, caption, warning: false, learningPanel: false, recording: false, elapsedSeconds: active, progress }
}

export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  return `${minutes}:${String(total % 60).padStart(2, '0')}`
}
