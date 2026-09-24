// Serves the on-device obstacle detector from this app's own origin: the MediaPipe Wasm runtime
// (copied from node_modules) and the EfficientDet-Lite0 COCO model (Apache-2.0, downloaded once).
// Without them the app still works; obstacle alerts report themselves unavailable.
import { copyFileSync, existsSync, mkdirSync, renameSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const wasmFrom = join(root, 'node_modules/@mediapipe/tasks-vision/wasm')
const wasmTo = join(root, 'public/mediapipe/wasm')
const model = join(root, 'public/models/efficientdet_lite0.tflite')
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/int8/1/efficientdet_lite0.tflite'

mkdirSync(wasmTo, { recursive: true })
for (const name of ['vision_wasm_internal.js', 'vision_wasm_internal.wasm', 'vision_wasm_nosimd_internal.js', 'vision_wasm_nosimd_internal.wasm']) {
  const from = join(wasmFrom, name), to = join(wasmTo, name)
  if (!existsSync(to) || statSync(to).size !== statSync(from).size) copyFileSync(from, to)
}

if (existsSync(model) && statSync(model).size > 1_000_000) process.exit(0)
mkdirSync(dirname(model), { recursive: true })
try {
  const response = await fetch(MODEL_URL)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.length < 1_000_000) throw new Error('model file too small')
  writeFileSync(`${model}.part`, bytes)
  renameSync(`${model}.part`, model)
  console.log(`obstacle model: ${(bytes.length / 1e6).toFixed(1)} MB`)
} catch (error) {
  console.warn(`obstacle model not downloaded (${error.message}); obstacle alerts will be unavailable`)
}
