import { useEffect, useRef, useState } from 'react'
import { getJSON, replay } from './api'
import { initial, parseCommand, transition, type Event, type State } from './machine'
import { downloadMetrics, type Metric } from './metrics'
import { capturePhoto } from './capture'
import { speechConstructor, type Recognition } from './speech'
import type { Assets, Route } from './types'

const OVERRIDE = 'Continue using saved directions without visual verification?'
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.'

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
  const assetsRef = useRef<Assets | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [providerLabel, setProviderLabel] = useState('the configured visual AI provider')
  const [state, setState] = useState<State>(initial)
  const stateRef = useRef(state)
  const [consent, setConsent] = useState(false)
  const [starting, setStarting] = useState(false)
  const startingRef = useRef(false)
  const [online, setOnline] = useState(navigator.onLine)
  const [voice, setVoice] = useState(true)
  const voiceRef = useRef(true)
  const [blockedAudio, setBlockedAudio] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [command, setCommand] = useState('')
  const [commandNotice, setCommandNotice] = useState('')
  const [listening, setListening] = useState(false)
  const [captureNotice, setCaptureNotice] = useState('')
  const video = useRef<HTMLVideoElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const request = useRef<AbortController | null>(null)
  const generation = useRef(0)
  const audioGeneration = useRef(0)
  const requestBusy = useRef(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const recognition = useRef<Recognition | null>(null)
  const metrics = useRef<Metric[]>([])
  const active = state.phase !== 'idle' && state.phase !== 'arrived'
  const checking = state.phase === 'checking' || state.phase === 'checkingOrigin'
  const confirming = ['confirmOrigin', 'confirm', 'override'].includes(state.phase)
  const step = route?.steps[state.index]
  const lastLandmark = state.lastConfirmed < 0 ? assets?.origin.description : route?.steps[state.lastConfirmed]?.landmark

  function record(event: Metric['event'], s = stateRef.current, extra: Partial<Metric> = {}) {
    metrics.current.push({ event, step: s.index, at: new Date().toISOString(), sample: assetsRef.current?.sample, ...extra })
  }

  function send(event: Event) {
    const previous = stateRef.current
    const next = transition(previous, event, route?.steps.length ?? 0)
    if (next === previous) return
    stateRef.current = next // Synchronous guard against duplicate Yes / voice events.
    setState(next)
    if (event.type === 'YES' && previous.phase === 'override') record('manual_override', previous)
    else if (event.type === 'YES') record('confirmation', previous)
    if (next.phase === 'fallback' && previous.phase !== 'fallback' && previous.phase !== 'override') record('lost_track', next)
    if (next.phase === 'arrived') { record('arrival', next); releaseCamera() }
  }

  function releaseCamera() {
    if (stream.current) {
      for (const track of stream.current.getTracks()) { track.onended = null; track.stop() }
      stream.current = null
    }
    if (video.current) video.current.srcObject = null
  }

  function stop(message = 'Route stopped. Check the starting point again to start a new walk.') {
    generation.current++
    request.current?.abort()
    requestBusy.current = false
    startingRef.current = false
    setStarting(false)
    recognition.current?.abort()
    audioGeneration.current++
    audio.current?.pause()
    setBlockedAudio(false)
    releaseCamera()
    if (stateRef.current.phase !== 'idle') record('stop')
    send({ type: 'RESET', message })
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
      assetsRef.current = metadata
      setRoute(selected); setAssets(metadata)
    } catch (error) { setLoadError(errorText(error)) }
    finally { setLoading(false) }
  }

  useEffect(() => { void loadRoutes() }, [])
  useEffect(() => {
    const network = () => setOnline(navigator.onLine)
    const hide = () => {
      if (document.visibilityState === 'hidden' && (stateRef.current.phase !== 'idle' || startingRef.current)) {
        stop('The app was paused. Check the starting point again before continuing.')
      }
    }
    const pageHide = () => stop('Check the starting point again before continuing.')
    window.addEventListener('online', network); window.addEventListener('offline', network)
    document.addEventListener('visibilitychange', hide); window.addEventListener('pagehide', pageHide)
    return () => {
      window.removeEventListener('online', network); window.removeEventListener('offline', network)
      document.removeEventListener('visibilitychange', hide); window.removeEventListener('pagehide', pageHide)
      generation.current++; request.current?.abort(); releaseCamera(); recognition.current?.abort()
    }
  }, [])

  useEffect(() => {
    if (!checking && (state.phase !== 'idle' || state.message)) heading.current?.focus()
  }, [state.phase, state.index])

  function currentAudio() {
    if (!assets) return ''
    if (state.phase === 'originFailed') return assets.origin_retry_audio
    if (state.phase === 'confirmOrigin') return assets.origin_audio
    if (state.phase === 'confirm') return assets.steps[state.index]?.question ?? ''
    if (state.phase === 'walking') return assets.steps[state.index]?.instruction ?? ''
    if (state.phase === 'fallback') return assets.fallback_audio[String(state.lastConfirmed)] ?? ''
    if (state.phase === 'override') return assets.override_audio
    if (state.phase === 'arrived' && !state.finalUnverified) return assets.arrival_audio
    return ''
  }
  const cue = currentAudio()

  async function play(url = cue) {
    if (!url || !audio.current || !voiceRef.current) return
    recognition.current?.abort()
    const token = ++audioGeneration.current
    const player = audio.current
    player.pause(); player.src = url; player.muted = false
    try { await player.play(); if (token === audioGeneration.current) setBlockedAudio(false) }
    catch { if (token === audioGeneration.current) setBlockedAudio(true) }
  }

  useEffect(() => {
    audioGeneration.current++
    audio.current?.pause()
    setBlockedAudio(false)
    if (voice && cue) void play(cue)
  }, [cue, voice])

  async function start() {
    if (startingRef.current || stateRef.current.phase !== 'idle' || !consent || !route || !assets) return
    startingRef.current = true; setStarting(true)
    const token = ++generation.current
    metrics.current = []
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
      if (token !== generation.current) { acquired.getTracks().forEach(t => t.stop()); return }
      stream.current = acquired
      if (!video.current) throw new Error('Camera preview is unavailable.')
      video.current.muted = true
      video.current.playsInline = true
      video.current.setAttribute('muted', '')
      video.current.srcObject = acquired
      try { await video.current.play() }
      catch { throw new Error('Camera preview could not play. Tap Start again, or reopen this page in Safari.') }
      if (token !== generation.current) {
        acquired.getTracks().forEach(t => t.stop())
        if (stream.current === acquired) releaseCamera()
        return
      }
      for (const track of acquired.getVideoTracks()) track.onended = () => stop('Camera connection was lost. Restart and check the starting point again.')
      send({ type: 'START' }); record('start')
    } catch (error) {
      if (token === generation.current) {
        releaseCamera()
        const text = error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Allow camera access in Safari settings, then try again.' : errorText(error)
        send({ type: 'RESET', message: text })
      }
    } finally {
      if (token === generation.current) { startingRef.current = false; setStarting(false) }
    }
  }

  async function check() {
    if (requestBusy.current || !route || !video.current) return
    const before = stateRef.current
    if (!['origin', 'originFailed', 'walking', 'fallback'].includes(before.phase)) return
    requestBusy.current = true
    send({ type: 'CHECK' })
    const token = generation.current, index = before.index, began = performance.now()
    const controller = new AbortController(); request.current = controller
    const valid = () => token === generation.current && !controller.signal.aborted
    try {
      if (!navigator.onLine) throw new Error('You are offline. Visual checking needs a connection to the laptop.')
      const images: string[] = []
      const count = index === -1 ? 3 : 1
      for (let i = 0; i < count; i++) {
        if (!valid()) return
        setCaptureNotice(count === 3 ? `Taking starting-point photo ${i + 1} of 3. Keep the starting landmark in view.` : 'Taking a photo and checking the checkpoint.')
        images.push(capturePhoto(video.current))
        if (i < count - 1) await new Promise(resolve => setTimeout(resolve, 1000))
      }
      let matches = 0
      for (let i = 0; i < images.length; i++) {
        if (!valid()) return
        setCaptureNotice(`Checking photo ${i + 1} of ${count}.`)
        const result = await replay(route.route_id, index, images[i], controller.signal)
        images[i] = ''
        if (!valid()) return
        matches += Number(result.matched)
      }
      const matched = index === -1 ? matches >= 2 : matches === 1
      record('visual_check', before, { duration_ms: Math.round(performance.now() - began), matched })
      send({ type: 'RESULT', matched })
    } catch (error) {
      if (valid()) send({ type: 'ERROR', message: errorText(error) })
    } finally {
      if (token === generation.current) { requestBusy.current = false; setCaptureNotice('') }
    }
  }

  function execute(text: string) {
    const parsed = parseCommand(text)
    setCommand('')
    if (!parsed) { setCommandNotice('Use one command: yes, no, repeat, next, or stop.'); return }
    setCommandNotice(`Command: ${parsed}.`)
    if (parsed === 'stop') { stop(); return }
    if (parsed === 'repeat') { void play(); return }
    const event = { type: parsed.toUpperCase() } as Event
    if (transition(stateRef.current, event, route?.steps.length ?? 0) === stateRef.current) {
      setCommandNotice(`“${parsed}” is not available at this point. Use the current checkpoint controls.`)
      return
    }
    send(event)
  }

  function listen() {
    const Constructor = speechConstructor()
    if (!Constructor || speaking || listening || !audio.current?.paused) return
    const recognizer = new Constructor()
    recognition.current = recognizer
    recognizer.lang = 'en-US'; recognizer.continuous = false; recognizer.interimResults = false
    recognizer.onresult = e => { recognizer.abort(); setListening(false); execute(e.results[0][0].transcript) }
    recognizer.onerror = () => { setListening(false); setCommandNotice('Voice command unavailable. Use buttons or type a command.') }
    recognizer.onend = () => setListening(false)
    try { setListening(true); recognizer.start() }
    catch { setListening(false); setCommandNotice('Voice command unavailable. Use buttons or type a command.') }
  }

  const title = state.phase === 'idle' ? 'A familiar route starts here.'
    : state.phase === 'arrived' ? state.finalUnverified ? 'Saved route finished.' : 'You have arrived.'
    : state.index < 0 ? 'First, confirm your starting point.'
    : state.phase === 'fallback' ? 'Let’s find your place.'
    : state.phase === 'override' ? 'Continue without a visual check?'
    : `Checkpoint ${state.index + 1} of ${route?.steps.length}`
  const instruction = state.index < 0 ? assets?.origin_instruction : step?.instruction
  const question = state.phase === 'confirmOrigin' ? assets?.origin.question
    : state.phase === 'confirm' ? assets?.checkpoint_questions[state.index]
    : state.phase === 'override' ? OVERRIDE : ''
  const fallbackText = `I lost track, slowly turn left or right. Last confirmed: ${lastLandmark}.`

  return <>
    <a href="#main" className="skip">Skip to route controls</a>
    <header className="topbar"><a className="brand" href="/" aria-label="Day One home"><span className="brand-mark" aria-hidden="true">d.</span>day one<span className="brand-by">by Offixed</span></a><span className="prototype">FIELD PROTOTYPE · 01</span></header>
    <main id="main">
      <div className="intro"><p className="eyebrow">YOUR FIRST DAY. YOUR OWN PACE.</p><h1>A little familiarity.<br /><span>A little more independence.</span></h1><p>A route taught by someone you know.<br className="desktop-break" /> One checkpoint at a time, confirmed by you.</p></div>
      <div className="workspace">
        <section className="route-card" aria-labelledby="route-heading">
          <div className="route-label"><span className="eyebrow">YOUR SAVED WALK</span><span className="route-tag">ONE WAY</span></div>
          <h2 id="route-heading">{assets?.origin_label ?? 'Starting point'} <span aria-hidden="true">↗</span> Toilet</h2>
          <p className="muted">{route ? `${route.steps.length} checkpoints` : 'A route reviewed by your guide'} · English</p>
          <ol className="route-map" aria-label="Route progress">
            <li className={state.index >= 0 ? 'done' : 'current'}><span className="dot" aria-hidden="true" /><span>{assets?.origin_label ?? 'Starting point'}<small>{state.index >= 0 ? 'Confirmed by you' : 'Confirm your starting point'}</small></span></li>
            {(route?.steps ?? []).map((s, i) => <li key={s.id} className={i < state.index || state.phase === 'arrived' ? 'done' : i === state.index ? 'current' : ''} aria-current={i === state.index && active ? 'step' : undefined}><span className="dot" aria-hidden="true">{i + 1}</span><span>{i === route!.steps.length - 1 ? 'Toilet entrance' : `Checkpoint ${i + 1}`}<small>{i === state.lastConfirmed ? 'Last confirmed by you' : i === state.index && active ? 'Your current checkpoint' : 'Saved by your guide'}</small></span></li>)}
          </ol>
          <div className="note"><span aria-hidden="true">✦</span><p>You set the pace.<br />The next step always waits for you.</p></div>
        </section>

        <section className="control-card" aria-labelledby="status-heading">
          <div className="control-top"><span className="eyebrow">{state.index < 0 ? 'STARTING POINT' : state.phase === 'arrived' ? 'WALK COMPLETE' : 'YOUR NEXT STEP'}</span><span className={`connection ${online ? '' : 'offline'}`}>{online ? 'Online' : 'Offline'}</span></div>
          {assets?.sample && <p className="sample" role="note">Illustrative sample route. These directions are not verified for this building.</p>}
          {!online && <p role="status" className="error">Connection lost. Visual checks need the laptop and internet. Offline location is unavailable.</p>}
          <div className="status-copy" aria-live="polite" aria-atomic="true">
            <h2 id="status-heading" tabIndex={-1} ref={heading}>{title}</h2>
            {state.phase === 'idle' ? <p>Begin at {assets?.origin_label ?? 'the saved starting point'}. We’ll check the starting point before giving you directions.</p>
              : state.phase === 'arrived' ? <p>{state.finalUnverified ? 'Arrival has not been visually verified. Camera stopped.' : assets?.arrival}</p>
              : state.phase === 'fallback' ? <p className="instruction">{fallbackText}</p>
              : <p className="instruction">{instruction}</p>}
            {step?.voice_cue && active && <p className="guide-cue">Your guide said: “{step.voice_cue}”</p>}
            {state.message && <p className="error">{state.message}</p>}
            {question && <p className="question">{question}</p>}
            {checking && <p className="checking">{captureNotice || 'Checking your photo…'}</p>}
          </div>

          {state.phase === 'idle' && <>
            <div className="privacy-note"><h3>A photo only when you ask.</h3><p>Each photo is sent to {providerLabel} for a landmark check. Use an agreed filming area and avoid bystanders and private information. Replay photos are not saved by this app.</p></div>
            <label className="checkbox"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />I agree to send these photos for visual checks.</label>
            {loading && <p role="status">Loading your reviewed route…</p>}
            {loadError && <><p role="alert" className="error">{loadError}</p><button className="secondary" onClick={() => void loadRoutes()}>Reload routes</button></>}
            <button className="primary start" disabled={!consent || !route || !assets || starting || !online} onClick={() => void start()}>{starting ? 'Preparing camera…' : 'Start this walk'}<span aria-hidden="true">↗</span></button>
            {starting && <button className="secondary" onClick={() => stop('Camera setup stopped.')}>Cancel camera setup</button>}
          </>}

          {active && <div className="actions">
            {['origin', 'originFailed', 'walking', 'fallback'].includes(state.phase) && <button className="primary" onClick={() => void check()}>{state.index < 0 ? 'Check starting point · 3 photos' : state.phase === 'fallback' ? 'Retry checkpoint' : 'Check checkpoint'}</button>}
            {checking && <button className="primary" disabled>Checking photos…</button>}
            {confirming && <div className="button-row"><button className="primary" onClick={() => send({ type: 'YES' })}>{state.phase === 'override' ? 'Yes, use saved directions' : 'Yes, I’m here'}</button><button className="secondary" onClick={() => send({ type: 'NO' })}>No / unsure</button></div>}
            {state.phase === 'fallback' && <button className="secondary" onClick={() => send({ type: 'NEXT' })}>Next · use saved directions</button>}
          </div>}
          {state.phase === 'arrived' && <button className="primary" onClick={() => stop('Check the starting point to begin a new walk.')}>Start a new walk</button>}

          <div className="utility-row">
            {cue && <button className="text-button" disabled={!voice} onClick={() => void play()}>↻ Repeat</button>}
            {active && <button className="text-button stop" onClick={() => stop()}>Stop route</button>}
            <label className="checkbox voice-toggle"><input type="checkbox" checked={voice} onChange={e => { voiceRef.current = e.target.checked; setVoice(e.target.checked); if (!e.target.checked) { audioGeneration.current++; audio.current?.pause() } }} />App voice</label>
          </div>
          <p className="hint">Turn app voice off to listen with your screen reader.</p>
          {blockedAudio && voice && <div role="status"><p>Audio is paused or unavailable. You can read the instruction above.</p><button className="secondary" onClick={() => void play()}>Play instruction</button></div>}
          <audio ref={audio} preload="none" onPlay={() => { setSpeaking(true); recognition.current?.abort() }} onPause={() => setSpeaking(false)} onEnded={() => setSpeaking(false)} onError={() => { if (voiceRef.current && cue) setBlockedAudio(true) }} />
          {/* Fixed-size frame: iOS Safari mis-sizes camera video whose box depends on the stream's own dimensions. */}
          <div className="camera-frame" hidden={!active && !starting}><video ref={video} muted playsInline aria-label="Rear camera preview; no continuous upload" /></div>
          {active && <details className="commands"><summary>Voice and typed commands</summary><p>Say or type yes, no, repeat, next, or stop. Voice recognition may send audio to your browser’s speech service.</p>
            {speechConstructor() ? <button className="secondary" disabled={speaking || listening} onClick={listen}>{listening ? 'Listening…' : 'Press to speak one command'}</button> : <p>Voice recognition is unavailable in this browser. Use the buttons or type a command.</p>}
            <form onSubmit={e => { e.preventDefault(); execute(command) }}><label htmlFor="command">Type a command</label><div className="command-row"><input id="command" value={command} onChange={e => setCommand(e.target.value)} autoComplete="off" /><button className="secondary" type="submit">Send command</button></div></form><p role="status">{commandNotice}</p>
          </details>}
          {metrics.current.length > 0 && <details className="session"><summary>Session record</summary><p>{state.overrides} manual overrides. Timing and button events only; no photos or audio recordings.</p><button className="secondary" onClick={() => downloadMetrics(metrics.current)}>Download session metrics</button></details>}
        </section>
      </div>
      <footer><p><strong>Wayfinding aid, not a safety device.</strong> Keep using your cane and usual mobility support.</p><p>OFFIXED <span aria-hidden="true">/</span> ADC HACKATHON 2026</p></footer>
    </main>
  </>
}
