import { useEffect, useState } from 'react'
import Review from './Review'
import Teach from './Teach'
import Walk from './Walk'

type Page = { name: 'walk' } | { name: 'teach' } | { name: 'review'; id: string }

/** Pages live in the hash (#/teach, #/review/<id>) so the laptop serves one static app. */
function parse(hash: string): Page | null {
  if (hash === '' || hash === '#' || hash === '#/') return { name: 'walk' }
  if (hash === '#/teach') return { name: 'teach' }
  const review = /^#\/review\/([a-z0-9][a-z0-9-]{0,63})$/.exec(hash)
  if (review) return { name: 'review', id: review[1] }
  return hash.startsWith('#/') ? { name: 'walk' } : null // #main and other anchors keep the page.
}

export default function App() {
  const [page, setPage] = useState<Page>(() => parse(location.hash) ?? { name: 'walk' })
  useEffect(() => {
    const change = () => { const next = parse(location.hash); if (next) setPage(next) }
    window.addEventListener('hashchange', change)
    return () => window.removeEventListener('hashchange', change)
  }, [])
  useEffect(() => {
    document.title = page.name === 'walk' ? 'Day One · Offixed' : page.name === 'teach' ? 'Teach a route · Day One' : 'Review a route · Day One'
  }, [page])

  const guide = page.name !== 'walk'
  return <>
    <a href="#main" className="skip">{guide ? 'Skip to main content' : 'Skip to route controls'}</a>
    <header className="topbar">
      <a className="brand" href="/" aria-label="Day One home"><span className="brand-mark" aria-hidden="true">d.</span>day one<span className="brand-by">by Offixed</span></a>
      <nav className="modes" aria-label="Day One modes">
        <a href="#/" aria-current={guide ? undefined : 'page'}>Walk</a>
        <a href="#/teach" aria-current={guide ? 'page' : undefined}>Teach a route</a>
      </nav>
      <span className="prototype">FIELD PROTOTYPE · 03</span>
    </header>
    <main id="main">
      {page.name === 'walk' ? <Walk /> : page.name === 'teach' ? <Teach /> : <Review key={page.id} id={page.id} />}
      <footer><p><strong>Wayfinding aid, not a safety device.</strong> Keep using your cane and usual mobility support. Obstacle alerts can miss things.</p><p>OFFIXED <span aria-hidden="true">/</span> ADC HACKATHON 2026</p></footer>
    </main>
  </>
}
