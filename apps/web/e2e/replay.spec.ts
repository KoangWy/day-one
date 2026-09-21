import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'
import type { Route, Assets } from '../src/types'

const route: Route = JSON.parse(readFileSync('../../data/examples/office-to-toilet-sample/route.json', 'utf8'))
const review = JSON.parse(readFileSync('../../data/examples/office-to-toilet-sample/review.json', 'utf8'))
const audio = '/audio/mock-test.mp3'
const assets: Assets = {
  origin_label: 'Office entrance', origin_instruction: 'Point the camera at the OFFICE sign.', origin_retry: 'I only know this saved route. Check the starting point again.',
  origin: review.origin, origin_audio: audio, origin_retry_audio: audio,
  steps: route.steps.map(() => ({ instruction: audio, question: audio })),
  checkpoint_questions: review.checkpoints.map((c: { question: string }) => c.question),
  arrival: review.arrival, arrival_audio: audio,
  fallback_audio: { '-1': audio, '0': audio, '1': audio, '2': audio, '3': audio },
  override_audio: audio, sample: true,
}

type RequestInfo = { step_index: number; image_jpeg_640: string }
async function setup(page: Page, outcomes: (boolean | 'error')[] = []) {
  const requests: RequestInfo[] = []
  await page.addInitScript(() => {
    // Test-only synthetic camera. The production redaction model still runs locally.
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540
      const ctx = canvas.getContext('2d')!
      const paint = () => { ctx.fillStyle = '#ece7d4'; ctx.fillRect(0, 0, 960, 540); ctx.fillStyle = '#143e31'; ctx.font = '80px sans-serif'; ctx.fillText('OFFICE', 100, 250); requestAnimationFrame(paint) }
      paint()
      return canvas.captureStream(10)
    } } })
  })
  await page.route('**/routes', r => r.fulfill({ json: [route] }))
  await page.route('**/health', r => r.fulfill({ json: { provider_label: 'Mock visual provider' } }))
  await page.route('**/routes/*/assets', r => r.fulfill({ json: assets }))
  await page.route('**/audio/*', r => r.fulfill({ status: 204 }))
  await page.route('**/replay', async r => {
    const body = r.request().postDataJSON() as RequestInfo
    requests.push(body)
    const outcome = outcomes.shift() ?? true
    if (outcome === 'error') return r.fulfill({ status: 503, json: { detail: 'provider unavailable' } })
    await r.fulfill({ json: { matched: outcome, instruction: 'UNTRUSTED AI DIRECTIONS MUST NEVER APPEAR',
      checkpoint_question: 'UNTRUSTED AI QUESTION', audio_url: '/audio/untrusted.mp3' } })
  })
  await page.goto('/')
  await expect(page.getByText('Illustrative sample route.', { exact: false })).toBeVisible()
  await page.getByLabel('App voice', { exact: true }).uncheck()
  return requests
}

async function start(page: Page) {
  await page.getByLabel('I agree to send these photos').check()
  await page.getByRole('button', { name: 'Start this walk' }).click()
  await expect(page.getByRole('button', { name: 'Check starting point' })).toBeVisible()
}

async function origin(page: Page) {
  await start(page)
  await page.getByRole('button', { name: 'Check starting point' }).click()
  await expect(page.getByRole('button', { name: 'Yes, I’m here' })).toBeVisible()
  await page.getByRole('button', { name: 'Yes, I’m here' }).press('Enter')
  await expect(page.getByRole('heading', { name: 'Checkpoint 1 of 4' })).toBeVisible()
}

async function noSevereAxe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([])
}

test('mock API journey: local face model, keyboard confirmations, arrival and axe', async ({ page }) => {
  const requests = await setup(page)
  await noSevereAxe(page)
  await origin(page)
  expect(requests.map(r => r.step_index)).toEqual([-1, -1, -1])
  for (let i = 0; i < 4; i++) {
    await expect(page.getByText(route.steps[i].instruction, { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Check checkpoint', exact: true }).press('Enter')
    await expect(page.getByText(assets.checkpoint_questions[i], { exact: true })).toBeVisible()
    if (i === 0) await noSevereAxe(page)
    await page.getByRole('button', { name: 'Yes, I’m here' }).press('Enter')
  }
  await expect(page.getByRole('heading', { name: 'You have arrived.' })).toBeVisible()
  await expect(page.getByText('UNTRUSTED AI', { exact: false })).toHaveCount(0)
  expect(await page.locator('video').evaluate(v => (v as HTMLVideoElement).srcObject)).toBeNull()
  expect(requests).toHaveLength(7)
  const dimensions = await page.evaluate(async jpeg => {
    const im = new Image(); im.src = `data:image/jpeg;base64,${jpeg}`; await im.decode()
    return [im.width, im.height]
  }, requests[0].image_jpeg_640)
  expect(dimensions).toEqual([640, 360])
})

test('one matching origin frame and origin No both prevent directions or Next', async ({ page }) => {
  await setup(page, [true, false, false, true, true, true])
  await start(page)
  await page.getByRole('button', { name: 'Check starting point' }).click()
  await expect(page.getByText('I only know this saved route.', { exact: false })).toBeVisible()
  await expect(page.getByText(route.steps[0].instruction, { exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Next', exact: false })).toHaveCount(0)
  await page.getByRole('button', { name: 'Check starting point' }).click()
  await page.getByRole('button', { name: 'No / unsure' }).click()
  await expect(page.getByText(route.steps[0].instruction, { exact: true })).toHaveCount(0)
})

test('two misses, Repeat without requests, explicit override and typed commands', async ({ page }) => {
  const requests = await setup(page, [true, true, true, false, false])
  await origin(page)
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Check checkpoint', exact: true }).click()
    await expect(page.getByText('The checkpoint did not match.', { exact: false })).toBeVisible()
  }
  await expect(page.getByText('Last confirmed: OFFICE', { exact: false })).toBeVisible()
  await noSevereAxe(page)
  await page.getByLabel('App voice', { exact: true }).check()
  await page.getByRole('button', { name: 'Repeat' }).click()
  expect(requests).toHaveLength(5)
  await page.getByRole('button', { name: 'Next · use saved directions' }).click()
  await expect(page.getByText('Continue using saved directions without visual verification?', { exact: true })).toBeVisible()
  await page.getByText('Voice and typed commands', { exact: true }).click()
  await page.getByLabel('Type a command').fill('yes')
  await page.getByRole('button', { name: 'Send command' }).click()
  await expect(page.getByRole('heading', { name: 'Checkpoint 2 of 4' })).toBeVisible()
  await page.getByLabel('Type a command').fill('yes')
  await page.getByRole('button', { name: 'Send command' }).click()
  await expect(page.getByRole('heading', { name: 'Checkpoint 2 of 4' })).toBeVisible()
})

test('provider outage allows fallback only after origin; reset ignores late results', async ({ page }) => {
  await setup(page, ['error', true, true, true])
  await start(page)
  await page.getByRole('button', { name: 'Check starting point' }).click()
  await expect(page.getByText('Visual check is unavailable.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next', exact: false })).toHaveCount(0)
  await page.getByRole('button', { name: 'Check starting point' }).click()
  await page.getByRole('button', { name: 'Yes, I’m here' }).click()
  let release: () => void = () => {}
  const pending = new Promise<void>(resolve => { release = resolve })
  await page.route('**/replay', async r => { await pending; await r.fulfill({ json: { matched: true } }).catch(() => {}) })
  await page.getByRole('button', { name: 'Check checkpoint', exact: true }).click()
  await page.getByRole('button', { name: 'Stop route' }).click()
  release()
  await expect(page.getByRole('button', { name: 'Start this walk' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Yes, I’m here' })).toHaveCount(0)
})

test('background and reload require origin again', async ({ page }) => {
  await setup(page)
  await origin(page)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.getByText('The app was paused.', { exact: false })).toBeVisible()
  await expect(page.getByText(route.steps[0].instruction, { exact: true })).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Start this walk' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Check checkpoint', exact: true })).toHaveCount(0)
})

test('failed face model blocks all replay uploads', async ({ page }) => {
  const requests = await setup(page)
  await page.route('**/privacy/**', r => r.abort())
  await page.getByLabel('I agree to send these photos').check()
  await page.getByRole('button', { name: 'Start this walk' }).click()
  await expect(page.getByText('Face protection could not load.', { exact: false })).toBeVisible()
  expect(requests).toHaveLength(0)
})

test('face redaction changes face pixels before JPEG encoding', async ({ page }) => {
  await setup(page)
  const changed = await page.evaluate(async () => {
    const modulePath = '/src/privacy.ts'
    const { redactFaces } = await import(modulePath)
    const c = document.createElement('canvas'); c.width = c.height = 100
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 100, 100)
    ctx.fillStyle = '#000000'; ctx.fillRect(40, 40, 10, 10)
    const before = [...ctx.getImageData(35, 35, 1, 1).data]
    redactFaces(c, [{ originX: 35, originY: 35, width: 20, height: 20 }])
    const after = [...ctx.getImageData(35, 35, 1, 1).data]
    return { before, after, outside: [...ctx.getImageData(0, 0, 1, 1).data] }
  })
  expect(changed.after).not.toEqual(changed.before)
  expect(changed.outside).toEqual([255, 255, 255, 255])
})
