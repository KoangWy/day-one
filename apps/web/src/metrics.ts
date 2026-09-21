export type Metric = {
  event: 'start' | 'visual_check' | 'confirmation' | 'manual_override' | 'lost_track' | 'arrival' | 'stop'
  at: string; step: number; duration_ms?: number; matched?: boolean; sample?: boolean
}
export function downloadMetrics(events: Metric[]) {
  const blob = new Blob([JSON.stringify({ kind: 'offixed-replay-session', events }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = 'offixed-replay-metrics.json'; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
