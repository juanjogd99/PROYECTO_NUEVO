import { lazy, Suspense, useEffect, useState } from 'react'
import Landing from './landing/Landing'

const CajaApp = lazy(() => import('./caja/CajaApp'))

const getRoute = () => (/^#\/?caja/.test(window.location.hash) ? 'caja' : 'inicio')

export default function App() {
  const [route, setRoute] = useState(getRoute)
  useEffect(() => {
    // las anclas internas (#coleccion…) también disparan hashchange: solo cambiamos de vista si cambia la ruta
    const on = () =>
      setRoute((prev) => {
        const next = getRoute()
        if (next !== prev) window.scrollTo(0, 0)
        return next
      })
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  useEffect(() => {
    document.title = route === 'caja' ? 'Caja · Textiles Myriam' : 'Textiles Myriam — Telas para tu hogar'
  }, [route])

  if (route === 'caja')
    return (
      <Suspense fallback={<div className="grid min-h-dvh place-items-center text-sm text-muted">Abriendo la caja…</div>}>
        <CajaApp />
      </Suspense>
    )
  return <Landing />
}
