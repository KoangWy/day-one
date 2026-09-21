import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision'

let detector: FaceDetector | null = null
let loading: Promise<FaceDetector> | null = null

export async function loadFaceDetector() {
  if (detector) return detector
  if (!loading) loading = (async () => {
    const files = await FilesetResolver.forVisionTasks('/privacy/wasm')
    detector = await FaceDetector.createFromOptions(files, {
      baseOptions: { modelAssetPath: '/privacy/blaze_face_short_range.tflite', delegate: 'CPU' },
      runningMode: 'IMAGE', minDetectionConfidence: 0.35,
    })
    return detector
  })().catch(() => { loading = null; throw new Error('Face protection could not load. No photos were sent. Reconnect and try again.') })
  return loading
}

export function redactFaces(canvas: HTMLCanvasElement, boxes: { originX: number; originY: number; width: number; height: number }[]) {
  const ctx = canvas.getContext('2d')!
  for (const box of boxes) {
    const pad = Math.ceil(Math.max(box.width, box.height) * .35)
    const x = Math.max(0, box.originX - pad), y = Math.max(0, box.originY - pad)
    const w = Math.min(canvas.width - x, box.width + 2 * pad)
    const h = Math.min(canvas.height - y, box.height + 2 * pad)
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) throw new Error('Face protection failed. No photo was sent.')
    const pixel = document.createElement('canvas')
    pixel.width = pixel.height = 1
    pixel.getContext('2d')!.drawImage(canvas, x, y, w, h, 0, 0, 1, 1)
    // A one-pixel mosaic also protects faces on Safari versions without Canvas.filter.
    ctx.save()
    ctx.filter = 'blur(12px)'
    ctx.drawImage(pixel, 0, 0, 1, 1, x, y, w, h)
    ctx.filter = 'none'
    ctx.drawImage(pixel, 0, 0, 1, 1, x, y, w, h)
    ctx.restore()
  }
}

export async function captureRedacted(video: HTMLVideoElement): Promise<string> {
  const faceDetector = await loadFaceDetector() // Fail closed: never encode before readiness.
  if (!video.videoWidth || video.readyState < 2) throw new Error('Camera is not ready. No photo was sent.')
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight))
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
  const result = faceDetector.detect(canvas)
  const boxes = result.detections.map(d => {
    if (!d.boundingBox) throw new Error('Face protection failed. No photo was sent.')
    return d.boundingBox
  })
  redactFaces(canvas, boxes)
  const encoded = canvas.toDataURL('image/jpeg', .85).split(',')[1]
  canvas.width = canvas.height = 0
  return encoded
}
