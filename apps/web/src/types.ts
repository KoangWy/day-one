export type Step = { id: string; instruction: string; landmark: string; voice_cue: string }
export type Route = { route_id: string; steps: Step[] }
export type HazardKind = 'glass-door' | 'automatic-door' | 'door' | 'stairs' | 'step' | 'narrow' | 'other'
export type Assets = {
  origin_label: string; destination_label?: string; sample: boolean
  steps: { short_name: string; expected_seconds: number; hazards?: HazardKind[] }[]
  phrases: Record<string, string>
}
/** One saved route; a route whose origin_place is another's destination_place continues it. */
export type RouteSummary = {
  route_id: string; origin_label: string; destination_label: string
  origin_place: string; destination_place: string; steps: number; hazards: number; sample: boolean
}
export type Target = 'matched' | 'candidate' | 'none'
export type Position = 'left' | 'ahead' | 'right' | null
export type Distance = 'near' | 'far' | null
export type ObserveResult = { step_index: number; target: Target; position: Position; distance: Distance; hazards?: number[] }

export type Hazard = { kind: HazardKind; warning: string; action: string; features: string[] }
export type ReviewCheckpoint = {
  description: string; required_text: string[]; required_features: string[]; short_name: string
  expected_seconds: number; hazards: Hazard[]
}
export type Review = {
  origin_label: string; origin_instruction: string; origin_retry: string
  origin: { description: string; required_text: string[]; required_features: string[]; short_name: string }
  checkpoints: ReviewCheckpoint[]
  destination_label: string | null; arrival: string; destination_is_exterior: boolean; sample: boolean
}
export type DraftSummary = {
  route_id: string; steps: number; created_at: string | null
  origin_label: string; destination_label: string; places: string[]
}
export type Draft = DraftSummary & { route: Route; review: Review; transcript: { start: number; end: number; text: string }[] }
export type TeachJob = {
  job_id: string; status: 'learning' | 'learned' | 'failed'; route_id: string
  message: string; places: string[]; steps: number
}
export type FieldProblem = { field: string; message: string }
