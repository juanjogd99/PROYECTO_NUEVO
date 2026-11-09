import type { Movimiento } from './types'

/**
 * Cliente del Web App de Google Apps Script (ver /apps-script/Code.gs).
 *
 * - GET  ?action=list&pin=…            → { ok, rows }
 * - POST {action:'upsert', pin, rows}   → { ok, saved }
 * - POST {action:'delete', pin, ids}    → { ok, deleted }
 * - POST {action:'ping', pin}           → { ok }
 *
 * El POST va como text/plain para evitar el "preflight" CORS, que Apps Script no responde.
 */

const URL_KEY = 'tm.sheetsUrl'

export function getSheetsUrl(): string {
  try {
    const saved = localStorage.getItem(URL_KEY)
    if (saved) return saved
  } catch {
    /* almacenamiento bloqueado */
  }
  return (import.meta.env.VITE_SHEETS_URL as string | undefined) ?? ''
}

export function setSheetsUrl(url: string) {
  try {
    if (url) localStorage.setItem(URL_KEY, url.trim())
    else localStorage.removeItem(URL_KEY)
  } catch {
    /* noop */
  }
}

export class SheetsError extends Error {
  kind: 'auth' | 'network' | 'server'
  constructor(message: string, kind: 'auth' | 'network' | 'server') {
    super(message)
    this.kind = kind
  }
}

async function parse(res: Response) {
  let data: { ok?: boolean; error?: string; [k: string]: unknown }
  try {
    data = await res.json()
  } catch {
    throw new SheetsError('El Sheet no respondió con datos válidos. ¿La URL es la del Web App (/exec)?', 'server')
  }
  if (!data.ok) {
    const auth = data.error === 'PIN_INVALIDO'
    throw new SheetsError(auth ? 'PIN incorrecto' : String(data.error ?? 'Error del Sheet'), auth ? 'auth' : 'server')
  }
  return data
}

async function call(url: string, init?: RequestInit) {
  let res: Response
  try {
    res = await fetch(url, { redirect: 'follow', ...init })
  } catch {
    throw new SheetsError('Sin conexión con Google Sheets', 'network')
  }
  return parse(res)
}

export async function listar(url: string, pin: string): Promise<Movimiento[]> {
  const data = await call(`${url}?action=list&pin=${encodeURIComponent(pin)}&t=${Date.now()}`)
  return (data.rows as Movimiento[]).map(normalizar)
}

const post = (url: string, body: object) =>
  call(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })

export const ping = (url: string, pin: string) => post(url, { action: 'ping', pin })
export const guardar = (url: string, pin: string, rows: Movimiento[]) => post(url, { action: 'upsert', pin, rows })
export const borrar = (url: string, pin: string, ids: string[]) => post(url, { action: 'delete', pin, ids })

/** Las filas editadas a mano en el Sheet pueden traer números como texto o celdas vacías. */
export function normalizar(r: Partial<Movimiento>): Movimiento {
  const n = (v: unknown) => {
    const x = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[$.\s]/g, '').replace(',', '.'))
    return Number.isFinite(x) ? x : 0
  }
  const cantidad = n(r.cantidad) || 1
  const valor = n(r.valor)
  const total = n(r.total) || valor * cantidad
  return {
    id: String(r.id ?? ''),
    fecha: String(r.fecha ?? '').slice(0, 10),
    tipo: r.tipo === 'Egreso' ? 'Egreso' : 'Ingreso',
    categoria: String(r.categoria || (r.tipo === 'Egreso' ? 'Otro egreso' : 'Venta')),
    concepto: String(r.concepto ?? ''),
    cantidad,
    valor,
    total,
    forma: String(r.forma || 'Efectivo'),
    asesor: String(r.asesor ?? ''),
    nota: String(r.nota ?? ''),
    origen: String(r.origen ?? 'sheet'),
  }
}
