import { describe, expect, it } from 'vitest'
import {
  anchorSeconds, captionCues, formatClock, isCollision, isSceneId, isTeach, sceneDurationSeconds,
  sceneIds, sceneSpec, snapshotAt, speechCues,
} from './timeline'

describe('demo timeline contract', () => {
  it('orders the three screen-recording scenes', () => {
    expect(sceneIds).toEqual(['teach', 'route', 'collision'])
    expect(sceneIds.map(id => sceneSpec(id).order)).toEqual([1, 2, 3])
    expect(isSceneId('teach')).toBe(true)
    expect(isSceneId('collision')).toBe(true)
    expect(isSceneId('live')).toBe(false)
    expect(isSceneId(null)).toBe(false)
  })

  it('lays out teach as a 2s hold, the full source, 1s learning and a 3s tail', () => {
    const scene = sceneSpec('teach')
    if (!isTeach(scene)) throw new Error('teach must use anchored cues')
    expect(scene.leadSeconds).toBe(2)
    expect(scene.loadingSeconds).toBe(1)
    expect(scene.tailSeconds).toBe(3)
    expect(anchorSeconds(scene, 'lead')).toBe(0)
    expect(anchorSeconds(scene, 'loading')).toBeCloseTo(39.613333, 6)
    expect(anchorSeconds(scene, 'learned')).toBeCloseTo(40.613333, 6)
    expect(sceneDurationSeconds(scene)).toBeCloseTo(43.613333, 6)
    expect(captionCues(scene).map(cue => cue.text)).toEqual(['Recording started.', 'Learning.', 'Route learned.'])
  })

  it('derives teach phases from the clip position', () => {
    const scene = sceneSpec('teach')
    if (!isTeach(scene)) throw new Error('teach must use anchored cues')
    const loadingAt = anchorSeconds(scene, 'loading')
    const learnedAt = anchorSeconds(scene, 'learned')
    expect(snapshotAt('teach', 0, false)).toMatchObject({ phase: 'idle', progress: 0, recording: false })
    expect(snapshotAt('teach', 0, true)).toMatchObject({ phase: 'lead', recording: true, learningPanel: false })
    expect(snapshotAt('teach', 1.99, true).phase).toBe('lead')
    expect(snapshotAt('teach', 2, true)).toMatchObject({ phase: 'recording', caption: 'Recording started.', recording: true })
    expect(snapshotAt('teach', loadingAt - 0.01, true).phase).toBe('recording')
    expect(snapshotAt('teach', loadingAt, true)).toMatchObject({ phase: 'loading', caption: 'Learning.', learningPanel: true, recording: false })
    expect(snapshotAt('teach', loadingAt + 0.99, true).phase).toBe('loading')
    expect(snapshotAt('teach', learnedAt, true)).toMatchObject({ phase: 'learned', caption: 'Route learned.', learningPanel: true })
    expect(snapshotAt('teach', sceneDurationSeconds(scene), true).phase).toBe('learned')
    expect(snapshotAt('teach', 99, true).phase).toBe('learned')
    expect(snapshotAt('teach', 12, true).elapsedSeconds).toBe(12)
  })

  it('plays the route cues at 0s, 3.5s and 10s and ends arrived', () => {
    const scene = sceneSpec('route')
    expect(sceneDurationSeconds(scene)).toBeCloseTo(14.373333, 6)
    expect(snapshotAt('route', 0, true)).toMatchObject({ phase: 'navigating', caption: 'Turn right.' })
    expect(snapshotAt('route', 3.4, true).caption).toBe('Turn right.')
    expect(snapshotAt('route', 3.5, true).caption).toBe('Continue straight.')
    expect(snapshotAt('route', 9.99, true).phase).toBe('navigating')
    expect(snapshotAt('route', 10, true)).toMatchObject({ phase: 'arrived', caption: 'You have arrived. The restroom is on your right.' })
    expect(snapshotAt('route', 14.373333, true).phase).toBe('arrived')
    expect(snapshotAt('route', 99, true).phase).toBe('arrived')
  })

  it('keeps the collision warning exactly [1s, 7s) in a 9 second clip', () => {
    const scene = sceneSpec('collision')
    if (!isCollision(scene)) throw new Error('collision must carry clip metadata')
    expect(scene.clipStartSeconds).toBe(5)
    expect(scene.clipSeconds).toBe(9)
    expect(sceneDurationSeconds(scene)).toBe(9)
    expect(snapshotAt('collision', 0, true)).toMatchObject({ phase: 'watching', warning: false, caption: 'Watching the path ahead.' })
    expect(snapshotAt('collision', 0.99, true).warning).toBe(false)
    expect(snapshotAt('collision', 1, true)).toMatchObject({ phase: 'warning', warning: true, caption: 'Be careful. Someone is in front of you.' })
    expect(snapshotAt('collision', 6.99, true).warning).toBe(true)
    expect(snapshotAt('collision', 7, true)).toMatchObject({ phase: 'cleared', warning: false, caption: 'Warning ended. Keep watching the path ahead.' })
    expect(snapshotAt('collision', 9, true).warning).toBe(false)
    expect(snapshotAt('collision', 9, true).caption).toBe('Warning ended. Keep watching the path ahead.')
  })

  it('shows exactly the sentence that is spoken', () => {
    for (const id of sceneIds) {
      const scene = sceneSpec(id)
      for (const cue of speechCues(scene)) {
        expect(`${id}/${cue.id} ${snapshotAt(id, cue.at, true).caption}`).toBe(`${id}/${cue.id} ${cue.text}`)
      }
    }
  })

  it('keeps every spoken sentence inside its window and inside the clip', () => {
    for (const id of sceneIds) {
      const scene = sceneSpec(id)
      const duration = sceneDurationSeconds(scene)
      for (const cue of speechCues(scene)) {
        expect(cue.windowSeconds).toBeGreaterThan(0)
        expect(cue.at + cue.windowSeconds).toBeLessThanOrEqual(duration + 1e-6)
      }
    }
  })

  it('keeps product-facing scene copy free of production scripting', () => {
    expect(sceneSpec('route').instructions).toBe('Follow the spoken directions to the restroom.')
    expect(sceneSpec('collision').instructions).toBe('Hold your phone at chest height.')
    for (const id of sceneIds) {
      const visible = [sceneSpec(id).instructions, sceneSpec(id).summary, sceneSpec(id).title].join(' ')
      expect(`${id} ${visible}`).not.toMatch(/nine-second|saved walk|camera, microphone|live AI|prepared clip/i)
    }
  })

  it('formats the remaining time as minutes and seconds', () => {
    expect(formatClock(0)).toBe('0:00')
    expect(formatClock(7.9)).toBe('0:07')
    expect(formatClock(62)).toBe('1:02')
    expect(formatClock(-3)).toBe('0:00')
  })
})
