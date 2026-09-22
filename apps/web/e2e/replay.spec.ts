import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'
import type { Assets, ObserveResult, Route } from '../src/types'

const route: Route = JSON.parse(readFileSync('../../data/examples/lift-lobby-to-toilet-v2/route.json', 'utf8'))
// Mock phrases are labelled by key so each assertion names the sentence it expects.
const phrase = (key: string) => `Say ${key}.`
const keys = ['origin-instruction', 'origin-found', 'origin-retry', 'arrival', 'arrival-unverified', 'vision-down',
  'vision-down-origin', 'vision-back']
for (const p of ['origin', 's0', 's1']) {
  for (const kind of ['candidate', 'matched']) for (const pos of ['left', 'ahead', 'right']) for (const d of ['far', 'near']) keys.push(`${p}-hint-${kind}-${pos}-${d}`)
}
keys.push('s0-instruction', 's0-reached', 's0-lost', 's0-where', 's0-override', 's1-instruction', 's1-lost', 's1-where', 's1-override')
const assets: Assets = {
  origin_label: 'Lift lobby', sample: true,
  steps: [{ short_name: 'office sign', expected_seconds: 8 }, { short_name: 'toilet entrance', expected_seconds: 10 }],
  phrases: Object.fromEntries(keys.map(k => [k, phrase(k)])),
}

type Reply = ObserveResult['target'] | 'error' | 'hang' | Omit<ObserveResult, 'step_index'>
type Body = { route_id: string; step_index: number; image_jpeg_640: string }

async function setup(page: Page, script: (body: Body, n: number) => Reply, options: { clock?: boolean } = {}) {
  const requests: (Body & { at: number })[] = []
  const hanging: (() => void)[] = []
  await page.addInitScript(() => {
    // Test-only synthetic camera; the production capture path still encodes each frame.
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540
      const ctx = canvas.getContext('2d')!
      const paint = () => { ctx.fillStyle = '#ece7d4'; ctx.fillRect(0, 0, 960, 540); ctx.fillStyle = '#143e31'; ctx.font = '160px sans-serif'; ctx.fillText('3', 420, 320); requestAnimationFrame(paint) }
      paint()
      return canvas.captureStream(10)
    } } })
  })
  if (options.clock) await page.clock.install()
  await page.route('**/routes', r => r.fulfill({ json: [route] }))
  await page.route('**/health', r => r.fulfill({ json: { provider_label: 'Mock visual provider' } }))
  await page.route('**/routes/*/assets', r => r.fulfill({ json: assets }))
  await page.route('**/speech/**', r => r.fulfill({ status: 204 }))
  await page.route('**/observe', async r => {
    const body = r.request().postDataJSON() as Body
    requests.push({ ...body, at: Date.now() })
    const reply = script(body, requests.filter(q => q.step_index === body.step_index).length)
    if (reply === 'hang') await new Promise<void>(resolve => hanging.push(resolve))
    if (reply === 'error') return r.fulfill({ status: 503, json: { detail: 'Visual check unavailable' } }).catch(() => {})
    const result = typeof reply === 'string'
      ? { target: reply, position: reply === 'none' ? null : 'left', distance: reply === 'none' ? null : 'far' }
      : reply
    await r.fulfill({ json: { step_index: body.step_index, ...(reply === 'hang' ? { target: 'matched', position: 'ahead', distance: 'near' } : result) } }).catch(() => {})
  })
  await page.goto('/')
  await expect(page.getByText('Illustrative sample route.', { exact: false })).toBeVisible()
  await page.getByLabel('App voice', { exact: true }).uncheck()
  return { requests, release: () => hanging.splice(0).forEach(resolve => resolve()) }
}

async function start(page: Page) {
  // Playwright's Windows WebKit build has no MediaStream, so no synthetic camera can exist there.
  // Camera journeys still run on Chromium and on macOS/Linux WebKit; never fake the capture path.
  const camera = await page.evaluate(() => typeof MediaStream === 'function'
    && typeof HTMLCanvasElement.prototype.captureStream === 'function')
  test.skip(!camera, 'Browser build lacks MediaStream/canvas.captureStream; run camera journeys on Chromium or macOS/Linux WebKit')
  await page.getByLabel('I agree to send photos continuously during the walk.').check()
  await page.getByRole('button', { name: 'Start this walk' }).press('Enter')
}

const heading = (page: Page, name: string) => expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
const said = (page: Page, key: string) => expect(page.locator('.status-copy .instruction')).toHaveText(phrase(key))
const next = (page: Page) => page.getByRole('button', { name: 'Next', exact: true })

async function noSevereAxe(page: Page, phase: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${phase}: ${v.id}`)).toEqual([])
}

async function quietWhileWaiting(page: Page, requests: unknown[]) {
  const before = requests.length
  await page.waitForTimeout(2500)
  expect(requests.length, 'no /observe while waiting for Next').toBe(before)
}

test('whole route: origin, Next, hint, reached, Next, arrival; keyboard, focus and axe', async ({ page }) => {
  // Candidates first, so the walking state lasts long enough to inspect before the 2-of-3 match.
  const { requests } = await setup(page, (body, n) => body.step_index >= 0 && n <= (body.step_index === 0 ? 4 : 1) ? 'candidate' : 'matched')
  await noSevereAxe(page, 'idle')
  await start(page)
  await heading(page, 'Find your starting point.')
  await said(page, 'origin-instruction')
  await noSevereAxe(page, 'origin')

  await heading(page, 'Starting point found.')
  await said(page, 'origin-found')
  await expect(next(page)).toBeFocused()
  await expect(next(page)).toHaveCSS('min-height', '88px')
  await noSevereAxe(page, 'atOrigin')
  await quietWhileWaiting(page, requests)
  await page.keyboard.press('Enter')

  await heading(page, 'Checkpoint 1 of 2')
  await said(page, 's0-instruction')
  await expect(page.locator('.camera-hint')).toHaveText(phrase('s0-hint-candidate-left-far'))
  await expect(next(page)).toHaveCount(0)
  await noSevereAxe(page, 'walking')
  await page.getByText('Voice and typed commands', { exact: true }).click()
  await page.getByLabel('Type a command').fill('Where am I?')
  await page.getByRole('button', { name: 'Send command' }).click()
  await said(page, 's0-where')
  await expect(page.getByText(`Direction: ${phrase('s0-instruction')}`, { exact: true })).toBeVisible()

  await heading(page, 'Checkpoint 1 of 2 reached.')
  await said(page, 's0-reached')
  await expect(next(page)).toBeFocused()
  await expect(page.locator('.camera-hint')).toHaveText('')
  await noSevereAxe(page, 'reached')
  await quietWhileWaiting(page, requests)
  await page.getByLabel('Type a command').fill('next')
  await page.getByRole('button', { name: 'Send command' }).click()
  await heading(page, 'Checkpoint 2 of 2')

  await heading(page, 'You have arrived.')
  await said(page, 'arrival')
  await noSevereAxe(page, 'arrived')
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).srcObject)).toBeNull()
  await quietWhileWaiting(page, requests)

  const steps = requests.map(r => r.step_index)
  expect(steps).toEqual([...steps].sort((a, b) => a - b)) // Never an old step after a newer one.
  expect(new Set(steps)).toEqual(new Set([-1, 0, 1]))
  const dimensions = await page.evaluate(async jpeg => {
    const im = new Image(); im.src = `data:image/jpeg;base64,${jpeg}`; await im.decode()
    return [im.width, im.height]
  }, requests[0].image_jpeg_640)
  expect(dimensions).toEqual([640, 360])
})

test('lost after the step budget, override No then Yes, recorded as a manual override', async ({ page }) => {
  await setup(page, (body, n) => body.step_index === 0 ? 'none' : body.step_index === 1 && n === 1 ? 'candidate' : 'matched', { clock: true })
  await start(page)
  await heading(page, 'Starting point found.')
  await next(page).press('Enter')
  await heading(page, 'Checkpoint 1 of 2')
  await page.clock.fastForward('00:31') // Budget: max(3 × 8 s, 30 s) after the instruction.
  await heading(page, 'Let’s find your place.')
  await said(page, 's0-lost')
  await expect(next(page)).toBeFocused()
  await noSevereAxe(page, 'lost')

  await page.keyboard.press('Enter')
  await heading(page, 'Continue without the camera?')
  await said(page, 's0-override')
  await expect(page.getByRole('button', { name: 'Yes, use saved directions' })).toBeFocused()
  await noSevereAxe(page, 'override')
  await page.getByRole('button', { name: 'No, keep looking' }).click()
  await heading(page, 'Let’s find your place.')

  await next(page).click()
  await page.getByRole('button', { name: 'Yes, use saved directions' }).press('Enter')
  await heading(page, 'Checkpoint 2 of 2')
  await heading(page, 'You have arrived.')

  await page.getByText('Session record', { exact: true }).click()
  await expect(page.getByText('1 manual overrides.', { exact: false })).toBeVisible()
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Download session metrics' }).click()])
  const session = JSON.parse(readFileSync(await download.path(), 'utf8'))
  expect(session.kind).toBe('offixed-replay-session'); expect(session.version).toBe(2)
  const events = session.events as { event: string; step: number; verified?: boolean; sample?: boolean; frames_sent?: number }[]
  expect(events.filter(e => e.event !== 'step_summary').map(e => `${e.event}:${e.step}`)).toEqual([
    'start:-1', 'origin_found:-1', 'next:-1', 'lost:0', 'next:0', 'next:0', 'manual_override:0', 'reached:1', 'arrival:1'])
  expect(events.find(e => e.event === 'arrival')?.verified).toBe(true)
  const summaries = events.filter(e => e.event === 'step_summary')
  expect(summaries.map(e => e.step)).toEqual([-1, 0, 1])
  expect(summaries.every(e => e.sample === true && (e.frames_sent ?? 0) > 0)).toBe(true)
  expect(JSON.stringify(session)).not.toMatch(/base64|image_jpeg/)
})

test('vision down after 3 errors offers Next, then recovers', async ({ page }) => {
  // Errors at 0, 1, 2 s (down), 5 s (3 s back-off), then success at 10 s (5 s back-off).
  await setup(page, (body, n) => body.step_index === 0 && n <= 4 ? 'error' : body.step_index === 0 ? 'none' : 'matched')
  await start(page)
  await heading(page, 'Starting point found.')
  await next(page).click()
  await heading(page, 'Checkpoint 1 of 2')
  await said(page, 'vision-down')
  await expect(page.getByText('Camera check is unavailable. Next continues with saved directions.', { exact: true })).toBeVisible()
  await expect(next(page)).toBeVisible()
  await noSevereAxe(page, 'vision down')
  await said(page, 'vision-back')
  await expect(next(page)).toHaveCount(0)
  await expect(page.getByText('Camera check is unavailable.', { exact: false })).toHaveCount(0)
})

test('no override at the starting point, even when vision is down', async ({ page }) => {
  await setup(page, () => 'error')
  await start(page)
  await said(page, 'vision-down-origin')
  await expect(next(page)).toHaveCount(0)
  await page.getByText('Voice and typed commands', { exact: true }).click()
  await page.getByLabel('Type a command').fill('next')
  await page.getByRole('button', { name: 'Send command' }).click()
  await expect(page.getByText('“next” is not available right now.', { exact: true })).toBeVisible()
  await heading(page, 'Find your starting point.')
})

test('Stop during a request drops the late result', async ({ page }) => {
  const { release } = await setup(page, () => 'hang')
  await start(page)
  await heading(page, 'Find your starting point.')
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: 'Stop route' }).click()
  await heading(page, 'A familiar route starts here.')
  release()
  await page.waitForTimeout(1000)
  await heading(page, 'A familiar route starts here.')
  await expect(page.getByRole('heading', { name: 'Starting point found.' })).toHaveCount(0)
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).srcObject)).toBeNull()
})

test('background and reload require the starting point again', async ({ page }) => {
  await setup(page, () => 'matched')
  await start(page)
  await heading(page, 'Starting point found.')
  await next(page).click()
  await heading(page, 'Checkpoint 1 of 2')
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.getByText('The app was paused.', { exact: false })).toBeVisible()
  await heading(page, 'A familiar route starts here.')
  await page.reload()
  await expect(page.getByRole('button', { name: 'Start this walk' })).toBeVisible()
  await expect(next(page)).toHaveCount(0)
})
