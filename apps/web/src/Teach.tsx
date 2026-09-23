import { useEffect, useRef, useState } from 'react'
import { appSpeechUrl, guideAccess, guideCode, listDrafts, setGuideCode, teachStatus, uploadWalk } from './api'
import { APP_TEXT } from './appPhrases'
import { speechConstructor } from './speech'
import type { DraftSummary, TeachJob } from './types'

type Stage = 'checking' | 'locked' | 'ready' | 'recording' | 'sending' | 'learning' | 'learned' | 'failed'
type Segment = { start: number; end: number; text: string }
type ContinuousResult = { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }

const MAX_SECONDS = 170 // The laptop accepts up to 180 s; stop a little early.
const POLL_MS = 1500
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.'
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

function recorderType() {
  if (typeof MediaRecorder === 'undefined') return null
  // Safari records MP4; Chrome and Firefox record WebM. The laptop accepts both.
  return ['video/mp4;codecs=avc1,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp8,opus', 'video/webm']
    .find(type => MediaRecorder.isTypeSupported?.(type)) ?? ''
}

export default function Teach() {
  const [stage, setStage] = useState<Stage>('checking')
  const [pinConfigured, setPinConfigured] = useState(false)
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState('')
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [consent, setConsent] = useState(false)
  const [phoneTranscript, setPhoneTranscript] = useState(false)
  const [voice, setVoice] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [heard, setHeard] = useState(0)
  const [progress, setProgress] = useState(0)
  const [job, setJob] = useState<TeachJob | null>(null)
  const [drafts, setDrafts] = useState<DraftSummary[]>([])
  const [status, setStatus] = useState('')
  const video = useRef<HTMLVideoElement>(null)
  const audio = useRef<HTMLAudioElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const segments = useRef<Segment[]>([])
  const recognizer = useRef<{ stop(): void } | null>(null)
  const started = useRef(0)
  const timer = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const upload = useRef<AbortController | null>(null)
  const alive = useRef(true)

  function speak(key: string) {
    setStatus(APP_TEXT[key])
    if (!voice || !audio.current) return
    audio.current.src = appSpeechUrl(key)
    void audio.current.play().catch(() => {}) // Text stays on screen when audio is blocked.
  }

  async function check() {
    setStage('checking'); setNotice('')
    try {
      const access = await guideAccess()
      setPinConfigured(access.pin_configured)
      if (access.allowed) { setStage('ready'); void refreshDrafts() }
      else {
        if (guideCode()) { setGuideCode(''); setNotice('That guide code did not work.') }
        setStage('locked')
      }
    } catch (error) { setNotice(errorText(error)); setStage('locked') }
  }

  async function refreshDrafts() {
    try { setDrafts(await listDrafts()) } catch { setDrafts([]) }
  }

  useEffect(() => {
    void check()
    return () => { alive.current = false; cleanup(); upload.current?.abort() }
  }, [])

  useEffect(() => { heading.current?.focus() }, [stage])

  function cleanup() {
    clearInterval(timer.current)
    recognizer.current?.stop(); recognizer.current = null
    if (recorder.current && recorder.current.state !== 'inactive') { recorder.current.onstop = null; recorder.current.stop() }
    recorder.current = null
    stream.current?.getTracks().forEach(t => t.stop()); stream.current = null
    if (video.current) video.current.srcObject = null
  }

  function listenAlong() {
    const Constructor = speechConstructor()
    if (!Constructor) return
    let stopped = false, lastEnd = 0
    const start = () => {
      const r = new Constructor()
      r.lang = 'en-US'; r.continuous = true; r.interimResults = false
      r.onresult = event => {
        const e = event as unknown as ContinuousResult
        const now = Math.round((performance.now() - started.current) / 100) / 10
        for (let n = e.resultIndex; n < e.results.length; n++) {
          const text = e.results[n][0]?.transcript.trim()
          if (!e.results[n].isFinal || !text) continue
          const begin = Math.max(lastEnd, now - 8)
          segments.current.push({ start: begin, end: Math.max(begin, now), text })
          lastEnd = Math.max(begin, now)
          setHeard(segments.current.length)
        }
      }
      r.onerror = () => { stopped = true } // Microphone busy or not allowed: the laptop transcribes instead.
      r.onend = () => { if (!stopped && recorder.current?.state === 'recording') { try { start() } catch { stopped = true } } }
      try { r.start() } catch { stopped = true }
      recognizer.current = { stop() { stopped = true; r.abort() } }
    }
    start()
  }

  async function record() {
    if (!origin.trim() || !destination.trim()) { setNotice('Name the starting place and the destination first.'); return }
    if (!consent) { setNotice('Confirm that everyone in view agreed to be filmed.'); return }
    const type = recorderType()
    if (type === null || !navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setNotice('This browser cannot record video here. Open the trusted HTTPS address in Safari or Chrome.'); return
    }
    setNotice(''); speak('teach-recording') // In the tap, which also unlocks later announcements.
    try {
      const acquired = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: true,
      })
      stream.current = acquired
      if (video.current) { video.current.muted = true; video.current.srcObject = acquired; await video.current.play().catch(() => {}) }
      chunks.current = []; segments.current = []; setHeard(0)
      const rec = new MediaRecorder(acquired, { ...(type && { mimeType: type }), videoBitsPerSecond: 2_500_000 })
      rec.ondataavailable = e => { if (e.data.size) chunks.current.push(e.data) }
      recorder.current = rec
      rec.start(1000)
      started.current = performance.now(); setElapsed(0)
      timer.current = setInterval(() => {
        const seconds = (performance.now() - started.current) / 1000
        setElapsed(seconds)
        if (seconds >= MAX_SECONDS) void finish()
      }, 500)
      if (phoneTranscript) listenAlong()
      setStage('recording')
    } catch (error) {
      cleanup()
      setNotice(error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Camera or microphone permission was denied. Allow both in the browser settings, then try again.' : errorText(error))
      setStage('ready')
    }
  }

  function stopRecorder(): Promise<Blob | null> {
    const rec = recorder.current
    if (!rec || rec.state === 'inactive') return Promise.resolve(null)
    return new Promise(resolve => {
      rec.onstop = () => resolve(new Blob(chunks.current, { type: rec.mimeType || 'video/mp4' }))
      rec.stop()
    })
  }

  async function finish() {
    if (recorder.current?.state !== 'recording') return
    clearInterval(timer.current)
    recognizer.current?.stop(); recognizer.current = null
    const blob = await stopRecorder()
    cleanup()
    if (!blob || blob.size < 1000) { setNotice('Nothing was recorded. Try again.'); setStage('ready'); return }
    speak('teach-learning')
    setStage('sending'); setProgress(0)
    const form = new FormData()
    form.append('video', blob, blob.type.includes('webm') ? 'walk.webm' : 'walk.mp4')
    form.append('origin_label', origin.trim()); form.append('destination_label', destination.trim())
    if (segments.current.length) form.append('live_transcript', JSON.stringify(segments.current))
    upload.current = new AbortController()
    try {
      const accepted = await uploadWalk(form, setProgress, upload.current.signal)
      setJob(accepted); setStage('learning')
      await poll(accepted.job_id)
    } catch (error) {
      if (!alive.current) return
      setNotice(errorText(error)); setStage('failed'); speak('teach-failed')
    }
  }

  async function poll(id: string) {
    const deadline = Date.now() + 5 * 60_000
    while (alive.current && Date.now() < deadline) {
      await new Promise(resolve => setTimeout(resolve, POLL_MS))
      const current = await teachStatus(id)
      if (!alive.current) return
      setJob(current)
      if (current.status === 'learned') { setStage('learned'); speak('teach-learned'); void refreshDrafts(); return }
      if (current.status === 'failed') { setNotice(current.message); setStage('failed'); speak('teach-failed'); return }
    }
    if (alive.current) { setNotice('Learning is taking too long. Check the laptop, then look for the draft below.'); setStage('failed') }
  }

  function cancel() {
    cleanup(); chunks.current = []
    setNotice('Recording cancelled. Nothing was sent.'); setStage('ready')
  }

  async function unlock(e: React.FormEvent) {
    e.preventDefault()
    setGuideCode(code.trim()); setCode('')
    await check()
  }

  const title = { checking: 'Checking teach access…', locked: 'Guide code needed', ready: 'Learn a route',
    recording: 'Recording the walk', sending: 'Sending the walk', learning: 'Learning.', learned: 'Route learned.',
    failed: 'The route could not be learned' }[stage]

  return <>
    <div className="intro"><p className="eyebrow">STAGE 1 · LEARN — FOR GUIDES</p><h1>Walk it once, together.<br /><span>Day One learns the way.</span></h1><p>Record one walk while you narrate it. The laptop turns signs, doors and places into checkpoints.<br className="desktop-break" /> You review every word before a colleague walks it alone.</p></div>
    <div className="workspace teach">
      <section className="control-card" aria-labelledby="teach-heading">
        <div className="control-top"><span className="eyebrow">{stage === 'recording' ? 'RECORDING' : 'TEACH A ROUTE'}</span>{stage === 'recording' && <span className="rec-chip">REC {clock(elapsed)}</span>}</div>
        <div className="status-copy" aria-live="polite" aria-atomic="true">
          <h2 id="teach-heading" tabIndex={-1} ref={heading}>{title}</h2>
          {status && <p className="instruction teach-status">{status}</p>}
          {notice && <p className="error">{notice}</p>}
        </div>

        {stage === 'locked' && <form className="guide-code" onSubmit={e => void unlock(e)}>
          <p>{pinConfigured ? 'Enter the guide code shown on the laptop to teach from this phone.' : 'Teaching works on the laptop itself. To teach from a phone, set TEACH_PIN in the laptop’s .env file and restart the server.'}</p>
          {pinConfigured && <><label htmlFor="guide-code">Guide code</label>
            <div className="command-row"><input id="guide-code" type="password" autoComplete="off" inputMode="numeric" value={code} onChange={e => setCode(e.target.value)} /><button className="primary" type="submit">Unlock teaching</button></div></>}
          <button type="button" className="secondary" onClick={() => void check()}>Check again</button>
        </form>}

        {stage === 'ready' && <>
          <div className="field-grid">
            <div><label htmlFor="teach-origin">Starting place</label><input id="teach-origin" value={origin} onChange={e => setOrigin(e.target.value)} placeholder="Lift lobby" maxLength={60} autoComplete="off" /></div>
            <div><label htmlFor="teach-destination">Destination</label><input id="teach-destination" value={destination} onChange={e => setDestination(e.target.value)} placeholder="Meeting room" maxLength={60} autoComplete="off" /></div>
          </div>
          <div className="privacy-note"><h3>How to narrate</h3><ul className="tips">
            <li>Hold the phone at chest height, camera forward, and walk at a normal pace.</li>
            <li>Say every movement out loud: “turn right”, “turn around”, “go through the door”.</li>
            <li>Name places as you reach them: “this is the lift”, “this is our meeting room”.</li>
            <li>Warn about doors and steps: “careful, glass door — push it open”.</li>
            <li>Up to about three minutes. The video and voice go to the laptop, are read by the visual AI once, then deleted.</li>
          </ul></div>
          <label className="checkbox"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />Everyone in view agreed to be filmed.</label>
          <label className="checkbox"><input type="checkbox" checked={phoneTranscript} onChange={e => setPhoneTranscript(e.target.checked)} />Also transcribe my voice on this phone (backup if the laptop cannot)</label>
          <button className="primary start" onClick={() => void record()}>Record<span aria-hidden="true">●</span></button>
        </>}

        {stage === 'recording' && <div className="actions">
          <p className="hint">Walk and narrate. {phoneTranscript ? `${heard} phrases heard on this phone.` : ''} Recording stops by itself at {clock(MAX_SECONDS)}.</p>
          <button className="primary next" onClick={() => void finish()}>Stop and learn</button>
          <button className="secondary" onClick={cancel}>Cancel recording</button>
        </div>}

        {stage === 'sending' && <div className="actions">
          <label htmlFor="upload-progress">Sending the walk to the laptop: {Math.round(progress * 100)}%</label>
          <progress id="upload-progress" max={1} value={progress} />
        </div>}

        {stage === 'learning' && <p className="hint">Reading the frames and your narration. This usually takes under a minute. You can keep this page open.</p>}

        {stage === 'learned' && job && <div className="learned">
          <p className="remembered"><span aria-hidden="true">✓</span> {job.places.length} {job.places.length === 1 ? 'place' : 'places'} remembered</p>
          <ul>{job.places.map(place => <li key={place}>{place}</li>)}</ul>
          <p className="hint">{job.steps} checkpoints drafted. Nothing is spoken to a walker until you review and publish it.</p>
          <div className="button-row"><a className="button primary" href={`#/review/${job.route_id}`}>Review and publish</a><button className="secondary" onClick={() => { setJob(null); setStatus(''); setStage('ready') }}>Teach another route</button></div>
        </div>}

        {stage === 'failed' && <div className="button-row"><button className="primary" onClick={() => { setStatus(''); setStage('ready') }}>Try again</button></div>}

        <div className="camera-frame" hidden={stage !== 'recording'}><video ref={video} muted playsInline aria-label="Rear camera recording the walk" /></div>
        <audio ref={audio} preload="none" />
        <div className="utility-row"><label className="checkbox voice-toggle"><input type="checkbox" checked={voice} onChange={e => setVoice(e.target.checked)} />App voice</label></div>
      </section>

      <section className="route-card" aria-labelledby="drafts-heading">
        <div className="route-label"><span className="eyebrow">WAITING FOR REVIEW</span></div>
        <h2 id="drafts-heading">Drafts</h2>
        {drafts.length === 0 ? <p className="muted">No drafts yet. A recorded walk appears here once it is learned.</p>
          : <ul className="draft-list">{drafts.map(d => <li key={d.route_id}>
            <a href={`#/review/${d.route_id}`}>{d.origin_label && d.destination_label ? `${d.origin_label} to ${d.destination_label}` : d.route_id}</a>
            <small>{d.steps} checkpoints · {d.places.length} places · {d.route_id}</small>
          </li>)}</ul>}
        <div className="note"><span aria-hidden="true">✦</span><p>Every route is checked by a person.<br />The walker only hears what you publish.</p></div>
      </section>
    </div>
  </>
}
