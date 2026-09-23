import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import type { Assets, Draft, ObserveResult, Route, RouteSummary, TeachJob } from '../src/types'

// Super-final journeys: several saved routes that chain, phone setup, route hazards, and the
// guide's teach → review → publish flow. Laptop API mocked; the app itself runs for real.

const phrase = (key: string) => `Say ${key}.`
const steps = (prefix: string) => [{ id: 's1', instruction: `${prefix} step one.`, landmark: 'Sign one', voice_cue: '' },
  { id: 's2', instruction: `${prefix} step two.`, landmark: 'Sign two', voice_cue: '' }]
const routes: Route[] = [
  { route_id: 'entrance-to-lift-lobby-v1', steps: steps('Entrance') },
  { route_id: 'lift-lobby-to-meeting-room-v1', steps: steps('Meeting') },
  { route_id: 'lift-lobby-to-toilet-v2', steps: steps('Toilet') },
]
const summary = (route_id: string, origin: string, destination: string, hazards = 0): RouteSummary => ({
  route_id, origin_label: origin, destination_label: destination, origin_place: origin.toLowerCase().replace(/ /g, '-'),
  destination_place: destination.toLowerCase().replace(/ /g, '-'), steps: 2, hazards, sample: false })
const catalog = [summary('entrance-to-lift-lobby-v1', 'Main entrance', 'Lift lobby', 1),
  summary('lift-lobby-to-meeting-room-v1', 'Lift lobby', 'Meeting room', 1), summary('lift-lobby-to-toilet-v2', 'Lift lobby', 'Toilet entrance')]
const keys = ['origin-instruction', 'origin-found', 'arrival', 's0-instruction', 's0-reached', 's1-instruction', 's0-lost', 's1-lost']
function assets(route_id: string): Assets {
  const [origin, destination] = [catalog.find(c => c.route_id === route_id)!.origin_label, catalog.find(c => c.route_id === route_id)!.destination_label]
  const hazardous = route_id !== 'lift-lobby-to-toilet-v2'
  const extra: Record<string, string> = hazardous ? { 's0-watch': 'On the way: a glass door.', 's0-hazard-0': 'Be careful. A glass door is in front of you.',
    's0-hazard-0-action': 'Push the door open and go through.' } : {}
  return { origin_label: origin, destination_label: destination, sample: false,
    steps: [{ short_name: 'sign one', expected_seconds: 8, hazards: hazardous ? ['glass-door'] : [] }, { short_name: 'sign two', expected_seconds: 8, hazards: [] }],
    phrases: { ...Object.fromEntries(keys.map(k => [k, phrase(k)])), ...extra } }
}

async function camera(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: async () => {
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 540
      const ctx = canvas.getContext('2d')!
      const paint = () => { ctx.fillStyle = '#ece7d4'; ctx.fillRect(0, 0, 960, 540); ctx.fillStyle = '#143e31'; ctx.fillText(String(Date.now()), 20, 40); requestAnimationFrame(paint) }
      paint()
      return canvas.captureStream(10)
    } } })
  })
}

async function mockWalk(page: Page, observe: (body: { route_id: string; step_index: number }, n: number) => Partial<ObserveResult>) {
  const speech: string[] = []
  await camera(page)
  await page.route('**/routes', r => r.fulfill({ json: routes }))
  await page.route('**/catalog', r => r.fulfill({ json: catalog }))
  await page.route('**/health', r => r.fulfill({ json: { provider_label: 'Mock visual provider' } }))
  await page.route('**/routes/*/assets', r => r.fulfill({ json: assets(r.request().url().split('/routes/')[1].split('/')[0]) }))
  await page.route('**/speech/**', r => { speech.push(new URL(r.request().url()).pathname); return r.fulfill({ status: 204 }) })
  await page.route('**/app-speech/**', r => { speech.push(new URL(r.request().url()).pathname); return r.fulfill({ status: 204 }) })
  await page.route('**/models/**', r => r.fulfill({ status: 404 }))
  let n = 0
  await page.route('**/observe', r => {
    const body = r.request().postDataJSON()
    return r.fulfill({ json: { step_index: body.step_index, target: 'none', position: null, distance: null, hazards: [], ...observe(body, ++n) } })
  })
  return { speech }
}

const heading = (page: Page, name: string) => expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
async function noSevereAxe(page: Page, where: string) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical').map(v => `${where}: ${v.id} ${v.nodes[0]?.target}`)).toEqual([])
}
async function cameraAvailable(page: Page) {
  const ok = await page.evaluate(() => typeof MediaStream === 'function' && typeof HTMLCanvasElement.prototype.captureStream === 'function')
  test.skip(!ok, 'Browser build lacks MediaStream/canvas.captureStream; run camera journeys on Chromium or macOS/Linux WebKit')
}
async function startWalk(page: Page) {
  await cameraAvailable(page)
  await page.getByLabel('I agree to send photos continuously during the walk.').check()
  await page.getByRole('button', { name: 'Start this walk' }).click()
}

test('choose a saved route, see its warnings, and continue to the next leg on arrival', async ({ page }) => {
  await mockWalk(page, () => ({ target: 'matched', position: 'ahead', distance: 'near' }))
  await page.goto('/')
  const picker = page.getByRole('group', { name: 'Choose a saved route' })
  await expect(picker.getByRole('radio')).toHaveCount(3)
  await expect(page.getByLabel('Main entrance to Lift lobby', { exact: false })).toBeChecked()
  await expect(page.getByRole('heading', { name: 'Main entrance to Lift lobby' })).toBeVisible()
  await expect(page.getByText('Watch for: glass door', { exact: true })).toBeVisible()
  await noSevereAxe(page, 'picker')
  await page.getByLabel('Lift lobby to Toilet entrance', { exact: false }).check()
  await expect(page.getByRole('heading', { name: 'Lift lobby to Toilet entrance' })).toBeVisible()
  await page.getByLabel('Main entrance to Lift lobby', { exact: false }).check()

  await page.getByLabel('App voice', { exact: true }).uncheck()
  await startWalk(page)
  await heading(page, 'Starting point found.')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await heading(page, 'Checkpoint 1 of 2 reached.')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await heading(page, 'You have arrived.')

  const onward = page.getByRole('region', { name: 'Continue your journey' })
  await expect(onward.getByRole('button')).toHaveText(['Next: Lift lobby to Meeting room', 'Next: Lift lobby to Toilet entrance'])
  await noSevereAxe(page, 'arrived with onward legs')
  await onward.getByRole('button', { name: 'Next: Lift lobby to Meeting room' }).click()
  await expect(page.getByRole('heading', { name: 'Lift lobby to Meeting room' })).toBeVisible()
  await expect(page.getByText('Next route: Lift lobby to Meeting room. Start this walk when you are at the lift lobby.', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start this walk' })).toBeFocused()
  await page.reload()
  await expect(page.getByLabel('Lift lobby to Meeting room', { exact: false })).toBeChecked() // Remembered on this phone.
})

test('route hazard: chime banner, warning, then how to pass; never twice on one step', async ({ page }) => {
  let warned = 0, again = false
  const { speech } = await mockWalk(page, body => {
    if (body.step_index === -1) return { target: 'matched', position: 'ahead', distance: 'near' }
    if (body.step_index === 0 && (warned < 9 || again)) { warned++; return { target: 'candidate', position: 'ahead', distance: 'far', hazards: [0] } }
    return { target: 'matched', position: 'ahead', distance: 'near' }
  })
  await page.goto('/')
  await startWalk(page)
  await heading(page, 'Starting point found.')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.locator('.alert-banner.hazard')).toHaveText('!Be careful. A glass door is in front of you.')
  await expect(page.getByRole('alert')).toHaveCount(0) // App voice speaks it; no duplicate screen-reader alert.
  await expect(page.locator('.status-copy .instruction')).toHaveText('Push the door open and go through.')
  await expect(page.getByText(`Direction: ${phrase('s0-instruction')}`, { exact: true })).toBeVisible()
  await noSevereAxe(page, 'hazard warning')
  await page.getByRole('button', { name: '↻ Repeat' }).click()
  await expect(page.locator('.status-copy .instruction')).toHaveText('Push the door open and go through.')
  await expect.poll(() => warned).toBeGreaterThan(3)
  const said = (key: string) => speech.filter(p => p.endsWith(`/${key}.mp3`)).length
  expect(said('s0-hazard-0')).toBe(1) // Seen again and again, announced once.
  expect(said('s0-hazard-0-action')).toBeGreaterThanOrEqual(1)
  expect(speech.indexOf('/speech/entrance-to-lift-lobby-v1/s0-watch.mp3')).toBeGreaterThan(speech.indexOf('/speech/entrance-to-lift-lobby-v1/s0-instruction.mp3'))
  await expect(page.locator('.alert-banner')).toHaveCount(0, { timeout: 10_000 })

  // With app voice off, the same warning is a screen-reader alert instead.
  await page.getByLabel('App voice', { exact: true }).uncheck()
  await page.getByRole('button', { name: 'Stop route' }).click()
  again = true
  await startWalk(page)
  await heading(page, 'Starting point found.')
  await page.getByRole('button', { name: 'Next', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Be careful. A glass door is in front of you.' })).toBeVisible()
})

test('phone setup: spoken on request, dismissed once, reopened from Phone setup', async ({ page }) => {
  const { speech } = await mockWalk(page, () => ({}))
  await page.goto('/')
  const setup = page.getByRole('region', { name: 'Wear your phone' })
  await expect(setup.getByRole('listitem')).toHaveCount(4)
  await setup.getByRole('button', { name: 'Play setup instructions' }).click()
  // The app's one audio element is pointed at the built-in setup sentences (WebKit loads media
  // outside Playwright's request interception, so check the element rather than the network).
  await expect.poll(() => page.locator('audio').evaluate(el => new URL((el as HTMLAudioElement).src || 'http://x/').pathname)).toMatch(/^\/app-speech\/setup-[1-4]\.mp3$/)
  expect(speech.every(p => p.startsWith('/app-speech/setup-'))).toBe(true)
  await setup.getByRole('button', { name: 'I’m ready' }).click()
  await expect(setup).toHaveCount(0)
  await expect(page.getByLabel('I agree to send photos continuously during the walk.')).toBeFocused()
  await page.reload()
  await expect(page.getByRole('region', { name: 'Wear your phone' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Phone setup' }).click()
  await expect(page.getByRole('region', { name: 'Wear your phone' })).toBeVisible()
  await expect(page.getByText('Obstacle alerts are unavailable on this phone.', { exact: false })).toBeVisible()
})

const draft: Draft = {
  route_id: 'lift-lobby-to-meeting-room-v1', steps: 2, created_at: '2026-09-23T03:00:00Z',
  origin_label: 'Lift lobby', destination_label: 'Meeting room', places: ['Lift lobby', 'Glass door', 'Meeting room'],
  route: { route_id: 'lift-lobby-to-meeting-room-v1', steps: [
    { id: 's1', instruction: 'Turn around and walk to the glass door.', landmark: 'Glass door with a room sign', voice_cue: 'turn around' },
    { id: 's2', instruction: 'Go through the door and continue to the meeting room on your right.', landmark: 'Room 2.3.001 sign', voice_cue: '' }] },
  review: { origin_label: 'Lift lobby', origin_instruction: 'Stand at the lift lobby. Point the camera toward the floor number 3.',
    origin_retry: 'I only know the saved route from the lift lobby.', origin: { description: 'Number 3', required_text: ['3'], required_features: ['Large numeral'], short_name: 'floor number 3' },
    checkpoints: [
      { description: 'Glass door', required_text: [], required_features: ['Frameless glass door'], short_name: 'glass door', expected_seconds: 6,
        hazards: [{ kind: 'glass-door', warning: 'Be careful. A glass door is in front of you.', action: 'Push the door open and go through.', features: ['glass door'] }] },
      { description: 'Room 2.3.001 sign', required_text: ['2.3.001'], required_features: [], short_name: 'meeting room sign', expected_seconds: 12, hazards: [] }],
    destination_label: 'Meeting room', arrival: 'You have arrived at the meeting room.', destination_is_exterior: false, sample: false },
  transcript: [{ start: 1, end: 3, text: 'Turn around' }, { start: 20, end: 22, text: 'This is our meeting room' }],
}

test('guide teaches a route on the phone: guide code, record, learning, places remembered', async ({ page }) => {
  await camera(page)
  let unlocked = false, uploaded = 0, polls = 0
  const job = (status: TeachJob['status']): TeachJob => ({ job_id: 'job1', status, route_id: draft.route_id, message: '', places: status === 'learned' ? draft.places : [], steps: 2 })
  await page.route('**/guide/access', r => {
    unlocked ||= r.request().headers()['x-teach-pin'] === '4821'
    return r.fulfill({ json: { allowed: unlocked, pin_configured: true } })
  })
  await page.route('**/guide/drafts', r => r.fulfill({ json: polls > 1 ? [draft] : [] }))
  await page.route('**/guide/teach', async r => {
    uploaded = r.request().postDataBuffer()?.length ?? 0
    expect(r.request().headers()['x-teach-pin']).toBe('4821')
    return r.fulfill({ status: 202, json: job('learning') })
  })
  await page.route('**/guide/teach/job1', r => r.fulfill({ json: job(++polls > 1 ? 'learned' : 'learning') }))
  await page.route('**/app-speech/**', r => r.fulfill({ status: 204 }))
  await page.goto('/#/teach')
  await heading(page, 'Guide code needed')
  await noSevereAxe(page, 'teach locked')
  await page.getByLabel('Guide code', { exact: true }).fill('4821')
  await page.getByRole('button', { name: 'Unlock teaching' }).click()
  await heading(page, 'Learn a route')
  await noSevereAxe(page, 'teach ready')

  await cameraAvailable(page)
  test.skip(!(await page.evaluate(() => typeof MediaRecorder === 'function')), 'Browser build lacks MediaRecorder')
  await page.getByRole('button', { name: 'Record' }).click()
  await expect(page.getByText('Name the starting place and the destination first.')).toBeVisible()
  await page.getByLabel('Starting place').fill('Lift lobby')
  await page.getByLabel('Destination').fill('Meeting room')
  await page.getByLabel('Everyone in view agreed to be filmed.').check()
  await page.getByRole('button', { name: 'Record' }).click()
  await heading(page, 'Recording the walk')
  await expect(page.locator('.rec-chip')).toContainText('REC 0:0')
  await page.waitForTimeout(2200)
  await page.getByRole('button', { name: 'Stop and learn' }).click()
  await heading(page, 'Route learned.')
  expect(uploaded).toBeGreaterThan(1000)
  await expect(page.getByText('3 places remembered', { exact: false })).toBeVisible()
  await expect(page.locator('.learned li')).toHaveText(['Lift lobby', 'Glass door', 'Meeting room'])
  await noSevereAxe(page, 'learned')
  await expect(page.getByRole('link', { name: 'Review and publish' })).toHaveAttribute('href', `#/review/${draft.route_id}`)
  await expect(page.getByRole('link', { name: 'Lift lobby to Meeting room' })).toBeVisible()
})

test('guide reviews the draft: problems per field, then publishes with confirmation', async ({ page }) => {
  let body: { route: Route; review: Draft['review']; reviewer: string; confirmed: boolean } | undefined
  await page.route(`**/guide/drafts/${draft.route_id}`, r => r.fulfill({ json: draft }))
  await page.route(`**/guide/drafts/${draft.route_id}/publish`, r => {
    body = r.request().postDataJSON()
    if (!body!.confirmed) return r.fulfill({ status: 422, json: { detail: 'Confirm that you walked and checked this route before publishing', fields: [] } })
    if (!body!.review.checkpoints[1].short_name) return r.fulfill({ status: 422, json: { detail: 'Some fields need attention', fields: [{ field: 'review.checkpoints.1.short_name', message: 'String should have at least 1 character' }] } })
    return r.fulfill({ json: { route_id: draft.route_id, phrases: 58 } })
  })
  await page.goto(`/#/review/${draft.route_id}`)
  await heading(page, 'Check every word before it is spoken')
  await expect(page.getByText('Places remembered: Lift lobby, Glass door, Meeting room.')).toBeVisible()
  await expect(page.getByRole('group', { name: 'Step 1 warning 1' }).getByLabel('Warning (spoken with a chime)')).toHaveValue('Be careful. A glass door is in front of you.')
  await expect(page.getByLabel('Keep your quote: “turn around”')).toBeChecked()
  await noSevereAxe(page, 'review')

  await page.getByRole('button', { name: 'Publish route' }).click()
  await expect(page.getByRole('alert')).toContainText('Confirm that you walked and checked this route before publishing')
  await expect(page.getByRole('alert')).toBeFocused()
  await page.getByLabel('I walked this route and checked every direction, sign and warning.').check()
  await page.getByLabel('The route ends outside the destination’s door or sign, never inside it.').check()
  await page.getByLabel('Your name').fill('Linh')
  const stepTwo = page.getByRole('group', { name: 'Step 2 · destination' })
  await stepTwo.getByLabel('Landmark name (spoken)').fill('')
  await page.getByRole('button', { name: 'Publish route' }).click()
  await expect(page.getByText('Step 2 · short name: String should have at least 1 character')).toBeVisible()
  await expect(stepTwo.getByLabel('Landmark name (spoken)')).toHaveAttribute('aria-invalid', 'true')
  await noSevereAxe(page, 'review with problems')

  await stepTwo.getByLabel('Landmark name (spoken)').fill('meeting room sign')
  await page.getByRole('group', { name: 'Step 1', exact: true }).getByRole('button', { name: 'Remove warning 1' }).click()
  await page.getByRole('button', { name: 'Add a warning to step 2' }).click()
  await page.getByRole('group', { name: 'Step 2 warning 1' }).getByLabel('Kind').selectOption('automatic-door')
  await page.getByRole('group', { name: 'Step 2 warning 1' }).getByLabel('Warning (spoken with a chime)').fill('Be careful. Automatic door ahead.')
  await page.getByRole('button', { name: 'Publish route' }).click()
  await heading(page, 'Route published')
  expect(body!.reviewer).toBe('Linh')
  expect(body!.review.destination_is_exterior).toBe(true)
  expect(body!.review.checkpoints[0].hazards).toEqual([])
  expect(body!.review.checkpoints[1].hazards).toEqual([{ kind: 'automatic-door', warning: 'Be careful. Automatic door ahead.', action: '', features: ['glass door'] }])
  expect(body!.route.steps[0].voice_cue).toBe('turn around')
  await expect(page.getByRole('link', { name: 'Walk this route' })).toHaveAttribute('href', `/?route=${draft.route_id}#/`)
})
