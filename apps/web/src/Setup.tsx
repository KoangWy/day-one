const STEPS = [
  'Hang your phone at chest height, on a lanyard or chest mount.',
  'Keep the camera facing forward, and uncovered.',
  'Turn the sound on, and keep one ear free.',
  'Keep using your cane.',
]

/** "Wear your phone": shown before the first walk on this phone, and again from Phone setup. */
export function Setup({ onPlay, onDone }: { onPlay: () => void; onDone: () => void }) {
  return <section className="setup" aria-labelledby="setup-heading">
    <p className="eyebrow">BEFORE YOU START</p>
    <h3 id="setup-heading">Wear your phone</h3>
    <div className="setup-body">
      <svg className="setup-figure" viewBox="0 0 120 150" aria-hidden="true">
        <path d="M78 150 v-26 q0 -20 -18 -24 h-6 q-18 4 -18 24 v26" fill="#dce4d2" />
        <circle cx="57" cy="34" r="19" fill="#dce4d2" />
        <path d="M44 58 L57 92 L70 58" fill="none" stroke="#153f34" strokeWidth="2" />
        <rect x="50" y="92" width="16" height="26" rx="3" fill="#153f34" />
        <circle cx="58" cy="99" r="2.4" fill="#e7f1cc" />
        <path d="M66 99 L116 80 M66 99 L116 118" stroke="#89641d" strokeWidth="2" strokeDasharray="4 4" fill="none" />
      </svg>
      <ol>{STEPS.map(step => <li key={step}>{step}</li>)}</ol>
    </div>
    <div className="button-row">
      <button className="secondary" onClick={onPlay}>Play setup instructions</button>
      <button className="primary" onClick={onDone}>I’m ready</button>
    </div>
  </section>
}
