import { expect, test } from '@playwright/test'
import { existsSync, readFileSync } from 'node:fs'
import type { Assets, Route, RouteSummary } from '../src/types'

// The real on-device pipeline: filmed corridor → camera stream → MediaPipe detector (served by the
// dev server) → obstacle logic → banner, chime and spoken warning. The footage stays local
// (data/runtime is gitignored); create it as described in docs/SUPER_FINAL.md, or this skips.
const CLIP = '../../data/runtime/verify/collision.mp4'
const MODEL = 'public/models/efficientdet_lite0.tflite'

const route: Route = JSON.parse(readFileSync('../../data/examples/lift-lobby-to-toilet-v2/route.json', 'utf8'))
const summary: RouteSummary = { route_id: route.route_id, origin_label: 'Lift lobby', destination_label: 'Toilet entrance',
  origin_place: 'lift-lobby', destination_place: 'toilet-entrance', steps: 2, hazards: 0, sample: false }
const assets: Assets = { origin_label: 'Lift lobby', destination_label: 'Toilet entrance', sample: false,
  steps: [{ short_name: 'office sign', expected_seconds: 8 }, { short_name: 'toilet entrance', expected_seconds: 10 }],
  phrases: { 'origin-instruction': 'Stand outside the lift.' } }

test('a colleague walking towards the camera gets one chime and one spoken warning', async ({ page, browserName }) => {
  test.skip(!existsSync(CLIP) || !existsSync(MODEL), 'Needs the local corridor clip and the downloaded obstacle model')
  test.skip(browserName !== 'chromium', 'Uses HTMLVideoElement.captureStream as the camera')
  test.setTimeout(90_000)
  const speech: string[] = []
  await page.route('**/footage/collision.mp4', r => r.fulfill({ path: CLIP, contentType: 'video/mp4' }))
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      const clip = document.createElement('video')
      clip.muted = true; clip.playsInline = true; clip.src = '/footage/collision.mp4'
      await clip.play()
      return (clip as HTMLVideoElement & { captureStream(): MediaStream }).captureStream()
    } } })
  })
  await page.route('**/routes', r => r.fulfill({ json: [route] }))
  await page.route('**/catalog', r => r.fulfill({ json: [summary] }))
  await page.route('**/health', r => r.fulfill({ json: { provider_label: 'Mock visual provider' } }))
  await page.route('**/routes/*/assets', r => r.fulfill({ json: assets }))
  await page.route('**/observe', r => r.fulfill({ json: { step_index: -1, target: 'none', position: null, distance: null, hazards: [] } }))
  for (const pattern of ['**/speech/**', '**/app-speech/**']) {
    await page.route(pattern, r => { speech.push(new URL(r.request().url()).pathname); return r.fulfill({ status: 204 }) })
  }
  await page.goto('/')
  await expect(page.getByText('Obstacle alerts run on this phone', { exact: false })).toBeVisible({ timeout: 30_000 })
  await page.getByLabel('I agree to send photos continuously during the walk.').check()
  await page.getByRole('button', { name: 'Start this walk' }).click()
  await expect(page.getByRole('heading', { name: 'Find your starting point.' })).toBeVisible()

  await expect(page.locator('.alert-banner.obstacle')).toHaveText('!Be careful. Someone is in front of you.', { timeout: 15_000 })
  await expect.poll(() => speech.filter(p => p === '/app-speech/obstacle-person.mp3').length).toBe(1)
  await expect(page.getByText('Warning ended.', { exact: true })).toBeVisible({ timeout: 15_000 }) // Never "path clear".
  await expect(page.locator('.alert-banner')).toHaveCount(0)
  expect(speech.filter(p => p === '/app-speech/obstacle-person.mp3').length).toBe(1)
})
