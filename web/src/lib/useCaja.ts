import { useCallback, useEffect, useRef, useState } from 'react'
import type { Movimiento, Precio, Rol } from './types'
import { borrar, getSheetsUrl, guardar, guardarPrecios, listar, SheetsError, type Datos, type Hoja } from './sheets'
import { demoMovimientos, demoPrecios, demoPrivados } from './demoData'
import { todayISO } from './format'

export type SyncState = 'demo' | 'cargando' | 'sincronizado' | 'guardando' | 'sin-conexion' | 'error'

type Op = { kind: 'upsert'; hoja: Hoja; row: Movimiento } | { kind: 'delete'; hoja: Hoja; id: string } | { kind: 'precios'; list: Precio[] }

const K = { cache: 'tm.cache-equipo', queue: 'tm.queue', demo: 'tm.demo-ejemplo', demoPriv: 'tm.demo-privado', demoPrecios: 'tm.demo-precios' }
const read = <T,>(key: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
const write = (key: string, v: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* lleno o bloqueado: la app sigue funcionando en memoria */
  }
}

export const nuevoId = () => `M-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

/** PIN de la demostración → rol. En el Sheet real lo decide el Apps Script. */
export const DEMO_PINES: Record<string, Rol> = { '1234': 'equipo', '2026': 'duena' }

function aplicar(d: Datos, ops: Op[]): Datos {
  let { rows, privados, precios } = d
  for (const op of ops) {
    if (op.kind === 'precios') precios = op.list
    else {
      const list = op.hoja === 'privado' ? privados : rows
      const next = op.kind === 'delete' ? list.filter((r) => r.id !== op.id) : [op.row, ...list.filter((r) => r.id !== op.row.id)]
      if (op.hoja === 'privado') privados = next
      else rows = next
    }
  }
  return { ...d, rows, privados, precios }
}

/**
 * Estado de la caja. Con URL de Apps Script: lee del Sheet lo que el PIN permite, guarda al
 * instante (optimista) y reintenta lo pendiente si se cae el internet. Sin URL: demostración
 * con datos de EJEMPLO (inventados), guardados solo en este navegador.
 *
 * Privacidad: lo de la dueña nunca se guarda en el navegador (solo memoria), para que no quede
 * en el computador de la tienda al cerrar sesión.
 */
export function useCaja(pin: string, rol: Rol) {
  const url = getSheetsUrl()
  const demo = !url
  const esDuena = rol === 'duena'
  const [datos, setDatos] = useState<Datos>({ rol, rows: [], privados: [], precios: [] })
  const [state, setState] = useState<SyncState>(demo ? 'demo' : 'cargando')
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const queue = useRef<Op[]>(read<Op[]>(K.queue, []))
  const flushing = useRef(false)

  const refresh = useCallback(async () => {
    if (demo) return
    try {
      const remote = await listar(url, pin)
      if (remote.rol === 'equipo') write(K.cache, remote)
      setDatos(aplicar(remote, queue.current))
      setLastSync(new Date())
      setState(queue.current.length ? 'guardando' : 'sincronizado')
      setError('')
    } catch (e) {
      const err = e as SheetsError
      setState(err.kind === 'network' ? 'sin-conexion' : 'error')
      setError(err.message)
    }
  }, [demo, url, pin])

  const flush = useCallback(async () => {
    if (demo || flushing.current || !queue.current.length) return
    flushing.current = true
    setState('guardando')
    try {
      while (queue.current.length) {
        const head = queue.current[0]
        let n = 1
        if (head.kind === 'delete') await borrar(url, pin, [head.id], head.hoja)
        else if (head.kind === 'precios') await guardarPrecios(url, pin, head.list)
        else {
          // agrupa upserts seguidos de la misma hoja en una sola llamada
          while (n < queue.current.length) {
            const op = queue.current[n]
            if (op.kind !== 'upsert' || op.hoja !== head.hoja) break
            n++
          }
          await guardar(url, pin, queue.current.slice(0, n).map((o) => (o as Extract<Op, { kind: 'upsert' }>).row), head.hoja)
        }
        queue.current = queue.current.slice(n)
        write(K.queue, queue.current)
      }
      setState('sincronizado')
      setLastSync(new Date())
      setError('')
    } catch (e) {
      const err = e as SheetsError
      if (err.kind === 'permiso' || err.kind === 'auth') {
        // el servidor no lo acepta: no tiene sentido reintentarlo; se descarta y se recarga
        queue.current = queue.current.slice(1)
        write(K.queue, queue.current)
        await refresh()
      }
      setState(err.kind === 'network' ? 'sin-conexion' : 'error')
      setError(err.message)
    } finally {
      flushing.current = false
    }
  }, [demo, url, pin, refresh])

  // carga inicial
  useEffect(() => {
    if (demo) {
      const hoy = todayISO()
      const rows = read<Movimiento[] | null>(K.demo, null) ?? demoMovimientos()
      setDatos({
        rol,
        rows: esDuena ? rows : rows.filter((r) => r.fecha === hoy),
        privados: esDuena ? (read<Movimiento[] | null>(K.demoPriv, null) ?? demoPrivados()) : [],
        precios: read<Precio[] | null>(K.demoPrecios, null) ?? demoPrecios,
      })
      return
    }
    if (!esDuena) {
      const cached = read<Datos | null>(K.cache, null)
      if (cached?.rows) setDatos(aplicar(cached, queue.current))
    }
    refresh().then(flush)
  }, [demo, rol, esDuena, refresh, flush])

  // cambios hechos directamente en el Sheet: refresca cada 30 s y al volver a la pestaña
  useEffect(() => {
    if (demo) return
    const tick = () => {
      if (document.visibilityState === 'visible' && !flushing.current) refresh().then(flush)
    }
    const id = window.setInterval(tick, 30_000)
    window.addEventListener('focus', tick)
    window.addEventListener('online', tick)
    return () => {
      window.clearInterval(id)
      window.removeEventListener('focus', tick)
      window.removeEventListener('online', tick)
    }
  }, [demo, refresh, flush])

  const commit = useCallback(
    (op: Op) => {
      setDatos((prev) => {
        const next = aplicar(prev, [op])
        if (demo) {
          if (op.kind === 'precios') write(K.demoPrecios, next.precios)
          else if (op.hoja === 'privado') write(K.demoPriv, next.privados)
          else {
            // en la demo el equipo solo ve hoy: se fusiona con lo guardado para no perder el resto
            const all = read<Movimiento[] | null>(K.demo, null) ?? demoMovimientos()
            write(K.demo, aplicar({ ...prev, rows: all }, [op]).rows)
          }
        }
        return next
      })
      if (demo) return
      queue.current = [...queue.current, op]
      write(K.queue, queue.current)
      flush()
    },
    [demo, flush],
  )

  const resetDemo = useCallback(() => {
    for (const k of [K.demo, K.demoPriv, K.demoPrecios])
      try {
        localStorage.removeItem(k)
      } catch {
        /* noop */
      }
    setDatos({ rol, rows: demoMovimientos(), privados: demoPrivados(), precios: demoPrecios })
  }, [rol])

  return {
    ...datos,
    rol,
    state,
    error,
    lastSync,
    demo,
    url,
    save: useCallback((row: Movimiento, hoja: Hoja = 'movimientos') => commit({ kind: 'upsert', hoja, row }), [commit]),
    remove: useCallback((id: string, hoja: Hoja = 'movimientos') => commit({ kind: 'delete', hoja, id }), [commit]),
    savePrecios: useCallback((list: Precio[]) => commit({ kind: 'precios', list }), [commit]),
    refresh: () => refresh().then(flush),
    resetDemo,
  }
}

/** Al cerrar sesión: borra del navegador todo lo que pudo quedar del Sheet. */
export function limpiarSesion() {
  try {
    sessionStorage.removeItem('tm.pin')
    sessionStorage.removeItem('tm.rol')
    localStorage.removeItem(K.cache)
  } catch {
    /* noop */
  }
}
