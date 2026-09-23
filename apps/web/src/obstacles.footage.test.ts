import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { assess, idle, type Detection } from './obstacles'

// Real detector output (numbers only, no images) from the team's filmed walks.
type Frame = [number, [string, number, number, number, number, number][]]
const footage: Record<'collision' | 'meeting', Frame[]> = JSON.parse(readFileSync(new URL('./fixtures/footage-detections.json', import.meta.url), 'utf8'))

function replay(frames: Frame[]) {
  let tracker = idle
  const alerts: [number, string][] = [], shown: number[] = []
  for (const [t, raw] of frames) {
    const detections: Detection[] = raw.map(([label, score, x, y, w, h]) => ({ label: label === 'P' ? 'person' : label, score, box: { x, y, w, h } }))
    const before = tracker.active
    const r = assess(tracker, detections, t * 1000)
    tracker = r.tracker
    if (r.alert) alerts.push([t, r.alert])
    if (tracker.active && !before) shown.push(t)
  }
  return { alerts, shown }
}

describe('obstacle alerts on filmed walks', () => {
  it('warns once about the colleague walking towards the camera, about 4 s before they pass', () => {
    const { alerts } = replay(footage.collision)
    expect(alerts).toEqual([[7.25, 'person']]) // They pass the camera at ~11.5 s.
  })
  it('stays quiet for people far down the corridor or off to the side', () => {
    expect(replay(footage.collision.filter(([t]) => t >= 12)).alerts).toEqual([])
  })
  it('stays quiet while turning past a sofa behind a glass wall, a plant and people at the edge', () => {
    expect(replay(footage.meeting)).toEqual({ alerts: [], shown: [] })
  })
})
