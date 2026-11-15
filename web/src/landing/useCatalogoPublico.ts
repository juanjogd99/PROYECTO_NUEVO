import { useEffect, useState } from 'react'
import type { Variante } from '../lib/types'
import { catalogoPublico, getSheetsUrl } from '../lib/sheets'
import { demoCatalogo } from '../lib/demoData'

/**
 * Inventario para la página pública. Con el Sheet conectado lo lee de la pestaña CATALOGO (sin PIN,
 * solo telas/modelos/colores/estado). Sin Sheet, muestra el catálogo de ejemplo.
 * Si el Sheet no responde, no se muestra nada (mejor que mostrar existencias inventadas).
 */
/** En la demostración, lo que la dueña haya editado en la Caja de este navegador. */
function demoGuardado(): Variante[] | null {
  try {
    const v = localStorage.getItem('tm.demo-catalogo')
    return v ? (JSON.parse(v) as Variante[]) : null
  } catch {
    return null
  }
}

export function useCatalogoPublico() {
  const url = getSheetsUrl()
  const [catalogo, setCatalogo] = useState<Variante[]>(() => (url ? [] : demoGuardado() ?? demoCatalogo))
  useEffect(() => {
    if (!url) return
    let vivo = true
    catalogoPublico(url)
      .then((c) => vivo && setCatalogo(c))
      .catch(() => vivo && setCatalogo([]))
    return () => {
      vivo = false
    }
  }, [url])
  return catalogo
}
