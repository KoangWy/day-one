type RecognitionEvent = { results: { [index: number]: { [index: number]: { transcript: string } } } }
export interface Recognition {
  lang: string; continuous: boolean; interimResults: boolean
  onresult: ((event: RecognitionEvent) => void) | null
  onerror: (() => void) | null; onend: (() => void) | null
  start(): void; abort(): void
}
export function speechConstructor(): (new () => Recognition) | undefined {
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition
}
