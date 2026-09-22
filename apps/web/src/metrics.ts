import type { LogEvent } from './machine'

export type StepSummary = {
  frames_sent: number; errors: number; candidates: number; matches: number
  time_to_reach_ms: number | null; hints_spoken: number; latency_p50_ms: number | null
}
/** Timing and counts only: never photos, audio or recognised text. */
export type Metric = { event: LogEvent | 'step_summary'; at: string; step: number; sample?: boolean; verified?: boolean }
  & Partial<StepSummary>

export type StepStats = Omit<StepSummary, 'latency_p50_ms'> & { step: number; latencies: number[] }

export const newStepStats = (step: number): StepStats => ({
  step, frames_sent: 0, errors: 0, candidates: 0, matches: 0, time_to_reach_ms: null, hints_spoken: 0, latencies: [],
})

export function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
}

export function summarize(s: StepStats): StepSummary {
  return {
    frames_sent: s.frames_sent, errors: s.errors, candidates: s.candidates, matches: s.matches,
    time_to_reach_ms: s.time_to_reach_ms, hints_spoken: s.hints_spoken, latency_p50_ms: median(s.latencies),
  }
}

export function downloadMetrics(events: Metric[]) {
  const session = { kind: 'offixed-replay-session', version: 2, events }
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = 'offixed-replay-metrics.json'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
