import { useEffect, useRef, useState } from 'react'
import { deleteDraft, getDraft, GuideError, publishDraft } from './api'
import type { Draft, FieldProblem, Hazard, HazardKind, Review as ReviewData, Route } from './types'

type HazardForm = { kind: HazardKind; warning: string; action: string; features: string }
type StepForm = {
  instruction: string; voice_cue: string; keepCue: boolean; landmark: string; short_name: string
  required_text: string; required_features: string; expected_seconds: string; hazards: HazardForm[]
}
type Form = {
  origin_label: string; origin_instruction: string; origin_retry: string; origin_description: string
  origin_short_name: string; origin_text: string; origin_features: string
  steps: StepForm[]; destination_label: string; arrival: string
}

const KINDS: [HazardKind, string][] = [['glass-door', 'Glass door'], ['automatic-door', 'Automatic door'], ['door', 'Door'],
  ['stairs', 'Stairs'], ['step', 'Step'], ['narrow', 'Narrow passage'], ['other', 'Other']]
const lines = (text: string) => text.split('\n').map(s => s.trim()).filter(Boolean)
const errorText = (error: unknown) => error instanceof Error ? error.message : 'Something went wrong. Please try again.'

function toForm(draft: Draft): Form {
  const r = draft.review
  return {
    origin_label: r.origin_label ?? '', origin_instruction: r.origin_instruction ?? '', origin_retry: r.origin_retry ?? '',
    origin_description: r.origin.description, origin_short_name: r.origin.short_name,
    origin_text: r.origin.required_text.join('\n'), origin_features: r.origin.required_features.join('\n'),
    steps: draft.route.steps.map((step, i) => {
      const c = r.checkpoints[i]
      return {
        instruction: step.instruction, voice_cue: step.voice_cue, keepCue: Boolean(step.voice_cue),
        landmark: step.landmark, short_name: c?.short_name ?? '', required_text: (c?.required_text ?? []).join('\n'),
        required_features: (c?.required_features ?? []).join('\n'), expected_seconds: String(c?.expected_seconds || ''),
        hazards: (c?.hazards ?? []).map(h => ({ ...h, features: h.features.join('\n') })),
      }
    }),
    destination_label: r.destination_label ?? '', arrival: r.arrival ?? '',
  }
}

function fromForm(form: Form, draft: Draft, exterior: boolean): { route: Route; review: ReviewData } {
  const route: Route = { route_id: draft.route.route_id, steps: draft.route.steps.map((step, i) => ({
    id: step.id, instruction: form.steps[i].instruction.trim(), landmark: form.steps[i].landmark.trim(),
    voice_cue: form.steps[i].keepCue ? step.voice_cue : '',
  })) }
  const review: ReviewData = {
    origin_label: form.origin_label.trim(), origin_instruction: form.origin_instruction.trim(), origin_retry: form.origin_retry.trim(),
    origin: { description: form.origin_description.trim(), required_text: lines(form.origin_text),
      required_features: lines(form.origin_features), short_name: form.origin_short_name.trim() },
    checkpoints: form.steps.map(s => ({
      description: s.landmark.trim(), required_text: lines(s.required_text), required_features: lines(s.required_features),
      short_name: s.short_name.trim(), expected_seconds: Number.parseInt(s.expected_seconds, 10),
      hazards: s.hazards.map((h): Hazard => ({ kind: h.kind, warning: h.warning.trim(), action: h.action.trim(), features: lines(h.features) })),
    })),
    destination_label: form.destination_label.trim() || null, arrival: form.arrival.trim(),
    destination_is_exterior: exterior, sample: draft.review.sample ?? false,
  }
  return { route, review }
}

/** "review.checkpoints.0.short_name" → "Step 1 · short name". */
function place(field: string) {
  return field.replace(/^(review|route)\./, '')
    .replace(/(checkpoints|steps)\.(\d+)/, (_, __, n) => `Step ${Number(n) + 1}`)
    .replace(/hazards\.(\d+)/, (_, n) => `warning ${Number(n) + 1}`)
    .replace(/origin\b/, 'Starting point').replace(/\./g, ' · ').replace(/_/g, ' ')
}

export default function Review({ id }: { id: string }) {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [form, setForm] = useState<Form | null>(null)
  const [loadError, setLoadError] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [exterior, setExterior] = useState(false)
  const [busy, setBusy] = useState(false)
  const [problem, setProblem] = useState('')
  const [fields, setFields] = useState<FieldProblem[]>([])
  const [published, setPublished] = useState<{ route_id: string; phrases: number } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const summary = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getDraft(id).then(d => { setDraft(d); setForm(toForm(d)) }, e => setLoadError(errorText(e)))
  }, [id])
  useEffect(() => { heading.current?.focus() }, [published, deleted])

  const err = (field: string) => fields.find(f => f.field === field)?.message
  const set = (patch: Partial<Form>) => setForm(f => f && { ...f, ...patch })
  const setStep = (i: number, patch: Partial<StepForm>) => setForm(f => f && { ...f, steps: f.steps.map((s, n) => n === i ? { ...s, ...patch } : s) })
  const setHazard = (i: number, h: number, patch: Partial<HazardForm>) =>
    setStep(i, { hazards: form!.steps[i].hazards.map((x, n) => n === h ? { ...x, ...patch } : x) })

  async function publish(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !draft) return
    setBusy(true); setProblem(''); setFields([])
    try {
      const { route, review } = fromForm(form, draft, exterior)
      setPublished(await publishDraft(id, { route, review, reviewer: reviewer.trim(), confirmed }))
    } catch (error) {
      setProblem(errorText(error))
      setFields(error instanceof GuideError ? error.fields : [])
      setTimeout(() => summary.current?.focus())
    } finally { setBusy(false) }
  }

  async function remove() {
    if (!deleting) { setDeleting(true); return }
    try { await deleteDraft(id); setDeleted(true) } catch (error) { setProblem(errorText(error)); setDeleting(false) }
  }

  // Text field with its label, hint and server-side problem wired for screen readers.
  function Field({ label, field, value, onChange, multiline = false, hint, type = 'text' }: {
    label: string; field: string; value: string; onChange: (v: string) => void; multiline?: boolean; hint?: string; type?: string
  }) {
    const htmlId = `f-${field.replace(/\W/g, '-')}`, message = err(field)
    const describedBy = [hint && `${htmlId}-hint`, message && `${htmlId}-error`].filter(Boolean).join(' ') || undefined
    const common = { id: htmlId, value, 'aria-invalid': message ? true : undefined, 'aria-describedby': describedBy }
    return <div className="field">
      <label htmlFor={htmlId}>{label}</label>
      {hint && <small id={`${htmlId}-hint`}>{hint}</small>}
      {multiline ? <textarea {...common} rows={Math.max(2, value.split('\n').length)} onChange={e => onChange(e.target.value)} />
        : <input {...common} type={type} inputMode={type === 'number' ? 'numeric' : undefined} onChange={e => onChange(e.target.value)} autoComplete="off" />}
      {message && <small className="error" id={`${htmlId}-error`}>{message}</small>}
    </div>
  }

  if (loadError) return <div className="review-page"><h1 className="page-title">Review a route</h1><p role="alert" className="error">{loadError}</p><a className="button secondary" href="#/teach">Back to teaching</a></div>
  if (!form || !draft) return <div className="review-page"><h1 className="page-title">Review a route</h1><p role="status">Loading the draft…</p></div>
  if (deleted) return <div className="review-page"><h1 className="page-title" tabIndex={-1} ref={heading}>Draft deleted</h1><p>Nothing was published.</p><a className="button primary" href="#/teach">Back to teaching</a></div>
  if (published) return <div className="review-page"><h1 className="page-title" tabIndex={-1} ref={heading}>Route published</h1>
    <p className="remembered"><span aria-hidden="true">✓</span> {form.origin_label} to {form.destination_label || 'destination'} is ready to walk.</p>
    <p className="hint">{published.phrases} spoken sentences were prepared.</p>
    <div className="button-row"><a className="button primary" href={`/?route=${encodeURIComponent(published.route_id)}#/`}>Walk this route</a><a className="button secondary" href="#/teach">Teach another route</a></div></div>

  return <form className="review-page" onSubmit={e => void publish(e)} noValidate>
    <p className="eyebrow">STAGE 1 · REVIEW — {draft.route_id}</p>
    <h1 className="page-title" tabIndex={-1} ref={heading}>Check every word before it is spoken</h1>
    <p className="lead">The AI filled this in from your walk. Correct anything that is not exactly right: sign text must match the sign letter for letter, and directions must be what you said.</p>
    {draft.places.length > 0 && <p className="hint">Places remembered: {draft.places.join(', ')}.</p>}

    <fieldset className="review-section"><legend>Starting point</legend>
      <div className="field-grid">
        {Field({ label: 'Place name', field: 'review.origin_label', value: form.origin_label, onChange: v => set({ origin_label: v }) })}
        {Field({ label: 'Landmark name (spoken)', field: 'review.origin.short_name', value: form.origin_short_name, onChange: v => set({ origin_short_name: v }), hint: 'Two to four words, e.g. floor number 3' })}
      </div>
      {Field({ label: 'What to do there', field: 'review.origin_instruction', value: form.origin_instruction, onChange: v => set({ origin_instruction: v }), multiline: true })}
      {Field({ label: 'Landmark description', field: 'review.origin.description', value: form.origin_description, onChange: v => set({ origin_description: v }) })}
      <div className="field-grid">
        {Field({ label: 'Exact sign text, one per line', field: 'review.origin.required_text', value: form.origin_text, onChange: v => set({ origin_text: v }), multiline: true })}
        {Field({ label: 'Fixed features, one per line', field: 'review.origin.required_features', value: form.origin_features, onChange: v => set({ origin_features: v }), multiline: true })}
      </div>
      {err('review.origin') && <p className="error">{err('review.origin')}</p>}
    </fieldset>

    {form.steps.map((step, i) => <fieldset className="review-section" key={i}><legend>Step {i + 1}{i === form.steps.length - 1 ? ' · destination' : ''}</legend>
      {Field({ label: 'Direction (spoken)', field: `route.steps.${i}.instruction`, value: step.instruction, onChange: v => setStep(i, { instruction: v }), multiline: true, hint: 'Only movements you said while walking.' })}
      {step.voice_cue && <label className="checkbox"><input type="checkbox" checked={step.keepCue} onChange={e => setStep(i, { keepCue: e.target.checked })} />Keep your quote: “{step.voice_cue}”</label>}
      <div className="field-grid">
        {Field({ label: 'Landmark name (spoken)', field: `review.checkpoints.${i}.short_name`, value: step.short_name, onChange: v => setStep(i, { short_name: v }), hint: 'e.g. office sign' })}
        {Field({ label: 'Seconds to walk there', field: `review.checkpoints.${i}.expected_seconds`, value: step.expected_seconds, onChange: v => setStep(i, { expected_seconds: v }), type: 'number' })}
      </div>
      {Field({ label: 'Landmark description', field: `review.checkpoints.${i}.description`, value: step.landmark, onChange: v => setStep(i, { landmark: v }) })}
      <div className="field-grid">
        {Field({ label: 'Exact sign text, one per line', field: `review.checkpoints.${i}.required_text`, value: step.required_text, onChange: v => setStep(i, { required_text: v }), multiline: true })}
        {Field({ label: 'Fixed features, one per line', field: `review.checkpoints.${i}.required_features`, value: step.required_features, onChange: v => setStep(i, { required_features: v }), multiline: true })}
      </div>
      {err(`review.checkpoints.${i}`) && <p className="error">{err(`review.checkpoints.${i}`)}</p>}
      <div className="hazards">
        <h3>Warnings on the way</h3>
        {step.hazards.length === 0 && <p className="hint">None. Add glass doors, automatic doors, steps or anything a walker must handle.</p>}
        {step.hazards.map((h, n) => <div className="hazard" key={n} role="group" aria-label={`Step ${i + 1} warning ${n + 1}`}>
          <div className="field"><label htmlFor={`kind-${i}-${n}`}>Kind</label>
            <select id={`kind-${i}-${n}`} value={h.kind} onChange={e => setHazard(i, n, { kind: e.target.value as HazardKind })}>{KINDS.map(([k, name]) => <option key={k} value={k}>{name}</option>)}</select></div>
          {Field({ label: 'Warning (spoken with a chime)', field: `review.checkpoints.${i}.hazards.${n}.warning`, value: h.warning, onChange: v => setHazard(i, n, { warning: v }) })}
          {Field({ label: 'How to pass it (optional)', field: `review.checkpoints.${i}.hazards.${n}.action`, value: h.action, onChange: v => setHazard(i, n, { action: v }) })}
          {Field({ label: 'What the camera looks for, one per line', field: `review.checkpoints.${i}.hazards.${n}.features`, value: h.features, onChange: v => setHazard(i, n, { features: v }), multiline: true })}
          <button type="button" className="text-button stop" onClick={() => setStep(i, { hazards: step.hazards.filter((_, x) => x !== n) })}>Remove warning {n + 1}</button>
        </div>)}
        {step.hazards.length < 3 && <button type="button" className="secondary" onClick={() => setStep(i, { hazards: [...step.hazards, { kind: 'glass-door', warning: 'Be careful. A glass door is in front of you.', action: '', features: 'glass door' }] })}>Add a warning to step {i + 1}</button>}
      </div>
    </fieldset>)}

    <fieldset className="review-section"><legend>Destination</legend>
      {Field({ label: 'Destination name', field: 'review.destination_label', value: form.destination_label, onChange: v => set({ destination_label: v }), hint: 'Shown in the route list, e.g. Meeting room' })}
      {Field({ label: 'Arrival sentence (spoken)', field: 'review.arrival', value: form.arrival, onChange: v => set({ arrival: v }), multiline: true })}
    </fieldset>

    {draft.transcript.length > 0 && <details className="commands"><summary>What you said while walking</summary>
      <ol className="transcript">{draft.transcript.map((s, n) => <li key={n}><small>{s.start.toFixed(0)} s</small> {s.text}</li>)}</ol></details>}

    <fieldset className="review-section confirm"><legend>Publish</legend>
      <label className="checkbox"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />I walked this route and checked every direction, sign and warning.</label>
      <label className="checkbox"><input type="checkbox" checked={exterior} onChange={e => setExterior(e.target.checked)} />The route ends outside the destination’s door or sign, never inside it.</label>
      {Field({ label: 'Your name', field: 'reviewer', value: reviewer, onChange: setReviewer })}
      <div ref={summary} tabIndex={-1} role={problem ? 'alert' : undefined}>
        {problem && <p className="error">{problem}</p>}
        {fields.length > 0 && <ul className="error">{fields.map(f => <li key={f.field}>{place(f.field)}: {f.message}</li>)}</ul>}
      </div>
      <div className="button-row">
        <button className="primary" type="submit" disabled={busy}>{busy ? 'Publishing and preparing speech…' : 'Publish route'}</button>
        <button className="secondary" type="button" onClick={() => void remove()}>{deleting ? 'Confirm: delete this draft' : 'Delete draft'}</button>
      </div>
    </fieldset>
  </form>
}
