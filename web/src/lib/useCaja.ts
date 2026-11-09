import { useCallback, useEffect, useRef, useState } from 'react'
import type { Movimiento } from './types'
import { borrar, getSheetsUrl, guardar, listar, SheetsError } from './sheets'
import { demoMovimientos } from './demoData'

export type SyncState = 'demo' | 'cargando' | 'sincronizado' | 'guardando' | 'sin-conexion' | 'error'

type Op = { kind: 'upsert'; row: Movimiento } | { kind: 'delete'; id: string }

const K = { cache: 'tm.cache', queue: 'tm.queue', demo: 'tm.demo-ejemplo' }
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

/**
 * Estado de la caja. Con URL de Apps Script: lee del Sheet, guarda al instante
 * (optimista) y reintenta lo pendiente si se cae el internet. Sin URL: modo demo
 * con datos de EJEMPLO (inventados), guardados solo en este navegador.
 */
export function useCaja(pin: string) {
  const url = getSheetsUrl()
  const demo = !url
  const [rows, setRows] = useState<Movimiento[]>([])
  const [state, setState] = useState<SyncState>(demo ? 'demo' : 'cargando')
  const [error, setError] = useState('')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const queue = useRef<Op[]>(read<Op[]>(K.queue, []))
  const flushing = useRef(false)

  const applyQueue = useCallback((base: Movimiento[]) => {
    let out = base
    for (const op of queue.current) {
      if (op.kind === 'delete') out = out.filter((r) => r.id !== op.id)
      else out = [op.row, ...out.filter((r) => r.id !== op.row.id)]
    }
    return out
  }, [])

  const refresh = useCallback(async () => {
    if (demo) return
    try {
      const remote = await listar(url, pin)
      write(K.cache, remote)
      setRows(applyQueue(remote))
      setLastSync(new Date())
      setState(queue.current.length ? 'guardando' : 'sincronizado')
      setError('')
    } catch (e) {
      const err = e as SheetsError
      setState(err.kind === 'network' ? 'sin-conexion' : 'error')
      setError(err.message)
    }
  }, [demo, url, pin, applyQueue])

  const flush = useCallback(async () => {
    if (demo || flushing.current || !queue.current.length) return
    flushing.current = true
    setState('guardando')
    try {
      while (queue.current.length) {
        // agrupa upserts consecutivos en una sola llamada
        const head = queue.current[0]
        if (head.kind === 'delete') {
          await borrar(url, pin, [head.id])
          queue.current = queue.current.slice(1)
        } else {
          let n = 0
          while (n < queue.current.length && queue.current[n].kind === 'upsert') n++
          const batch = queue.current.slice(0, n).map((o) => (o as Extract<Op, { kind: 'upsert' }>).row)
          await guardar(url, pin, batch)
          queue.current = queue.current.slice(n)
        }
        write(K.queue, queue.current)
      }
      setState('sincronizado')
      setLastSync(new Date())
      setError('')
    } catch (e) {
      const err = e as SheetsError
      setState(err.kind === 'network' ? 'sin-conexion' : 'error')
      setError(err.message)
    } finally {
      flushing.current = false
    }
  }, [demo, url, pin])

  // carga inicial
  useEffect(() => {
    if (demo) {
      setRows(read<Movimiento[] | null>(K.demo, null) ?? demoMovimientos())
      return
    }
    const cached = read<Movimiento[]>(K.cache, [])
    if (cached.length) setRows(applyQueue(cached))
    refresh().then(flush)
  }, [demo, refresh, flush, applyQueue])

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
      setRows((prev) => {
        const next = op.kind === 'delete' ? prev.filter((r) => r.id !== op.id) : [op.row, ...prev.filter((r) => r.id !== op.row.id)]
        if (demo) write(K.demo, next)
        return next
      })
      if (demo) return
      queue.current = [...queue.current, op]
      write(K.queue, queue.current)
      flush()
    },
    [demo, flush],
  )

  const save = useCallback((row: Movimiento) => commit({ kind: 'upsert', row }), [commit])
  const remove = useCallback((id: string) => commit({ kind: 'delete', id }), [commit])

  const resetDemo = useCallback(async () => {
    try {
      localStorage.removeItem(K.demo)
    } catch {
      /* noop */
    }
    setRows(demoMovimientos())
  }, [])

  return { rows, state, error, lastSync, demo, url, save, remove, refresh: () => refresh().then(flush), resetDemo, pending: queue.current.length }
}
