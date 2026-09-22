import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

type Cue = { id: string; text: string; at?: number; anchor?: string; offset?: number }
type Timeline = {
  scenes: Record<string, {
    media: string, leadSeconds?: number, loadingSeconds?: number, tailSeconds?: number,
    clipSeconds?: number, captions: Cue[], tts: Cue[],
  }>
  sources: Record<string, { durationSeconds: number }>
}

const timeline: Timeline = JSON.parse(readFileSync('src/demo/timeline.json', 'utf8'))
const mediaDir = join(process.cwd(), 'public/demo-media')
const shotsDir = join(process.cwd(), '../../data/runtime/final-video/screenshots')
const SCENES = ['teach', 'route', 'collision'] as const
const hasMedia = SCENES.every(id => existsSync(join(mediaDir, timeline.scenes[id].media)))
const HEADINGS = { teach: 'Learn a route', route: 'Elevator to restroom', collision: 'Obstacle awareness' } as const
const START = { teach: 'Record', route: 'Start guidance', collision: 'Start guidance' } as const
const PHONE_VIEWPORTS = [{ width: 393, height: 852 }, { width: 375, height: 667 }] as const

function sceneDuration(id: (typeof SCENES)[number]): number {
  const scene = timeline.scenes[id]
  if (scene.leadSeconds !== undefined) {
    return scene.leadSeconds + timeline.sources[id].durationSeconds + (scene.loadingSeconds ?? 0) + (scene.tailSeconds ?? 0)
  }
  return scene.clipSeconds ?? timeline.sources[id].durationSeconds
}

function anchoredAt(scene: Timeline['scenes'][string], index: number): number {
  const source = timeline.sources.teach.durationSeconds
  const base = { lead: 0, loading: (scene.leadSeconds ?? 0) + source, learned: (scene.leadSeconds ?? 0) + source + (scene.loadingSeconds ?? 0) }
  const cue = scene.captions[index]
  return base[cue.anchor as 'lead' | 'loading' | 'learned'] + (cue.offset ?? 0)
}

const LIVE_PATHS = ['/routes', '/health', '/observe', '/speech', '/ingest-video']
const video = (page: Page) => page.getByTestId('demo-video')
const caption = (page: Page) => page.getByTestId('demo-caption')
const stage = (page: Page) => page.getByTestId('demo-stage')

async function watchForLiveTraffic(page: Page) {
  const offenders: string[] = []
  const media: { path: string; status: number }[] = []
  page.on('request', request => {
    const { pathname } = new URL(request.url())
    if (LIVE_PATHS.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))) offenders.push(pathname)
  })
  page.on('response', response => {
    const { pathname } = new URL(response.url())
    if (pathname.startsWith('/demo-media/')) media.push({ path: pathname, status: response.status() })
  })
  await page.addInitScript(() => {
    const scope = window as unknown as { __demoCameraCalls: number }
    scope.__demoCameraCalls = 0
    const devices = navigator.mediaDevices
    if (devices?.getUserMedia) {
      const original = devices.getUserMedia.bind(devices)
      Object.defineProperty(devices, 'getUserMedia', {
        configurable: true,
        value: (...args: Parameters<MediaDevices['getUserMedia']>) => {
          scope.__demoCameraCalls += 1
          return original(...args)
        },
      })
    }
  })
  return { offenders, media }
}

async function noSevereAxe(page: Page, where: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
    .map(v => `${where}: ${v.id} ${v.nodes.length}`)).toEqual([])
}

async function waitForMetadata(page: Page) {
  return video(page).evaluate(async element => {
    const player = element as HTMLVideoElement
    if (player.readyState >= 1) return player.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
    await new Promise<void>((resolve, reject) => {
      player.addEventListener('loadedmetadata', () => resolve(), { once: true })
      player.addEventListener('error', () => reject(new Error('media failed to load')), { once: true })
    })
    return player.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
  })
}

async function seekTo(page: Page, seconds: number) {
  await video(page).evaluate(async (element, target) => {
    const player = element as HTMLVideoElement
    player.currentTime = target
    await new Promise<void>(resolve => player.addEventListener('seeked', () => resolve(), { once: true }))
  }, seconds)
}

async function pauseAndSeek(page: Page, seconds: number) {
  await video(page).evaluate(element => (element as HTMLVideoElement).pause())
  await seekTo(page, seconds)
}

/** Start button, the changing instruction and the whole 16:9 camera view must fit without scrolling. */
async function expectAboveFold(page: Page, viewport: { width: number; height: number }, where: string) {
  await page.setViewportSize(viewport)
  const regions = {
    'start button': await page.locator('.demo-button-primary').boundingBox(),
    instruction: await caption(page).boundingBox(),
    'camera view': await video(page).boundingBox(),
  }
  for (const [name, box] of Object.entries(regions)) {
    expect(box, `${where}: ${name} is missing`).not.toBeNull()
    expect(box!.y, `${where}: ${name} starts above the fold`).toBeGreaterThanOrEqual(0)
    expect(box!.y + box!.height, `${where}: ${name} needs scrolling`)
      .toBeLessThanOrEqual(viewport.height)
  }
  const camera = regions['camera view']!
  expect(camera.width / camera.height, `${where}: camera view is not 16:9`).toBeCloseTo(16 / 9, 2)
  expect(await video(page).evaluate(element => getComputedStyle(element).objectFit)).toBe('contain')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
}

test.describe('final video demo', () => {
  test('the selector mounts only the demo and offers the three scenes', async ({ page }) => {
    const { offenders } = await watchForLiveTraffic(page)
    await page.goto('/?demo=1')
    await expect(page.getByRole('heading', { name: 'Three scenes to screen-record.' })).toBeVisible()
    const links = page.locator('.demo-scene-link')
    await expect(links).toHaveCount(3)
    expect(await links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))))
      .toEqual(['?demo=teach', '?demo=route', '?demo=collision'])
    await expect(links.nth(2)).toContainText('Obstacle awareness')
    await expect(video(page)).toHaveCount(0)
    expect(await page.evaluate(() => (window as unknown as { __demoCameraCalls: number }).__demoCameraCalls)).toBe(0)
    expect(offenders).toEqual([])
    await noSevereAxe(page, 'selector')
  })

  for (const id of SCENES) {
    test(`${id} opens directly from the URL without the live app`, async ({ page }) => {
      const { offenders, media } = await watchForLiveTraffic(page)
      await page.goto(`/?demo=${id}`)
      await expect(page.getByRole('heading', { name: HEADINGS[id] })).toBeVisible()
      await expect(page.getByText('A familiar route starts here.')).toHaveCount(0)
      await expect(video(page)).toHaveAttribute('src', `/demo-media/${timeline.scenes[id].media}`)
      expect(await video(page).evaluate(element => (element as HTMLVideoElement).srcObject)).toBeNull()
      await page.waitForLoadState('networkidle')
      expect(offenders).toEqual([])
      expect(media.map(entry => entry.path)).toContain(`/demo-media/${timeline.scenes[id].media}`)
      expect([...new Set(media.map(entry => entry.status))].every(status => status === 200 || status === 206)).toBe(true)
      expect(await page.evaluate(() => (window as unknown as { __demoCameraCalls: number }).__demoCameraCalls)).toBe(0)
      await noSevereAxe(page, id)
    })
  }

  test('an unknown demo value falls back to the selector', async ({ page }) => {
    await page.goto('/?demo=live')
    await expect(page.getByRole('heading', { name: 'Three scenes to screen-record.' })).toBeVisible()
  })

  test('the live landing page still renders the real app', async ({ page }) => {
    await page.route('**/routes', route => route.fulfill({ json: [] }))
    await page.route('**/health', route => route.fulfill({ json: { provider_label: 'Test provider' } }))
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'A familiar route starts here.' })).toBeVisible()
    await expect(page.locator('.demo-shell')).toHaveCount(0)
  })

  test('a clip that cannot be loaded offers a reload instead of a blank screen', async ({ page }) => {
    await page.route('**/demo-media/*.mp4', route => route.fulfill({ status: 404, contentType: 'text/plain', body: 'missing' }))
    await page.goto('/?demo=route')
    const alert = page.getByRole('alert')
    await expect(alert).toContainText('This clip could not be loaded')
    const reload = alert.getByRole('button', { name: 'Reload page' })
    await expect(reload).toBeVisible()
    await expect(page.getByTestId('demo-state')).toHaveText('Ready')
    await reload.click()
    await expect(page.getByRole('alert')).toContainText('This clip could not be loaded')
  })
})

test.describe('prepared clips', () => {
  test.skip(!hasMedia, 'run scripts/prepare_final_video_media.py to create apps/web/public/demo-media')

  test('teach keeps the original audio and moves through recording, learning and learned', async ({ page }) => {
    await page.goto('/?demo=teach')
    const support = await waitForMetadata(page)
    test.skip(!support, `this browser reports no H.264/AAC support (${support})`)
    const record = page.getByRole('button', { name: START.teach, exact: true })
    await expect(video(page)).toHaveJSProperty('muted', false)
    await expect(video(page)).toHaveJSProperty('volume', 1)
    const box = await record.boundingBox()
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
    await page.mouse.down()
    await expect(record).toHaveClass(/is-pressed/)
    await page.mouse.up()
    await expect(page.getByTestId('demo-state')).toHaveText('Recording')
    await expect(page.getByTestId('demo-recording')).toBeVisible()
    await expect(video(page)).toHaveJSProperty('paused', false)

    const loadingAt = anchoredAt(timeline.scenes.teach, 1)
    const learnedAt = anchoredAt(timeline.scenes.teach, 2)
    await pauseAndSeek(page, loadingAt - 0.5)
    await expect(stage(page)).toHaveAttribute('data-phase', 'recording')
    await expect(caption(page)).toHaveText('Recording started.')
    await expect(page.getByTestId('demo-recording')).toBeVisible()

    await pauseAndSeek(page, loadingAt + 0.2)
    await expect(stage(page)).toHaveAttribute('data-phase', 'loading')
    await expect(caption(page)).toHaveText('Learning.')
    await expect(page.getByTestId('demo-recording')).toHaveCount(0)

    await pauseAndSeek(page, learnedAt + 0.2)
    await expect(stage(page)).toHaveAttribute('data-phase', 'learned')
    await expect(caption(page)).toHaveText('Route learned.')
    await expect(page.getByTestId('demo-state')).toHaveText('Route learned')

    await pauseAndSeek(page, sceneDuration('teach') - 0.2)
    await expect(stage(page)).toHaveAttribute('data-phase', 'learned')
    expect(await video(page).evaluate(element => (element as HTMLVideoElement).duration)).toBeCloseTo(sceneDuration('teach'), 1)
  })

  test('a rejected play is recoverable from the same button', async ({ page }) => {
    await page.addInitScript(() => {
      const proto = HTMLMediaElement.prototype as unknown as { play: (...args: unknown[]) => Promise<void> }
      const original = proto.play
      let rejectOnce = true
      proto.play = function (this: HTMLMediaElement, ...args: unknown[]) {
        if (rejectOnce) {
          rejectOnce = false
          return Promise.reject(new DOMException('blocked for the test', 'NotAllowedError'))
        }
        return original.apply(this, args)
      }
    })
    await page.goto('/?demo=route')
    const support = await waitForMetadata(page)
    test.skip(!support, `this browser reports no H.264/AAC support (${support})`)
    const start = page.getByRole('button', { name: START.route, exact: true })
    await start.click()
    const notice = page.getByText('Playback was blocked. Tap the button again to start the clip.')
    await expect(notice).toBeVisible()
    await expect(page.getByTestId('demo-state')).toHaveText('Ready')
    await start.click()
    await expect(video(page)).toHaveJSProperty('paused', false)
    await expect(notice).toHaveCount(0)
  })

  test('route speaks the three cues and ends arrived', async ({ page }) => {
    await page.goto('/?demo=route')
    const support = await waitForMetadata(page)
    test.skip(!support, `this browser reports no H.264/AAC support (${support})`)
    await page.getByRole('button', { name: START.route, exact: true }).click()
    await expect(video(page)).toHaveJSProperty('paused', false)
    await expect.poll(async () => video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0.2)
    await expect(caption(page)).toHaveText('Turn right.')

    for (const [seconds, text, phase] of [[3.6, 'Continue straight.', 'navigating'], [10.2, 'You have arrived. The restroom is on your right.', 'arrived'], [14.0, 'You have arrived. The restroom is on your right.', 'arrived']] as const) {
      await pauseAndSeek(page, seconds)
      await expect(caption(page)).toHaveText(text)
      await expect(stage(page)).toHaveAttribute('data-phase', phase)
    }
    await expect(video(page)).toHaveJSProperty('muted', false)
  })

  test('collision warns exactly between one and seven seconds and never claims the path is clear', async ({ page }) => {
    await page.goto('/?demo=collision')
    const support = await waitForMetadata(page)
    test.skip(!support, `this browser reports no H.264/AAC support (${support})`)
    expect(await video(page).evaluate(element => (element as HTMLVideoElement).duration)).toBeCloseTo(9, 2)
    await page.getByRole('button', { name: START.collision, exact: true }).click()
    await expect(video(page)).toHaveJSProperty('paused', false)

    await pauseAndSeek(page, 0.5)
    await expect(stage(page)).toHaveAttribute('data-phase', 'watching')
    await expect(page.locator('.demo-warning')).toHaveCount(0)
    await expect(caption(page)).toHaveText('Watching the path ahead.')

    await pauseAndSeek(page, 1.4)
    await expect(stage(page)).toHaveAttribute('data-phase', 'warning')
    await expect(caption(page)).toHaveText('Be careful. Someone is in front of you.')
    await expect(page.locator('.demo-warning')).toBeVisible()
    await expect(page.getByTestId('demo-state')).toHaveText('Warning')

    await pauseAndSeek(page, 6.9)
    await expect(stage(page)).toHaveAttribute('data-phase', 'warning')

    await pauseAndSeek(page, 7.1)
    await expect(stage(page)).toHaveAttribute('data-phase', 'cleared')
    await expect(page.locator('.demo-warning')).toHaveCount(0)
    await expect(caption(page)).toHaveText('Warning ended. Keep watching the path ahead.')

    await pauseAndSeek(page, 8.9)
    await expect(stage(page)).toHaveAttribute('data-phase', 'cleared')
    await expect(page.getByTestId('demo-state')).toHaveText('Alert ended')
    await expect(page.locator('.demo-caption')).not.toContainText(/path is clear|no one is|all clear/i)
  })

  test('pause, resume, restart and a hidden tab all follow the clip', async ({ page }) => {
    await page.goto('/?demo=route')
    const support = await waitForMetadata(page)
    test.skip(!support, `this browser reports no H.264/AAC support (${support})`)
    const blocked = page.getByText('Playback was blocked. Tap the button again to start the clip.')
    const primary = page.getByRole('button', { name: /Start guidance|Pause|Resume|Play again/ })
    await primary.click()
    await expect.poll(async () => video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0.2)
    await page.getByRole('button', { name: 'Pause', exact: true }).click()
    await expect(video(page)).toHaveJSProperty('paused', true)
    const paused = await video(page).evaluate(element => (element as HTMLVideoElement).currentTime)
    await page.waitForTimeout(600)
    expect(Math.abs(await video(page).evaluate(element => (element as HTMLVideoElement).currentTime) - paused)).toBeLessThan(0.05)
    // Pausing cancels the pending play() promise with AbortError; that is not a blocked play.
    await expect(blocked).toHaveCount(0)

    await seekTo(page, 4)
    await expect.poll(async () => video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(3.5)
    await expect(blocked).toHaveCount(0)

    await page.getByRole('button', { name: 'Resume', exact: true }).click()
    await expect(video(page)).toHaveJSProperty('paused', false)
    await expect(blocked).toHaveCount(0)
    await page.getByRole('button', { name: 'Restart', exact: true }).click()
    await expect.poll(async () => video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBeLessThan(1)
    await expect(blocked).toHaveCount(0)

    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
      document.dispatchEvent(new Event('visibilitychange'))
    })
    await expect(video(page)).toHaveJSProperty('paused', true)
    await expect(blocked).toHaveCount(0)
  })

  test('the narration toggle mutes the clip and exposes the caption to screen readers', async ({ page }) => {
    await page.goto('/?demo=collision')
    const support = await waitForMetadata(page)
    test.skip(!support, `this browser reports no H.264/AAC support (${support})`)
    const region = page.locator('.demo-caption-region')
    await expect(region).toHaveAttribute('aria-live', 'off')
    await page.getByLabel('App narration').uncheck()
    await expect(video(page)).toHaveJSProperty('muted', true)
    await expect(region).toHaveAttribute('aria-live', 'polite')
    await page.getByRole('button', { name: START.collision, exact: true }).click()
    await pauseAndSeek(page, 1.5)
    await expect(region).toHaveAttribute('aria-live', 'assertive')
  })

  test('switching scenes starts a fresh clip with no leftover playback', async ({ page }) => {
    await page.goto('/?demo=teach')
    const support = await waitForMetadata(page)
    test.skip(!support, `this browser reports no H.264/AAC support (${support})`)
    await page.getByRole('button', { name: START.teach, exact: true }).click()
    await expect.poll(async () => video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBeGreaterThan(0.2)
    await page.getByRole('link', { name: 'All scenes' }).click()
    await expect(page.getByRole('heading', { name: 'Three scenes to screen-record.' })).toBeVisible()
    await page.getByRole('link', { name: /Elevator to restroom/ }).click()
    await expect(page.getByRole('heading', { name: HEADINGS.route })).toBeVisible()
    await expect(video(page)).toHaveJSProperty('paused', true)
    expect(await video(page).evaluate(element => (element as HTMLVideoElement).currentTime)).toBe(0)
  })
})

test.describe('phone viewport', () => {
  test.use({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, hasTouch: true })
  test.skip(!hasMedia, 'run scripts/prepare_final_video_media.py to create apps/web/public/demo-media')

  test('start button, instruction and the whole camera view fit without scrolling', async ({ page }) => {
    for (const viewport of PHONE_VIEWPORTS) {
      for (const id of SCENES) {
        await page.goto(`/?demo=${id}`)
        const support = await waitForMetadata(page)
        const where = `${id} at ${viewport.width}x${viewport.height}`
        await page.setViewportSize(viewport)
        await expectAboveFold(page, viewport, `${where} (ready)`)
        if (!support) continue
        await page.getByRole('button', { name: START[id], exact: true }).click()
        await pauseAndSeek(page, id === 'collision' ? 2.2 : id === 'route' ? 10.6 : 3.2)
        await expectAboveFold(page, viewport, `${where} (playing)`)
      }
    }
  })

  test('scenes fit a portrait phone without clipping and capture screenshots', async ({ page }) => {
    mkdirSync(shotsDir, { recursive: true })
    await page.goto('/?demo=1')
    await expect(page.getByRole('heading', { name: 'Three scenes to screen-record.' })).toBeVisible()
    await noSevereAxe(page, 'selector-mobile')
    await page.screenshot({ path: join(shotsDir, 'selector.png'), fullPage: true })

    const shots = [
      { id: 'teach', at: 3.2, shot: 'teach-recording.png' },
      { id: 'route', at: 10.6, shot: 'route-arrived.png' },
      { id: 'collision', at: 2.2, shot: 'collision-warning.png' },
    ] as const
    for (const scene of shots) {
      await page.goto(`/?demo=${scene.id}`)
      const support = await waitForMetadata(page)
      if (support) {
        await page.getByRole('button', { name: START[scene.id], exact: true }).click()
        await pauseAndSeek(page, scene.at)
      }
      await expect(page.locator('.demo-button-primary')).toBeVisible()
      await noSevereAxe(page, `${scene.id}-mobile`)
      await page.screenshot({ path: join(shotsDir, scene.shot), fullPage: true })
    }
    await page.goto('/?demo=teach')
    if (await waitForMetadata(page)) {
      await page.getByRole('button', { name: START.teach, exact: true }).click()
      await pauseAndSeek(page, sceneDuration('teach') - 1)
      await expect(caption(page)).toHaveText('Route learned.')
      await page.screenshot({ path: join(shotsDir, 'teach-learned.png'), fullPage: true })
    }
  })
})
