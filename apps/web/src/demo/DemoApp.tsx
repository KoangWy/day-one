import { useEffect, useRef, useState } from 'react'
import {
  demoMediaUrl, formatClock, isSceneId, sceneDurationSeconds, sceneIds, sceneSpec, snapshotAt,
  type DemoPhase, type SceneId,
} from './timeline'
import './demo.css'

const STATE_LABELS: Record<DemoPhase, string> = {
  idle: 'Ready',
  lead: 'Recording',
  recording: 'Recording',
  loading: 'Learning',
  learned: 'Route learned',
  navigating: 'Guidance playing',
  arrived: 'Arrived',
  watching: 'Watching the path',
  warning: 'Warning',
  cleared: 'Alert ended',
}

export default function DemoApp({ initialScene }: { initialScene: SceneId | null }) {
  return initialScene ? <DemoScene key={initialScene} sceneId={initialScene} /> : <DemoSelector />
}

function DemoSelector() {
  return <div className="demo-shell">
    <header className="demo-topbar">
      <span className="demo-brand"><span className="demo-brand-mark" aria-hidden="true">d.</span>day one<span className="demo-by">by Offixed</span></span>
      <span className="demo-eyebrow">Final video demo</span>
    </header>
    <main className="demo-main">
      <h1 className="demo-title">Three scenes to screen-record.</h1>
      <p className="demo-summary">Each scene plays one prerecorded clip with its narration already baked in. Open a scene, tap the button, and record the phone screen.</p>
      <ol className="demo-scene-list">
        {sceneIds.map(id => {
          const scene = sceneSpec(id)
          return <li key={id}>
            <a className="demo-scene-link" href={`?demo=${id}`}>
              <span className="demo-scene-number" aria-hidden="true">{scene.order}</span>
              <span className="demo-scene-copy"><strong>{scene.title}</strong><span>{scene.summary}</span></span>
              <span className="demo-scene-arrow" aria-hidden="true">→</span>
            </a>
          </li>
        })}
      </ol>
      <p className="demo-note">These scenes use no camera, microphone or live AI service: the narration, the warning chime and the timing are inside each prepared clip. The media is served from this same origin and is not available offline.</p>
    </main>
  </div>
}

function DemoScene({ sceneId }: { sceneId: SceneId }) {
  const scene = sceneSpec(sceneId)
  const duration = sceneDurationSeconds(scene)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pressTimer = useRef<number | undefined>(undefined)
  const mounted = useRef(true)
  const lastTime = useRef(-1)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [loadError, setLoadError] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [narration, setNarration] = useState(true)
  const [pressed, setPressed] = useState(false)
  const snapshot = snapshotAt(sceneId, currentTime, started)
  const finished = started && !playing && currentTime >= duration - 0.08

  useEffect(() => {
    mounted.current = true
    const video = videoRef.current
    return () => {
      mounted.current = false
      window.clearTimeout(pressTimer.current)
      if (!video) return
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [])

  // The player has no clock of its own: every caption, phase and timer is read from the clip.
  useEffect(() => {
    let frame = 0
    const tick = () => {
      const video = videoRef.current
      if (video && Number.isFinite(video.currentTime) && Math.abs(video.currentTime - lastTime.current) > 0.04) {
        lastTime.current = video.currentTime
        setCurrentTime(video.currentTime)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video) video.muted = !narration
  }, [narration])

  useEffect(() => {
    const onHidden = () => { if (document.visibilityState === 'hidden') videoRef.current?.pause() }
    document.addEventListener('visibilitychange', onHidden)
    return () => document.removeEventListener('visibilitychange', onHidden)
  }, [])

  function press() {
    setPressed(true)
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => { if (mounted.current) setPressed(false) }, 400)
  }

  async function play(fromStart: boolean) {
    const video = videoRef.current
    if (!video) return
    video.muted = !narration
    if (fromStart && video.readyState >= 1) {
      video.currentTime = 0
      lastTime.current = 0
      setCurrentTime(0)
    }
    try {
      await video.play()
      if (!mounted.current) return
      setStarted(true)
      setBlocked(false)
      setLoadError(false)
    } catch (error) {
      if (!mounted.current) return
      // Pausing, seeking, restarting or unloading the element rejects a pending play() with
      // AbortError. That is ordinary navigation, not a blocked-autoplay failure.
      if (error instanceof DOMException && error.name === 'AbortError') return
      if (video.error) setLoadError(true)
      else setBlocked(true)
    }
  }

  function primary() {
    press()
    const video = videoRef.current
    if (!video) return
    if (playing) { video.pause(); return }
    void play(finished)
  }

  const primaryLabel = playing ? 'Pause'
    : finished || !started ? scene.primaryLabel
    : 'Resume'
  const live = narration ? 'off' : snapshot.warning ? 'assertive' : 'polite'

  return <div className="demo-shell">
    <header className="demo-topbar">
      <a className="demo-brand" href="?demo=1" aria-label="Offixed demo scenes"><span className="demo-brand-mark" aria-hidden="true">d.</span>day one<span className="demo-by">by Offixed</span></a>
      <a className="demo-allscenes" href="?demo=1">All scenes</a>
    </header>
    <main className="demo-main">
      <h1 className="demo-title">{scene.title}</h1>
      <p className="demo-instructions">{scene.instructions}</p>

      <div className="demo-actions">
        <button
          type="button"
          className={`demo-button demo-button-primary${pressed ? ' is-pressed' : ''}`}
          aria-label={primaryLabel}
          onPointerDown={press}
          onClick={primary}
        >{primaryLabel}</button>
      </div>

      <div className="demo-caption-region" aria-live={live} aria-atomic="true">
        <p className={`demo-caption${snapshot.warning ? ' demo-caption-warning' : ''}`} data-testid="demo-caption">{snapshot.caption}</p>
      </div>

      <div className={`demo-stage demo-stage-${snapshot.phase}`} data-testid="demo-stage" data-phase={snapshot.phase}>
        {!snapshot.learningPanel && <span className="demo-stage-label">{scene.stageLabel}</span>}
        <video
          ref={videoRef}
          className="demo-video"
          data-testid="demo-video"
          src={demoMediaUrl(scene.media)}
          preload="metadata"
          playsInline
          muted={!narration}
          aria-label={scene.videoAriaLabel}
          onLoadedMetadata={() => { setLoadError(false) }}
          onPlay={() => { setStarted(true); setPlaying(true); setBlocked(false) }}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onError={() => { if (mounted.current) setLoadError(true) }}
        />
        {scene.recordChip && snapshot.recording && <p className="demo-rec-chip" data-testid="demo-recording">
          <span className="demo-rec-dot" aria-hidden="true" />Recording
          <span className="demo-clock">{formatClock(snapshot.elapsedSeconds)}</span>
        </p>}
        {snapshot.warning && <p className="demo-warning" aria-hidden="true">
          <span className="demo-warning-mark">⚠</span>{snapshot.caption}
        </p>}
        {snapshot.learningPanel && <div className="demo-stage-overlay" aria-hidden="true">
          {snapshot.phase === 'loading'
            ? <><span className="demo-spinner" /><p>{snapshot.caption}</p><small>Reading the walkthrough…</small></>
            : <><span className="demo-check" aria-hidden="true">✓</span><p>{snapshot.caption}</p><small>Ready to follow next time.</small></>}
        </div>}
      </div>

      <div className="demo-transport">
        {started && <button type="button" className="demo-button demo-button-secondary" onClick={() => { press(); void play(true) }}>Restart</button>}
        <span className="demo-clock"><span className="demo-sr">Clip time </span>{formatClock(currentTime)} / {formatClock(duration)}</span>
        <label className="demo-toggle"><input type="checkbox" checked={narration} onChange={e => setNarration(e.target.checked)} />App narration</label>
      </div>

      <p className={`demo-state${snapshot.warning ? ' demo-state-warning' : ''}`} data-testid="demo-state">{STATE_LABELS[snapshot.phase]}</p>

      {loadError && <div className="demo-error" role="alert">
        <p>This clip could not be loaded. Prepare the media on this device, then reload the page.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload page</button>
      </div>}
      {blocked && !loadError && <div className="demo-error" role="status">
        <p>Playback was blocked. Tap the button again to start the clip.</p>
      </div>}

      <p className="demo-footnote"><strong>Wayfinding aid, not a safety device.</strong> Keep using your cane and usual mobility support.</p>
    </main>
    <footer className="demo-footer"><p>OFFIXED / ADC HACKATHON 2026</p></footer>
  </div>
}
