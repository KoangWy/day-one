import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import DemoApp from './demo/DemoApp'
import { isSceneId } from './demo/timeline'
import './style.css'

// `?demo=...` mounts the prerecorded demo bundle only; the live App (camera, mic, API) is never rendered.
const demo = new URLSearchParams(window.location.search).get('demo')
const initialScene = isSceneId(demo) ? demo : null

registerSW({ immediate: true })
createRoot(document.getElementById('root')!).render(
  demo !== null ? <DemoApp initialScene={initialScene} /> : <App />,
)
