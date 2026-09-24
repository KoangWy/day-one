import { useEffect, useRef, useState } from 'react'
import { appSpeechUrl, getJSON, observe, speechUrl } from './api'
import { APP_TEXT, isAppKey } from './appPhrases'
import { capturePhoto } from './capture'
import { playChime, unlockChime } from './chime'
import { loadDetector, type Detector } from './detector'
import { createFrameLoop, observeConsumer, type ObserveOutcome } from './frameLoop'
import { initial, looping, parseCommand, transition, type Event, type Output, type Say, type State } from './machine'
import { downloadMetrics, newStepStats, summarize, type Metric } from './metrics'
import { createWatch, type ObstacleKind, type Watch } from './obstacles'
import { Setup } from './Setup'
import { speechConstructor, type Recognition } from './speech'
import { load, save } from './storage'
import type { Assets, HazardKind, Route, RouteSummary } from './types'
import { createVoice, type Voice } from './voice'

const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.'
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
type Input = Event extends infer E ? E extends Event ? Omit<E, 'at'> : never : never
type Live = { text: string; key: string; n: number }
type Alert = { text: string; source: 'obstacle' | 'hazard'; n: number }
type DetectorState = 'loading' | 'ready' | 'unavailable' | 'off'
const WAITING = ['atOrigin', 'reached', 'lost', 'override']
const HAZARD_NAME: Record<HazardKind, string> = { 'glass-door': 'glass door', 'automatic-door': 'automatic door', door: 'door', stairs: 'stairs', step: 'step', narrow: 'narrow passage', other: 'hazard' }
const HAZARD_BANNER_MS = 6000

function silence() {
  const bytes = new Uint8Array(844), view = new DataView(bytes.buffer)
  const write = (offset: number, text: string) => [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  write(0, 'RIFF'); view.setUint32(4, 836, true); write(8, 'WAVEfmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, 8000, true); view.setUint32(28, 8000, true); view.setUint16(32, 1, true)
  view.setUint16(34, 8, true); write(36, 'data'); view.setUint32(40, 800, true); bytes.fill(128, 44)
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))
}

function requestedRoute() {
  try { return new URLSearchParams(location.search).get('route') } catch { return null }
}

export default function Walk() {
  const [catalog, setCatalog] = useState<RouteSummary[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [picked, setPicked] = useState('') // The radio follows the tap at once; the route loads after.
  const [route, setRoute] = useState<Route | null>(null)
  const [assets, setAssets] = useState<Assets | null>(null)
  const routeRef = useRef<Route | null>(null)
  const assetsRef = useRef<Assets | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [providerLabel, setProviderLabel] = useState('the configured visual AI provider')
  const [state, setState] = useState<State>(initial)
  const stateRef = useRef(state)
  const [consent, setConsent] = useState(false)
  const [starting, setStarting] = useState(false)
  const startingRef = useRef(false)
  const startToken = useRef(0)
  const [online, setOnline] = useState(navigator.onLine)
  const [voice, setVoice] = useState(true)
  const voiceRef = useRef(true)
  const [blockedAudio, setBlockedAudio] = useState(false)
  const [command, setCommand] = useState('')
  const [commandNotice, setCommandNotice] = useState('')
  const [listening, setListening] = useState(false)
  const listeningRef = useRef(false)
  const [live, setLive] = useState<Live>({ text: '', key: '', n: 0 }) // Latest P1 sentence, always shown.
  const [hint, setHint] = useState<Live>({ text: '', key: '', n: 0 }) // Hints as text when App voice is off.
  const [setupOpen, setSetupOpen] = useState(() => load('dayone.setupDone') !== '1')
  const [obstaclesOn, setObstaclesOn] = useState(() => load('dayone.obstacles') !== 'off')
  const [detectorState, setDetectorState] = useState<DetectorState>('loading')
  const [alert, setAlertState] = useState<Alert | null>(null)
  const alertRef = useRef<Alert | null>(null)
  const alertCount = useRef(0)
  const [alertEnded, setAlertEnded] = useState('')
  const alertTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const video = useRef<HTMLVideoElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const primary = useRef<HTMLButtonElement>(null)
  const startButton = useRef<HTMLButtonElement>(null)
  const consentBox = useRef<HTMLInputElement>(null)
  const recognition = useRef<Recognition | null>(null)
  const metrics = useRef<Metric[]>([])
  const stats = useRef(newStepStats(-1))
  const speaker = useRef<Voice | null>(null)
  const loop = useRef<ReturnType<typeof createFrameLoop> | null>(null)
  const detector = useRef<Detector | null>(null)
  const watch = useRef<Watch | null>(null)
  const dispatchRef = useRef(dispatch)
  const outcomeRef = useRef(outcome)
  const obstacleRef = useRef({ warn, show, clear: clearObstacle })
  dispatchRef.current = dispatch
  outcomeRef.current = outcome
  obstacleRef.current = { warn, show, clear: clearObstacle }

  const active = state.phase !== 'idle' && state.phase !== 'arrived'
  const count = route?.steps.length ?? 0
  const names = assets?.steps.map(s => s.short_name) ?? []
  const phrase = (key: string) => assets?.phrases[key] ?? ''
  const text = (key: string) => (isAppKey(key) ? APP_TEXT[key] : assetsRef.current?.phrases[key]) ?? ''
  const destination = assets?.destination_label || (names.length ? capitalize(names[names.length - 1]) : 'Destination')
  const current = catalog.find(r => r.route_id === selectedId)
  const onward = state.phase === 'arrived' && current?.destination_place
    ? catalog.filter(r => r.route_id !== current.route_id && r.origin_place === current.destination_place) : []

  function record(metric: Omit<Metric, 'sample'>) {
    metrics.current.push({ ...metric, sample: assetsRef.current?.sample })
  }

  function track(prev: State, next: State, out: Output) {
    for (const l of out.log) {
      const { at, time_to_reach_ms, ...rest } = l
      record({ ...rest, at: new Date(at).toISOString(), ...(time_to_reach_ms !== undefined && { time_to_reach_ms }) })
      if (l.event === 'reached') stats.current.time_to_reach_ms = time_to_reach_ms ?? null
    }
    const walked = prev.phase !== 'idle' && prev.phase !== 'arrived'
    const left = next.index !== prev.index || next.phase === 'arrived' || next.phase === 'idle'
    if (walked && left) {
      record({ event: 'step_summary', at: new Date().toISOString(), step: prev.index, ...summarize(stats.current) })
      stats.current = newStepStats(next.index)
    }
  }

  function syncCamera(next: State) {
    if (looping(next.phase)) loop.current?.start(next.index, next.generation)
    else if (next.phase === 'idle' || next.phase === 'arrived') loop.current?.stop()
    else loop.current?.pause() // No photos while waiting for Next or an override answer.
    if (!looping(next.phase)) setHint(h => h.text ? { text: '', key: '', n: h.n + 1 } : h) // Old hints no longer apply.
    if (next.phase === 'arrived') releaseCamera()
  }

  function setAlert(next: Alert | null) { alertRef.current = next; setAlertState(next) }

  function showAlert(message: string, source: Alert['source']) {
    clearTimeout(alertTimer.current)
    setAlertEnded('')
    setAlert({ text: message, source, n: ++alertCount.current })
    if (source === 'hazard') alertTimer.current = setTimeout(() => { if (alertRef.current?.source === 'hazard') setAlert(null) }, HAZARD_BANNER_MS)
  }

  function say({ key, priority }: Say) {
    const sentence = text(key)
    if (!sentence) return // An optional sentence this route does not have.
    if (priority === 0) { playChime(); showAlert(sentence, 'hazard') }
    else if (priority === 1) setLive(l => ({ text: sentence, key, n: l.n + 1 }))
    const accepted = speaker.current?.say(key, priority) ?? false
    if (priority === 2 && accepted) stats.current.hints_spoken++
  }

  /** Obstacle close ahead: chime, banner and a spoken warning that interrupts everything else. */
  function warn(kind: ObstacleKind) {
    playChime()
    speaker.current?.say(`obstacle-${kind}`, 0)
    record({ event: 'obstacle', at: new Date().toISOString(), step: stateRef.current.index })
  }
  function show(kind: ObstacleKind) { showAlert(APP_TEXT[`obstacle-${kind}`], 'obstacle') }
  function clearObstacle() {
    if (alertRef.current?.source !== 'obstacle') return
    setAlert(null)
    setAlertEnded('Warning ended.') // Never "path clear": the camera cannot promise that.
  }

  /** Feeds one event to the pure state machine and applies what it asks for. */
  function dispatch(input: Input): boolean {
    if (!assetsRef.current) return false
    const prev = stateRef.current
    const out = transition(prev, { ...input, at: Date.now() } as Event, assetsRef.current)
    const next = out.state
    if (next !== prev) { stateRef.current = next; setState(next) }
    track(prev, next, out)
    if (next !== prev) syncCamera(next)
    for (const item of out.say) say(item)
    return next !== prev || out.say.length > 0
  }

  function outcome(o: ObserveOutcome) {
    const s = stateRef.current
    if (looping(s.phase) && o.index === s.index && o.generation === s.generation) {
      if (o.ok) {
        stats.current.latencies.push(o.latencyMs)
        if (o.result.target === 'candidate') stats.current.candidates++
        if (o.result.target === 'matched') stats.current.matches++
      } else stats.current.errors++
    }
    if (o.ok) {
      const { target, position, distance, hazards } = o.result
      dispatch({ type: 'OBSERVATION', step_index: o.index, generation: o.generation, target, position, distance, hazards })
    } else dispatch({ type: 'OBSERVE_ERROR', step_index: o.index, generation: o.generation, offline: o.offline })
  }

  function releaseCamera() {
    watch.current?.stop()
    if (stream.current) {
      for (const track of stream.current.getTracks()) { track.onended = null; track.stop() }
      stream.current = null
    }
    if (video.current) video.current.srcObject = null
  }

  function stop(message = 'Route stopped. Start again at the starting point.') {
    startToken.current++
    startingRef.current = false
    setStarting(false)
    recognition.current?.abort()
    speaker.current?.clear()
    loop.current?.stop()
    releaseCamera()
    clearTimeout(alertTimer.current); setAlert(null); setAlertEnded('')
    dispatch({ type: 'RESET', message })
  }

  async function selectRoute(id: string) {
    const routes = await getJSON<Route[]>('/routes')
    const selected = routes.find(r => r.route_id === id) ?? routes[0]
    if (!selected) throw new Error('No reviewed route is available yet. Ask your route guide to prepare the saved route.')
    const metadata = await getJSON<Assets>(`/routes/${selected.route_id}/assets`)
    routeRef.current = selected; assetsRef.current = metadata
    setRoute(selected); setAssets(metadata); setSelectedId(selected.route_id)
    save('dayone.route', selected.route_id)
  }

  async function loadRoutes(preferred?: string) {
    setLoading(true); setLoadError('')
    try {
      let list: RouteSummary[]
      try { list = await getJSON<RouteSummary[]>('/catalog') }
      catch { // Older laptop server without a catalog: plain route list, no place names.
        list = (await getJSON<Route[]>('/routes')).map(r => ({ route_id: r.route_id, origin_label: '', destination_label: '',
          origin_place: '', destination_place: '', steps: r.steps.length, hazards: 0, sample: false }))
      }
      if (!list.length) { setLoadError('No reviewed route is available yet. Ask your route guide to prepare the saved route.'); return }
      setCatalog(list)
      const wanted = [preferred, requestedRoute(), load('dayone.route')].find(id => id && list.some(r => r.route_id === id))
      await selectRoute(wanted ?? list[0].route_id)
      const health = await getJSON<{ provider_label: string }>('/health')
      setProviderLabel(health.provider_label)
    } catch (error) { setLoadError(errorText(error)) }
    finally { setLoading(false) }
  }

  async function choose(id: string) {
    if (stateRef.current.phase !== 'idle' || startingRef.current) return
    setLoadError(''); setPicked(id)
    try { await selectRoute(id) } catch (error) { setLoadError(errorText(error)) }
    finally { setPicked('') }
  }

  async function continueTo(next: RouteSummary) {
    stop(`Next route: ${next.origin_label} to ${next.destination_label}. Start this walk when you are at the ${next.origin_label.toLowerCase()}.`)
    await choose(next.route_id)
    startButton.current?.focus()
  }

  useEffect(() => {
    speaker.current = createVoice(audio.current!, {
      url: key => isAppKey(key) ? appSpeechUrl(key) : speechUrl(routeRef.current?.route_id ?? '', key),
      text: key => (isAppKey(key) ? APP_TEXT[key] : assetsRef.current?.phrases[key]) ?? '',
      onDone: key => { dispatchRef.current({ type: 'AUDIO_DONE', key }) },
      onText: (sentence, priority) => { if (priority === 2) setHint(h => ({ text: sentence, key: '', n: h.n + 1 })) },
      onBlocked: setBlockedAudio,
      enabled: () => voiceRef.current,
      listening: () => listeningRef.current,
    })
    loop.current = createFrameLoop(() => capturePhoto(video.current!), [observeConsumer({
      observe: (index, jpeg, signal) => observe(routeRef.current!.route_id, index, jpeg, signal),
      onOutcome: o => outcomeRef.current(o),
      onSend: index => { if (index === stats.current.step) stats.current.frames_sent++ },
      online: () => navigator.onLine,
    })])
    watch.current = createWatch({
      detect: now => detector.current && video.current ? detector.current.detect(video.current, now) : null,
      onShow: kind => obstacleRef.current.show(kind),
      onAlert: kind => obstacleRef.current.warn(kind),
      onClear: () => obstacleRef.current.clear(),
    })
    void loadRoutes()
    const network = () => setOnline(navigator.onLine)
    const hide = () => {
      if (document.visibilityState === 'hidden' && (stateRef.current.phase !== 'idle' || startingRef.current)) {
        stop('The app was paused. Start again at the starting point before continuing.')
      }
    }
    const pageHide = () => stop('Start again at the starting point before continuing.')
    window.addEventListener('online', network); window.addEventListener('offline', network)
    document.addEventListener('visibilitychange', hide); window.addEventListener('pagehide', pageHide)
    return () => {
      window.removeEventListener('online', network); window.removeEventListener('offline', network)
      document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', pageHide)
      startToken.current++; loop.current?.stop(); speaker.current?.clear(); releaseCamera(); recognition.current?.abort()
      clearTimeout(alertTimer.current)
    }
  }, [])

  useEffect(() => {
    // The detector (~16 MB with its runtime) loads once, while the walker is still choosing a route.
    if (!obstaclesOn) { if (!detector.current) setDetectorState('off'); return }
    if (detector.current) { setDetectorState('ready'); return }
    let cancelled = false
    setDetectorState('loading')
    loadDetector().then(
      d => { if (cancelled) d.close(); else { detector.current = d; setDetectorState('ready') } },
      () => { if (!cancelled) setDetectorState('unavailable') },
    )
    return () => { cancelled = true }
  }, [obstaclesOn])

  useEffect(() => {
    // Obstacle alerts while walking or searching; never while waiting for Next.
    if (looping(state.phase) && obstaclesOn && detectorState === 'ready' && stream.current) watch.current?.start()
    else watch.current?.stop()
  }, [state.phase, obstaclesOn, detectorState])

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => dispatchRef.current({ type: 'TICK' }), 1000)
    return () => clearInterval(timer)
  }, [active])

  useEffect(() => {
    if (!alertEnded) return
    const timer = setTimeout(() => setAlertEnded(''), 3000)
    return () => clearTimeout(timer)
  }, [alertEnded])

  useEffect(() => {
    // Waiting states put focus on the one action, so a VoiceOver double-tap anywhere activates it.
    if (WAITING.includes(state.phase)) primary.current?.focus()
    else if (state.phase !== 'idle' || state.message) heading.current?.focus()
  }, [state.phase, state.index])

  function unlockAudio() {
    if (!audio.current || !voiceRef.current) return
    const url = silence(), player = audio.current
    player.src = url
    void player.play().catch(() => {}).finally(() => URL.revokeObjectURL(url))
  }

  function playSetup() {
    unlockChime()
    for (const key of ['setup-1', 'setup-2', 'setup-3', 'setup-4']) speaker.current?.say(key, 1)
  }

  function finishSetup() {
    save('dayone.setupDone', '1'); setSetupOpen(false)
    // Next thing to do: agree to photos, or start if that is already done.
    setTimeout(() => (consent ? startButton.current : consentBox.current)?.focus())
  }

  function toggleObstacles(on: boolean) {
    save('dayone.obstacles', on ? 'on' : 'off'); setObstaclesOn(on)
  }

  async function start() {
    if (startingRef.current || stateRef.current.phase !== 'idle' || !consent || !route || !assets) return
    startingRef.current = true; setStarting(true)
    const token = ++startToken.current
    metrics.current = []; stats.current = newStepStats(-1)
    // Unlock the same audio element and the warning chime in the user gesture, using silence only.
    unlockAudio(); unlockChime()
    try {
      if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) throw new Error('Camera needs a secure connection. Open the trusted HTTPS address supplied by your guide.')
      if (!navigator.onLine) throw new Error('You are offline. Reconnect to the laptop before starting.')
      const acquired = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      if (token !== startToken.current) { acquired.getTracks().forEach(t => t.stop()); return }
      stream.current = acquired
      if (!video.current) throw new Error('Camera preview is unavailable.')
      video.current.muted = true
      video.current.playsInline = true
      video.current.setAttribute('muted', '')
      video.current.srcObject = acquired
      try { await video.current.play() }
      catch { throw new Error('Camera preview could not play. Tap Start again, or reopen this page in Safari.') }
      if (token !== startToken.current) {
        acquired.getTracks().forEach(t => t.stop())
        if (stream.current === acquired) releaseCamera()
        return
      }
      for (const track of acquired.getVideoTracks()) track.onended = () => stop('Camera connection was lost. Start again at the starting point.')
      dispatch({ type: 'START' })
    } catch (error) {
      if (token === startToken.current) {
        releaseCamera()
        const message = error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in Safari settings, then try again.' : errorText(error)
        dispatch({ type: 'RESET', message })
      }
    } finally {
      if (token === startToken.current) { startingRef.current = false; setStarting(false) }
    }
  }

  function execute(input: string) {
    const parsed = parseCommand(input)
    setCommand('')
    if (!parsed) { setCommandNotice('Use one command: next, yes, no, repeat, where am I, or stop.'); return }
    setCommandNotice(`Command: ${parsed}.`)
    if (parsed === 'stop') { stop(); return }
    const type = parsed.toUpperCase() as 'NEXT' | 'YES' | 'NO' | 'REPEAT' | 'WHERE'
    if (!dispatch({ type })) setCommandNotice(`“${parsed}” is not available right now.`)
  }

  function listen() {
    const Constructor = speechConstructor()
    if (!Constructor || listeningRef.current) return
    speaker.current?.hush() // Opening the microphone stops the app voice.
    const recognizer = new Constructor()
    recognition.current = recognizer
    const end = () => {
      if (!listeningRef.current) return
      listeningRef.current = false; setListening(false); speaker.current?.resume()
    }
    recognizer.lang = 'en-US'; recognizer.continuous = false; recognizer.interimResults = false
    recognizer.onresult = e => { recognizer.abort(); end(); execute(e.results[0][0].transcript) }
    recognizer.onerror = () => { end(); setCommandNotice('Voice command unavailable. Use buttons or type a command.') }
    recognizer.onend = end
    try { listeningRef.current = true; setListening(true); recognizer.start() }
    catch { end(); setCommandNotice('Voice command unavailable. Use buttons or type a command.') }
  }

  const i = state.index
  const showNext = ['atOrigin', 'reached', 'lost'].includes(state.phase) || (state.phase === 'walking' && state.visionDown)
  const title = state.phase === 'idle' ? 'A familiar route starts here.'
    : state.phase === 'origin' ? 'Find your starting point.'
    : state.phase === 'atOrigin' ? 'Starting point found.'
    : state.phase === 'walking' ? `Checkpoint ${i + 1} of ${count}`
    : state.phase === 'reached' ? `Checkpoint ${i + 1} of ${count} reached.`
    : state.phase === 'lost' ? 'Let’s find your place.'
    : state.phase === 'override' ? 'Continue without the camera?'
    : state.unverified ? 'Saved route finished.' : 'You have arrived.'
  const direction = (state.phase === 'walking' || state.phase === 'lost') && live.key !== `s${i}-instruction` ? phrase(`s${i}-instruction`) : ''
  const stepNote = (n: number) => state.phase === 'arrived' || n < i || (n === i && state.phase === 'reached') ? 'Passed'
    : n === i && active ? state.phase === 'lost' ? 'Searching' : 'Heading here' : 'Saved by your guide'
  const obstacleNote = !obstaclesOn ? 'Obstacle alerts are off.'
    : detectorState === 'loading' ? 'Preparing obstacle alerts on this phone…'
    : detectorState === 'unavailable' ? 'Obstacle alerts are unavailable on this phone. Keep using your cane as usual.'
    : 'Obstacle alerts run on this phone: people or objects close ahead get a chime and a warning.'

  return <>
    <div className="intro"><p className="eyebrow">YOUR FIRST DAY. YOUR OWN PACE.</p><h1>A little familiarity.<br /><span>A little more independence.</span></h1><p>A route taught by someone you know.<br className="desktop-break" /> The camera finds each landmark and warns you about what is ahead; you decide when to move on.</p></div>
    <div className="workspace">
      <section className="route-card" aria-labelledby="route-heading">
        <div className="route-label"><span className="eyebrow">YOUR SAVED WALK</span><span className="route-tag">ONE WAY</span></div>
        <h2 id="route-heading">{assets?.origin_label ?? 'Starting point'} <span aria-hidden="true">↗</span><span className="visually-hidden"> to </span>{destination}</h2>
        <p className="muted">{route ? `${count} checkpoints` : 'A route reviewed by your guide'} · English</p>
        <ol className="route-map" aria-label="Route progress">
          <li className={i >= 0 || state.phase === 'atOrigin' || state.phase === 'arrived' ? 'done' : 'current'}><span className="dot" aria-hidden="true" /><span>{assets?.origin_label ?? 'Starting point'}<small>{i >= 0 || state.phase === 'atOrigin' ? 'Found by the camera' : 'Find your starting point'}</small></span></li>
          {(route?.steps ?? []).map((s, n) => {
            const warnings = assets?.steps[n]?.hazards ?? []
            return <li key={s.id} className={stepNote(n) === 'Passed' ? 'done' : n === i && active ? 'current' : ''} aria-current={n === i && active ? 'step' : undefined}><span className="dot" aria-hidden="true">{n + 1}</span><span>{capitalize(names[n] ?? `Checkpoint ${n + 1}`)}<small>{stepNote(n)}</small>{warnings.length > 0 && <small className="watch">Watch for: {warnings.map(k => HAZARD_NAME[k] ?? k).join(', ')}</small>}</span></li>
          })}
        </ol>
        <div className="note"><span aria-hidden="true">✦</span><p>You set the pace.<br />The next step always waits for you.</p></div>
      </section>

      <section className="control-card" aria-labelledby="status-heading">
        <div className="control-top"><span className="eyebrow">{i < 0 ? 'STARTING POINT' : state.phase === 'arrived' ? 'WALK COMPLETE' : 'YOUR NEXT STEP'}</span><span className={`connection ${online ? '' : 'offline'}`}>{online ? 'Online' : 'Offline'}</span></div>
        {assets?.sample && <p className="sample" role="note">Illustrative sample route. These directions are not verified for this building.</p>}
        {!online && <p role="status" className="error">Connection lost. Camera checks need the laptop and internet. Offline location is unavailable.</p>}
        {alert && <div className={`alert-banner ${alert.source}`} role={voice ? undefined : 'alert'} key={alert.n}><span aria-hidden="true">!</span><p>{alert.text}</p></div>}
        <p className="alert-ended" role="status">{alertEnded}</p>
        <div className="status-copy" aria-live="polite" aria-atomic="true">
          <h2 id="status-heading" tabIndex={-1} ref={heading}>{title}</h2>
          {state.phase === 'idle' ? <p>Begin at {assets?.origin_label ?? 'the saved starting point'}. The camera looks for the starting point before giving you directions.</p>
            : <p className="instruction" key={live.n}>{live.text}</p>}
          {direction && <p className="direction">Direction: {direction}</p>}
          {state.message && <p className="error">{state.message}</p>}
        </div>
        <p className="camera-hint" aria-live="polite" aria-atomic="true">{!voice && active && hint.text ? <span key={hint.n}>{hint.text}</span> : null}</p>
        {state.visionDown && active && <p className="error">Camera check is unavailable.{state.phase === 'origin' ? ' Check the connection, or stop the route.' : ' Next continues with saved directions.'}</p>}

        {state.phase === 'idle' && <>
          {catalog.length > 1 && <fieldset className="route-picker" disabled={starting}>
            <legend>Choose a saved route</legend>
            {catalog.map(r => <label className="route-option" key={r.route_id}>
              <input type="radio" name="route" checked={r.route_id === (picked || selectedId)} onChange={() => void choose(r.route_id)} />
              <span><strong>{r.origin_label ? `${r.origin_label} to ${r.destination_label}` : r.route_id}</strong>
                <small>{r.steps} checkpoints{r.hazards ? ` · ${r.hazards} warning${r.hazards > 1 ? 's' : ''}` : ''}{r.sample ? ' · sample' : ''}</small></span>
            </label>)}
          </fieldset>}
          {setupOpen && <Setup onPlay={playSetup} onDone={finishSetup} />}
          <div className="privacy-note"><h3>Photos only while you walk.</h3><p>While a walk is active, the camera sends about one photo every 1–3 seconds to {providerLabel} to find landmarks. Photos can include people nearby — use an agreed area. Photos are not saved by this app. Obstacle alerts look at the camera on this phone only. The camera stops when you arrive, press Stop or leave the app.</p></div>
          <label className="checkbox"><input ref={consentBox} type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I agree to send photos continuously during the walk.</label>
          {loading && <p role="status">Loading your reviewed route…</p>}
          {loadError && <><p role="alert" className="error">{loadError}</p><button className="secondary" onClick={() => void loadRoutes()}>Reload routes</button></>}
          <button ref={startButton} className="primary start" disabled={!consent || !route || !assets || starting || !online} onClick={() => void start()}>{starting ? 'Preparing camera…' : 'Start this walk'}<span aria-hidden="true">↗</span></button>
          {starting && <button className="secondary" onClick={() => stop('Camera setup stopped.')}>Cancel camera setup</button>}
        </>}

        {active && <div className="actions">
          {showNext && <button ref={primary} className="primary next" onClick={() => dispatch({ type: 'NEXT' })}>Next</button>}
          {state.phase === 'override' && <div className="button-row">
            <button ref={primary} className="primary" onClick={() => dispatch({ type: 'YES' })}>Yes, use saved directions</button>
            <button className="secondary" onClick={() => dispatch({ type: 'NO' })}>No, keep looking</button>
          </div>}
        </div>}
        {state.phase === 'arrived' && <>
          {onward.length > 0 && <section className="onward" aria-labelledby="onward-heading">
            <h3 id="onward-heading">Continue your journey</h3>
            {onward.map(r => <button key={r.route_id} className="primary" onClick={() => void continueTo(r)}>Next: {r.origin_label} to {r.destination_label}</button>)}
          </section>}
          <button className={onward.length ? 'secondary' : 'primary'} onClick={() => stop('Start at the starting point to begin a new walk.')}>Start a new walk</button>
        </>}

        <div className="utility-row">
          {active && <button className="text-button" onClick={() => dispatch({ type: 'WHERE' })}>Where am I</button>}
          {state.phase !== 'idle' && <button className="text-button" onClick={() => dispatch({ type: 'REPEAT' })}>↻ Repeat</button>}
          {active && <button className="text-button stop" onClick={() => stop()}>Stop route</button>}
          {state.phase === 'idle' && !setupOpen && <button className="text-button" onClick={() => setSetupOpen(true)}>Phone setup</button>}
          <label className="checkbox voice-toggle"><input type="checkbox" checked={voice} onChange={e => { voiceRef.current = e.target.checked; setVoice(e.target.checked); if (!e.target.checked) speaker.current?.mute() }} />App voice</label>
        </div>
        <label className="checkbox obstacle-toggle"><input type="checkbox" checked={obstaclesOn} onChange={e => toggleObstacles(e.target.checked)} />Obstacle alerts</label>
        <p className="hint">{obstacleNote} Turn app voice off to listen with your screen reader.</p>
        {blockedAudio && voice && state.phase !== 'idle' && <div role="status"><p>Audio is paused or unavailable. You can read the instruction above.</p><button className="secondary" onClick={() => dispatch({ type: 'REPEAT' })}>Play instruction</button></div>}
        <audio ref={audio} preload="none" onPlay={() => recognition.current?.abort()} />
        {/* Fixed-size frame: iOS Safari mis-sizes camera video whose box depends on the stream's own dimensions. */}
        <div className="camera-frame" hidden={!active && !starting}><video ref={video} muted playsInline aria-label="Rear camera; photos sent every few seconds during the walk" /></div>
        {active && <details className="commands"><summary>Voice and typed commands</summary><p>Say or type next, yes, no, repeat, where am I, or stop. Voice recognition may send audio to your browser’s speech service.</p>
          {speechConstructor() ? <button className="secondary" disabled={listening} onClick={listen}>{listening ? 'Listening…' : 'Press to speak one command'}</button> : <p>Voice recognition is unavailable in this browser. Use the buttons or type a command.</p>}
          <form onSubmit={e => { e.preventDefault(); execute(command) }}><label htmlFor="command">Type a command</label><div className="command-row"><input id="command" value={command} onChange={e => setCommand(e.target.value)} autoComplete="off" /><button className="secondary" type="submit">Send command</button></div></form><p role="status">{commandNotice}</p>
        </details>}
        {metrics.current.length > 0 && <details className="session"><summary>Session record</summary><p>{state.overrides} manual overrides. Timing and counts only; no photos or audio recordings.</p><button className="secondary" onClick={() => downloadMetrics(metrics.current)}>Download session metrics</button></details>}
      </section>
    </div>
  </>
}
