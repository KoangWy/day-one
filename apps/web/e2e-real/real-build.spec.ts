import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Assets, Route } from '../src/types'

// Only /replay is mocked (no VLM key needed); routes, assets, audio, face model and build are real.
const ROUTE_ID = process.env.DEMO_ROUTE_ID ?? 'lift-lobby-to-toilet-v1'

async function load(page: Page) {
  const routes: Route[] = await (await page.request.get('/routes')).json()
  const route = routes.find(r => r.route_id === ROUTE_ID)
  expect(route, `Publish ${ROUTE_ID} with navigation.prepare first`).toBeTruthy()
  const assets: Assets = await (await page.request.get(`/routes/${ROUTE_ID}/assets`)).json()
  return { route: route!, assets }
}

async function noSevereAxe(page: Page, phase: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  const severe = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
  expect(severe.map(v => `${phase}: ${v.id}`)).toEqual([])
}

test('published route, metadata and every prebuilt MP3 are served by the real server', async ({ page }) => {
  const { route, assets } = await load(page)
  expect(route.steps.length).toBe(assets.steps.length)
  expect(assets.sample).toBe(false)
  const health = await (await page.request.get('/health')).json()
  expect(health.status).toBe('ok')
  const urls = new Set([assets.origin_audio, assets.origin_retry_audio, assets.arrival_audio, assets.override_audio,
    ...assets.steps.flatMap(s => [s.instruction, s.question]), ...Object.values(assets.fallback_audio)])
  expect(urls.size).toBe(3 + 2 * route.steps.length + route.steps.length + 2)
  for (const url of urls) {
    const response = await page.request.get(url)
    expect(response.status(), url).toBe(200)
    expect(response.headers()['content-type']).toBe('audio/mpeg')
    expect((await response.body()).length, url).toBeGreaterThan(10_000)
  }
  // Service worker precaches the app shell only: never audio, API responses or the local face model.
  const sw = await (await page.request.get('/sw.js')).text()
  expect(sw).not.toMatch(/\/audio\/|privacy\/|\/routes/)
})

test('real build: origin, every checkpoint, fallback override, arrival, with axe at each phase', async ({ page }) => {
  const { route, assets } = await load(page)
  await page.addInitScript(() => {
    if (typeof MediaStream !== 'function' || typeof HTMLCanvasElement.prototype.captureStream !== 'function') return
    // Test-only synthetic rear camera; face redaction still runs the real local MediaPipe model.
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540
      const ctx = canvas.getContext('2d')!
      const paint = () => { ctx.fillStyle = '#f4f4f0'; ctx.fillRect(0, 0, 960, 540); ctx.fillStyle = '#222'; ctx.font = '200px sans-serif'; ctx.fillText('3', 420, 330); requestAnimationFrame(paint) }
      paint()
      return canvas.captureStream(10)
    } } })
  })
  // Origin 3 matches; checkpoint 1 matches; last checkpoint misses twice to exercise the manual override.
  const outcomes = [true, true, true, true, false, false]
  const requests: { step_index: number; image_jpeg_640: string }[] = []
  await page.route('**/replay', async r => {
    requests.push(r.request().postDataJSON())
    await r.fulfill({ json: { matched: outcomes.shift() ?? false, instruction: 'MOCK VLM TEXT MUST NEVER APPEAR',
      checkpoint_question: 'MOCK VLM QUESTION', audio_url: '/audio/mock.mp3' } })
  })
  const audio: string[] = []
  page.on('response', r => { if (r.url().includes('/audio/') && r.ok()) audio.push(new URL(r.url()).pathname) })

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'A familiar route starts here.' })).toBeVisible()
  await expect(page.getByText('Illustrative sample route.', { exact: false })).toHaveCount(0)
  await expect(page.getByText(`${route.steps.length} checkpoints`, { exact: false })).toBeVisible()
  await noSevereAxe(page, 'idle')

  const camera = await page.evaluate(() => typeof MediaStream === 'function'
    && typeof HTMLCanvasElement.prototype.captureStream === 'function')
  test.skip(!camera, 'Browser build lacks MediaStream/canvas.captureStream; run on Chromium or macOS/Linux WebKit')

  await page.getByLabel('I agree to send these photos').check()
  await page.getByRole('button', { name: 'Start this walk' }).press('Enter')
  await expect(page.getByText(assets.origin_instruction, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Check starting point' }).press('Enter')
  await expect(page.getByText(assets.origin.question, { exact: true })).toBeVisible()
  await noSevereAxe(page, 'confirm origin')
  await page.getByRole('button', { name: 'Yes, I’m here' }).press('Enter')

  const last = route.steps.length - 1
  for (let i = 0; i < last; i++) {
    await expect(page.getByRole('heading', { name: `Checkpoint ${i + 1} of ${route.steps.length}` })).toBeVisible()
    await expect(page.getByText(route.steps[i].instruction, { exact: true })).toBeVisible()
    if (i === 0) await noSevereAxe(page, 'walking')
    await page.getByRole('button', { name: 'Check checkpoint', exact: true }).press('Enter')
    await expect(page.getByText(assets.checkpoint_questions[i], { exact: true })).toBeVisible()
    await noSevereAxe(page, `confirm checkpoint ${i + 1}`)
    await page.getByRole('button', { name: 'Yes, I’m here' }).press('Enter')
  }

  await expect(page.getByText(route.steps[last].instruction, { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Check checkpoint', exact: true }).press('Enter')
  await expect(page.getByText('The checkpoint did not match.', { exact: false })).toBeVisible()
  await page.getByRole('button', { name: 'Check checkpoint', exact: true }).press('Enter')
  await expect(page.getByText(`Last confirmed: ${route.steps[last - 1].landmark}.`, { exact: false })).toBeVisible()
  await noSevereAxe(page, 'fallback')
  await page.getByRole('button', { name: 'Next · use saved directions' }).press('Enter')
  await expect(page.getByText('Continue using saved directions without visual verification?', { exact: true })).toBeVisible()
  await noSevereAxe(page, 'override')
  await page.getByRole('button', { name: 'Yes, use saved directions' }).press('Enter')

  await expect(page.getByRole('heading', { name: 'Saved route finished.' })).toBeVisible()
  await expect(page.getByText('Arrival has not been visually verified.', { exact: false })).toBeVisible()
  await noSevereAxe(page, 'arrived')
  await expect(page.getByText('MOCK VLM', { exact: false })).toHaveCount(0)
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).srcObject)).toBeNull()
  expect(requests.map(r => r.step_index)).toEqual([-1, -1, -1, 0, last, last])
  for (const r of requests) {
    const size = await page.evaluate(async jpeg => {
      const im = new Image(); im.src = `data:image/jpeg;base64,${jpeg}`; await im.decode()
      return Math.max(im.width, im.height)
    }, r.image_jpeg_640)
    expect(size).toBeLessThanOrEqual(640)
  }
  // Voice guidance comes only from the reviewed, prebuilt MP3s (fast phase changes may cancel some fetches).
  const reviewed = new Set([assets.origin_audio, assets.origin_retry_audio, assets.override_audio,
    ...assets.steps.flatMap(s => [s.instruction, s.question]), ...Object.values(assets.fallback_audio)])
  expect(audio.length).toBeGreaterThan(0)
  expect(audio.filter(url => !reviewed.has(url))).toEqual([])
})
