import { useEffect, useRef, useState } from 'react'
import { getJSON, observe, speechUrl } from './api'
import { capturePhoto } from './capture'
import { createFrameLoop, observeConsumer, type ObserveOutcome } from './frameLoop'
import { initial, looping, parseCommand, transition, type Event, type Output, type Say, type State } from './machine'
import { downloadMetrics, newStepStats, summarize, type Metric } from './metrics'
import { speechConstructor, type Recognition } from './speech'
import type { Assets, Route } from './types'
import { createVoice, type Voice } from './voice'

const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.'
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
type Input = Event extends infer E ? E extends Event ? Omit<E, 'at'> : never : never
type Live = { text: string; n: number }
const WAITING = ['atOrigin', 'reached', 'lost', 'override']

function silence() {
  const bytes = new Uint8Array(844), view = new DataView(bytes.buffer)
  const write = (offset: number, text: string) => [...text].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)))
  write(0, 'RIFF'); view.setUint32(4, 836, true); write(8, 'WAVEfmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, 8000, true); view.setUint32(28, 8000, true); view.setUint16(32, 1, true)
  view.setUint16(34, 8, true); write(36, 'data'); view.setUint32(40, 800, true); bytes.fill(128, 44)
  return URL.createObjectURL(new Blob([bytes], { type: 'audio/wav' }))
}

export default function App() {
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
  const [live, setLive] = useState<Live>({ text: '', n: 0 }) // Latest P1 sentence, always shown.
  const [hint, setHint] = useState<Live>({ text: '', n: 0 }) // Hints as text when App voice is off.
  const video = useRef<HTMLVideoElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const primary = useRef<HTMLButtonElement>(null)
  const recognition = useRef<Recognition | null>(null)
  const metrics = useRef<Metric[]>([])
  const stats = useRef(newStepStats(-1))
  const speaker = useRef<Voice | null>(null)
  const loop = useRef<ReturnType<typeof createFrameLoop> | null>(null)
  const dispatchRef = useRef(dispatch)
  const outcomeRef = useRef(outcome)
  dispatchRef.current = dispatch
  outcomeRef.current = outcome

  const active = state.phase !== 'idle' && state.phase !== 'arrived'
  const count = route?.steps.length ?? 0
  const names = assets?.steps.map(s => s.short_name) ?? []
  const phrase = (key: string) => assets?.phrases[key] ?? ''

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
    if (!looping(next.phase)) setHint(h => h.text ? { text: '', n: h.n + 1 } : h) // Old hints no longer apply.
    if (next.phase === 'arrived') releaseCamera()
  }

  function say({ key, priority }: Say) {
    if (priority !== 2) setLive(l => ({ text: assetsRef.current?.phrases[key] ?? '', n: l.n + 1 }))
    const accepted = speaker.current?.say(key, priority) ?? false
    if (priority === 2 && accepted) stats.current.hints_spoken++
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
      const { target, position, distance } = o.result
      dispatch({ type: 'OBSERVATION', step_index: o.index, generation: o.generation, target, position, distance })
    } else dispatch({ type: 'OBSERVE_ERROR', step_index: o.index, generation: o.generation, offline: o.offline })
  }

  function releaseCamera() {
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
    dispatch({ type: 'RESET', message })
  }

  async function loadRoutes() {
    setLoading(true); setLoadError('')
    try {
      const routes = await getJSON<Route[]>('/routes')
      if (!routes.length) { setLoadError('No reviewed route is available yet. Ask your route guide to prepare the saved route.'); return }
      const selected = routes[0]
      const metadata = await getJSON<Assets>(`/routes/${selected.route_id}/assets`)
      const health = await getJSON<{ provider_label: string }>('/health')
      setProviderLabel(health.provider_label)
      routeRef.current = selected; assetsRef.current = metadata
      setRoute(selected); setAssets(metadata)
    } catch (error) { setLoadError(errorText(error)) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    speaker.current = createVoice(audio.current!, {
      url: key => speechUrl(routeRef.current?.route_id ?? '', key),
      text: key => assetsRef.current?.phrases[key] ?? '',
      onDone: key => { dispatchRef.current({ type: 'AUDIO_DONE', key }) },
      onText: (text, priority) => { if (priority === 2) setHint(h => ({ text, n: h.n + 1 })) },
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
    }
  }, [])

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => dispatchRef.current({ type: 'TICK' }), 1000)
    return () => clearInterval(timer)
  }, [active])

  useEffect(() => {
    // Waiting states put focus on the one action, so a VoiceOver double-tap anywhere activates it.
    if (WAITING.includes(state.phase)) primary.current?.focus()
    else if (state.phase !== 'idle' || state.message) heading.current?.focus()
  }, [state.phase, state.index])

  async function start() {
    if (startingRef.current || stateRef.current.phase !== 'idle' || !consent || !route || !assets) return
    startingRef.current = true; setStarting(true)
    const token = ++startToken.current
    metrics.current = []; stats.current = newStepStats(-1)
    // Unlock the same audio element in the user gesture, using silence only.
    if (audio.current && voiceRef.current) {
      const url = silence(), player = audio.current
      player.src = url
      void player.play().catch(() => {}).finally(() => URL.revokeObjectURL(url))
    }
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
        const text = error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in Safari settings, then try again.' : errorText(error)
        dispatch({ type: 'RESET', message: text })
      }
    } finally {
      if (token === startToken.current) { startingRef.current = false; setStarting(false) }
    }
  }

  function execute(text: string) {
    const parsed = parseCommand(text)
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
  const direction = (state.phase === 'walking' || state.phase === 'lost') && state.lastP1 !== `s${i}-instruction` ? phrase(`s${i}-instruction`) : ''
  const stepNote = (n: number) => state.phase === 'arrived' || n < i || (n === i && state.phase === 'reached') ? 'Passed'
    : n === i && active ? state.phase === 'lost' ? 'Searching' : 'Heading here' : 'Saved by your guide'

  return <>
    <a href="#main" className="skip">Skip to route controls</a>
    <header className="topbar"><a className="brand" href="/" aria-label="Day One home"><span className="brand-mark" aria-hidden="true">d.</span>day one<span className="brand-by">by Offixed</span></a><span className="prototype">FIELD PROTOTYPE · 02</span></header>
    <main id="main">
      <div className="intro"><p className="eyebrow">YOUR FIRST DAY. YOUR OWN PACE.</p><h1>A little familiarity.<br /><span>A little more independence.</span></h1><p>A route taught by someone you know.<br className="desktop-break" /> The camera finds each landmark; you decide when to move on.</p></div>
      <div className="workspace">
        <section className="route-card" aria-labelledby="route-heading">
          <div className="route-label"><span className="eyebrow">YOUR SAVED WALK</span><span className="route-tag">ONE WAY</span></div>
          <h2 id="route-heading">{assets?.origin_label ?? 'Starting point'} <span aria-hidden="true">↗</span> Toilet</h2>
          <p className="muted">{route ? `${count} checkpoints` : 'A route reviewed by your guide'} · English</p>
          <ol className="route-map" aria-label="Route progress">
            <li className={i >= 0 || state.phase === 'atOrigin' || state.phase === 'arrived' ? 'done' : 'current'}><span className="dot" aria-hidden="true" /><span>{assets?.origin_label ?? 'Starting point'}<small>{i >= 0 || state.phase === 'atOrigin' ? 'Found by the camera' : 'Find your starting point'}</small></span></li>
            {(route?.steps ?? []).map((s, n) => <li key={s.id} className={stepNote(n) === 'Passed' ? 'done' : n === i && active ? 'current' : ''} aria-current={n === i && active ? 'step' : undefined}><span className="dot" aria-hidden="true">{n + 1}</span><span>{capitalize(names[n] ?? `Checkpoint ${n + 1}`)}<small>{stepNote(n)}</small></span></li>)}
          </ol>
          <div className="note"><span aria-hidden="true">✦</span><p>You set the pace.<br />The next step always waits for you.</p></div>
        </section>

        <section className="control-card" aria-labelledby="status-heading">
          <div className="control-top"><span className="eyebrow">{i < 0 ? 'STARTING POINT' : state.phase === 'arrived' ? 'WALK COMPLETE' : 'YOUR NEXT STEP'}</span><span className={`connection ${online ? '' : 'offline'}`}>{online ? 'Online' : 'Offline'}</span></div>
          {assets?.sample && <p className="sample" role="note">Illustrative sample route. These directions are not verified for this building.</p>}
          {!online && <p role="status" className="error">Connection lost. Camera checks need the laptop and internet. Offline location is unavailable.</p>}
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
            <div className="privacy-note"><h3>Photos only while you walk.</h3><p>While a walk is active, the camera sends about one photo every 1–3 seconds to {providerLabel} to find landmarks. Photos can include people nearby — use an agreed area. Photos are not saved by this app. The camera stops when you arrive, press Stop or leave the app.</p></div>
            <label className="checkbox"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I agree to send photos continuously during the walk.</label>
            {loading && <p role="status">Loading your reviewed route…</p>}
            {loadError && <><p role="alert" className="error">{loadError}</p><button className="secondary" onClick={() => void loadRoutes()}>Reload routes</button></>}
            <button className="primary start" disabled={!consent || !route || !assets || starting || !online} onClick={() => void start()}>{starting ? 'Preparing camera…' : 'Start this walk'}<span aria-hidden="true">↗</span></button>
            {starting && <button className="secondary" onClick={() => stop('Camera setup stopped.')}>Cancel camera setup</button>}
          </>}

          {active && <div className="actions">
            {showNext && <button ref={primary} className="primary next" onClick={() => dispatch({ type: 'NEXT' })}>Next</button>}
            {state.phase === 'override' && <div className="button-row">
              <button ref={primary} className="primary" onClick={() => dispatch({ type: 'YES' })}>Yes, use saved directions</button>
              <button className="secondary" onClick={() => dispatch({ type: 'NO' })}>No, keep looking</button>
            </div>}
          </div>}
          {state.phase === 'arrived' && <button className="primary" onClick={() => stop('Start at the starting point to begin a new walk.')}>Start a new walk</button>}

          <div className="utility-row">
            {active && <button className="text-button" onClick={() => dispatch({ type: 'WHERE' })}>Where am I</button>}
            {state.phase !== 'idle' && <button className="text-button" onClick={() => dispatch({ type: 'REPEAT' })}>↻ Repeat</button>}
            {active && <button className="text-button stop" onClick={() => stop()}>Stop route</button>}
            <label className="checkbox voice-toggle"><input type="checkbox" checked={voice} onChange={e => { voiceRef.current = e.target.checked; setVoice(e.target.checked); if (!e.target.checked) speaker.current?.mute() }} />App voice</label>
          </div>
          <p className="hint">Turn app voice off to listen with your screen reader.</p>
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
      <footer><p><strong>Wayfinding aid, not a safety device.</strong> Keep using your cane and usual mobility support.</p><p>OFFIXED <span aria-hidden="true">/</span> ADC HACKATHON 2026</p></footer>
    </main>
  </>
}
