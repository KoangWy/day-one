export type Step = { id: string; instruction: string; landmark: string; voice_cue: string }
export type Route = { route_id: string; steps: Step[] }
export type Assets = {
  origin_label: string; sample: boolean
  steps: { short_name: string; expected_seconds: number }[]
  phrases: Record<string, string>
}
export type Target = 'matched' | 'candidate' | 'none'
export type Position = 'left' | 'ahead' | 'right' | null
export type Distance = 'near' | 'far' | null
export type ObserveResult = { step_index: number; target: Target; position: Position; distance: Distance }
