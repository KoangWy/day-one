import { LABELS, type Detection } from './obstacles'

export type Detector = { detect(video: HTMLVideoElement, now: number): Detection[] | null; close(): void }

/**
 * EfficientDet-Lite0 (COCO) running in the browser with MediaPipe. Frames never leave the phone.
 * Assets are served by this app (scripts/obstacle-assets.mjs); loading is lazy and may fail on
 * old browsers, in which case obstacle alerts are simply unavailable.
 */
export async function loadDetector(): Promise<Detector> {
  const { FilesetResolver, ObjectDetector } = await import('@mediapipe/tasks-vision')
  const files = await FilesetResolver.forVisionTasks('/mediapipe/wasm')
  const detector = await ObjectDetector.createFromOptions(files, {
    baseOptions: { modelAssetPath: '/models/efficientdet_lite0.tflite', delegate: 'CPU' },
    runningMode: 'VIDEO', scoreThreshold: 0.4, maxResults: 6, categoryAllowlist: LABELS,
  })
  let last = 0
  return {
    detect(video, now) {
      if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) return null
      last = Math.max(now, last + 1) // MediaPipe needs strictly increasing timestamps.
      const { detections } = detector.detectForVideo(video, last)
      const width = video.videoWidth, height = video.videoHeight
      return detections.flatMap(d => {
        const category = d.categories[0], box = d.boundingBox
        if (!category || !box) return []
        return [{ label: category.categoryName, score: category.score,
          box: { x: box.originX / width, y: box.originY / height, w: box.width / width, h: box.height / height } }]
      })
    },
    close() { detector.close() },
  }
}
