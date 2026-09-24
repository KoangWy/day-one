/** Two falling tones before a warning; also a short vibration where the browser supports it. */
let context: AudioContext | null = null

/** Call inside a tap (Start), or iOS keeps the audio context suspended. */
export function unlockChime() {
  try {
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Context) return
    context ??= new Context()
    void context.resume()
  } catch { context = null }
}

export function playChime() {
  try { navigator.vibrate?.([120, 60, 120]) } catch { /* not supported */ }
  if (!context) return
  const start = context.currentTime
  for (const [offset, frequency] of [[0, 988], [0.16, 740]]) {
    const tone = context.createOscillator(), gain = context.createGain()
    tone.type = 'sine'; tone.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, start + offset)
    gain.gain.exponentialRampToValueAtTime(0.4, start + offset + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + offset + 0.28)
    tone.connect(gain).connect(context.destination)
    tone.start(start + offset); tone.stop(start + offset + 0.3)
  }
}
