export function capturePhoto(video: HTMLVideoElement): string {
  if (!video.videoWidth || video.readyState < 2) throw new Error('Camera is not ready. No photo was sent.')
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight))
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height)
  const encoded = canvas.toDataURL('image/jpeg', .85).split(',')[1]
  canvas.width = canvas.height = 0
  return encoded
}
