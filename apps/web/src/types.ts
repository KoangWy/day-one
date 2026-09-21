export type Step = { id: string; instruction: string; landmark: string; voice_cue: string }
export type Route = { route_id: string; steps: Step[] }
export type Checkpoint = { description: string; required_text: string[]; required_features?: string[]; question: string }
export type Assets = {
  origin_label: string; origin_instruction: string; origin_retry: string
  origin: Checkpoint; origin_audio: string; origin_retry_audio: string
  steps: { instruction: string; question: string }[]; checkpoint_questions: string[]
  arrival: string; arrival_audio: string; fallback_audio: Record<string, string>
  override_audio: string; sample: boolean
}
export type ReplayResult = { matched: boolean; instruction: string; checkpoint_question: string; audio_url: string }
