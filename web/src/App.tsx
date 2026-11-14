import { lazy, Suspense, useEffect, useState } from 'react'
import Landing from './landing/Landing'
import Categoria from './landing/Categoria'
import { categoriaPorSlug } from './landing/catalogo'

const CajaApp = lazy(() => import('./caja/CajaApp'))

/** Rutas por hash (funcionan en cualquier hosting estático): #caja, #telas-colegio…, o la página con sus anclas. */
const getRoute = () => {
  const h = window.location.hash
  if (/^#\/?caja/.test(h)) return 'caja'
  const m = /^#telas-([a-z]+)/.exec(h)
  if (m && categoriaPorSlug(m[1])) return `telas-${m[1]}`
  return 'inicio'
}

export default function App() {
  const [route, setRoute] = useState(getRoute)

  useEffect(() => {
    // las anclas internas (#telas, #medidas…) también disparan hashchange: solo cambiamos de vista si cambia la ruta
    const on = () =>
      setRoute((prev) => {
        const next = getRoute()
        if (next !== prev) {
          // al volver a la página, ir a la sección del ancla (por ejemplo "← Todas las telas")
          const id = window.location.hash.slice(1)
          requestAnimationFrame(() => requestAnimationFrame(() => {
            const el = next === 'inicio' && id ? document.getElementById(id) : null
            if (el) el.scrollIntoView()
            else window.scrollTo(0, 0)
          }))
        }
        return next
      })
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])

  const cat = route.startsWith('telas-') ? categoriaPorSlug(route.slice(6)) : undefined

  useEffect(() => {
    document.title = route === 'caja' ? 'Caja · Textiles Myriam' : cat ? `${cat.nombre} · Textiles Myriam` : 'Textiles Myriam: telas desde hace más de 50 años'
  }, [route, cat])

  if (route === 'caja')
    return (
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-muted">Abriendo la caja…</div>}>
        <CajaApp />
      </Suspense>
    )
  if (cat) return <Categoria cat={cat} />
  return <Landing />
}
