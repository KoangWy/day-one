import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Assets, Route } from '../src/types'

// Only /observe is mocked (no VLM key needed); routes, phrases, /speech MP3s and the build are real.
const ROUTE_ID = process.env.DEMO_ROUTE_ID ?? 'lift-lobby-to-toilet-v2'

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

test('published route, v2 metadata and one prebuilt MP3 per phrase served by /speech', async ({ page }) => {
  const { route, assets } = await load(page)
  expect(assets.steps.length).toBe(route.steps.length)
  expect(assets.sample).toBe(false)
  expect(assets.steps.every(s => s.short_name && s.expected_seconds > 0)).toBe(true)
  const keys = Object.keys(assets.phrases)
  expect(keys.length).toBe(17 * route.steps.length + 19) // 53 for the 2-step demo route.
  const health = await (await page.request.get('/health')).json()
  expect(health.status).toBe('ok')
  for (const key of keys) {
    const response = await page.request.get(`/speech/${ROUTE_ID}/${key}.mp3`)
    expect(response.status(), key).toBe(200)
    expect(response.headers()['content-type']).toBe('audio/mpeg')
    expect((await response.body()).length, key).toBeGreaterThan(5_000)
  }
  expect((await page.request.get(`/speech/${ROUTE_ID}/not-a-phrase.mp3`)).status()).toBe(404)
  expect((await page.request.get(`/audio/${ROUTE_ID}_origin.mp3`)).status()).not.toBe(200)
  // Service worker precaches the app shell only: never speech, photos or API responses.
  const sw = await (await page.request.get('/sw.js')).text()
  expect(sw).not.toMatch(/\/speech\/|\/routes|\/observe/)
})

test('real build: origin, hint, reached, Next, lost, override, unverified arrival; axe at each phase', async ({ page, browserName }) => {
  const { route, assets } = await load(page)
  const last = route.steps.length - 1
  await page.addInitScript(() => {
    if (typeof MediaStream !== 'function' || typeof HTMLCanvasElement.prototype.captureStream !== 'function') return
    // Test-only synthetic rear camera; the real capture path encodes each frame.
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540
      const ctx = canvas.getContext('2d')!
      const paint = () => { ctx.fillStyle = '#f4f4f0'; ctx.fillRect(0, 0, 960, 540); ctx.fillStyle = '#222'; ctx.font = '200px sans-serif'; ctx.fillText('3', 420, 330); requestAnimationFrame(paint) }
      paint()
      return canvas.captureStream(10)
    } } })
  })
  await page.clock.install()
  // Origin and early steps: a candidate first (spoken hint), then matches. The last step never
  // matches, so the walk exercises lost → override → unverified arrival.
  const counts = new Map<number, number>()
  const requests: { step_index: number; image_jpeg_640: string }[] = []
  await page.route('**/observe', async r => {
    const body = r.request().postDataJSON()
    requests.push(body)
    const n = (counts.get(body.step_index) ?? 0) + 1
    counts.set(body.step_index, n)
    const target = body.step_index === last ? 'none' : n === 1 ? 'candidate' : 'matched'
    await r.fulfill({ json: { step_index: body.step_index, target, position: target === 'none' ? null : 'ahead',
      distance: target === 'none' ? null : 'far' } }).catch(() => {})
  })
  const audio: string[] = []
  page.on('response', r => {
    if (!r.url().includes('/speech/')) return
    expect([200, 206], r.url()).toContain(r.status()) // <audio> may ask for byte ranges.
    audio.push(new URL(r.url()).pathname)
  })
  const heading = (name: string) => expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  const said = (key: string) => expect(page.locator('.status-copy .instruction')).toHaveText(assets.phrases[key])
  const next = page.getByRole('button', { name: 'Next', exact: true })

  await page.goto(`/?route=${ROUTE_ID}`) // Several routes are published; walk this one.
  await heading('A familiar route starts here.')
  await expect(page.getByText('Illustrative sample route.', { exact: false })).toHaveCount(0)
  await expect(page.locator('.route-card').getByText(`${route.steps.length} checkpoints`, { exact: false })).toBeVisible()
  await expect(page.getByText('sends about one photo every 1–3 seconds', { exact: false })).toBeVisible()
  await noSevereAxe(page, 'idle')

  const camera = await page.evaluate(() => typeof MediaStream === 'function'
    && typeof HTMLCanvasElement.prototype.captureStream === 'function')
  test.skip(!camera, 'Browser build lacks MediaStream/canvas.captureStream; run on Chromium or macOS/Linux WebKit')

  await page.getByLabel('I agree to send photos continuously during the walk.').check()
  await page.getByRole('button', { name: 'Start this walk' }).press('Enter')
  await heading('Find your starting point.')
  await said('origin-instruction')
  await noSevereAxe(page, 'origin')
  await heading('Starting point found.')
  await said('origin-found')
  await expect(next).toBeFocused()
  await noSevereAxe(page, 'atOrigin')
  await page.keyboard.press('Enter')

  for (let i = 0; i < last; i++) {
    await heading(`Checkpoint ${i + 1} of ${route.steps.length}`)
    await said(`s${i}-instruction`)
    if (i === 0) await noSevereAxe(page, 'walking')
    await heading(`Checkpoint ${i + 1} of ${route.steps.length} reached.`)
    await said(`s${i}-reached`)
    await expect(next).toBeFocused()
    await noSevereAxe(page, `reached ${i + 1}`)
    await page.keyboard.press('Enter')
  }

  await heading(`Checkpoint ${last + 1} of ${route.steps.length}`)
  await said(`s${last}-instruction`)
  // App voice off hands pending speech to text at once, so the step clock starts now.
  await page.getByLabel('App voice', { exact: true }).uncheck()
  await page.clock.fastForward(Math.max(3 * assets.steps[last].expected_seconds, 30) * 1000 + 1000)
  await heading('Let’s find your place.')
  await said(`s${last}-lost`)
  await noSevereAxe(page, 'lost')
  await next.press('Enter')
  await heading('Continue without the camera?')
  await said(`s${last}-override`)
  await noSevereAxe(page, 'override')
  await page.getByRole('button', { name: 'Yes, use saved directions' }).press('Enter')

  await heading('Saved route finished.')
  await said('arrival-unverified')
  await noSevereAxe(page, 'arrived')
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).srcObject)).toBeNull()
  expect(new Set(requests.map(r => r.step_index))).toEqual(new Set([-1, ...route.steps.map((_, i) => i)]))
  for (const r of requests.slice(0, 3)) {
    const size = await page.evaluate(async jpeg => {
      const im = new Image(); im.src = `data:image/jpeg;base64,${jpeg}`; await im.decode()
      return Math.max(im.width, im.height)
    }, r.image_jpeg_640)
    expect(size).toBeLessThanOrEqual(640)
  }
  // Voice guidance comes only from reviewed phrases of this route.
  expect(audio.length).toBeGreaterThan(0)
  expect(audio.filter(path => !Object.keys(assets.phrases).some(key => path === `/speech/${ROUTE_ID}/${key}.mp3`))).toEqual([])
  expect(audio).toContain(`/speech/${ROUTE_ID}/origin-instruction.mp3`)
  if (browserName === 'chromium') await expect(page.getByText('Audio is paused or unavailable.', { exact: false })).toHaveCount(0)
})

test('real server: route catalog, built-in app speech, on-device obstacle model, guide access', async ({ page }) => {
  const catalog = await (await page.request.get('/catalog')).json()
  const entry = catalog.find((r: { route_id: string }) => r.route_id === ROUTE_ID)
  expect(entry).toMatchObject({ origin_label: 'Lift lobby', origin_place: 'lift-lobby', sample: false })
  expect(entry.destination_label.length).toBeGreaterThan(0)

  const phrases = await (await page.request.get('/app-phrases')).json()
  expect(phrases['obstacle-person']).toBe('Be careful. Someone is in front of you.')
  for (const key of ['obstacle-person', 'setup-1', 'teach-learned']) {
    const response = await page.request.get(`/app-speech/${key}.mp3`)
    expect(response.status(), key).toBe(200)
    expect(response.headers()['content-type']).toBe('audio/mpeg')
    expect((await response.body()).length, key).toBeGreaterThan(5_000)
  }
  expect((await page.request.get('/app-speech/not-a-phrase.mp3')).status()).toBe(404)

  // The detector runs on the phone: model and runtime come from this server, cacheable, never precached.
  const model = await page.request.get('/models/efficientdet_lite0.tflite')
  expect(model.status()).toBe(200)
  expect((await model.body()).length).toBeGreaterThan(1_000_000)
  expect(model.headers()['cache-control']).toBe('public, max-age=86400')
  const wasm = await page.request.head('/mediapipe/wasm/vision_wasm_internal.wasm')
  expect(wasm.status()).toBe(200)
  expect(wasm.headers()['content-type']).toBe('application/wasm')
  const sw = await (await page.request.get('/sw.js')).text()
  const precache = sw.slice(sw.indexOf('precacheAndRoute('), sw.indexOf('cleanupOutdatedCaches'))
  expect(precache).toContain('index.html')
  expect(precache).not.toMatch(/tflite|vision_wasm|\.mp3|app-speech|guide/)

  // The test runs on the laptop itself, so the guide API is open; the API keeps no-store.
  const access = await page.request.get('/guide/access')
  expect(await access.json()).toMatchObject({ allowed: true })
  expect(access.headers()['cache-control']).toBe('no-store')
  expect(Array.isArray(await (await page.request.get('/guide/drafts')).json())).toBe(true)
})
