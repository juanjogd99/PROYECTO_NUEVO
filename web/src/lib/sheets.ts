import type { Movimiento, Precio, Rol } from './types'
import { normalizarPrecio } from './precios'

/**
 * Cliente del Web App de Google Apps Script (ver /apps-script/Code.gs).
 *
 * GET  ?action=list&pin=…                    → { ok, rol, rows, privados?, precios }
 * POST {action:'ping', pin}                  → { ok, rol }
 * POST {action:'upsert', pin, hoja?, rows}   → { ok, saved }      hoja: 'movimientos' | 'privado'
 * POST {action:'delete', pin, hoja?, ids}    → { ok, deleted }
 * POST {action:'precios', pin, precios}      → { ok, saved }      (solo la dueña)
 *
 * El servidor decide qué ve cada PIN: el equipo solo recibe los movimientos de hoy
 * y nunca recibe la pestaña PRIVADO.
 * El POST va como text/plain para evitar el "preflight" CORS, que Apps Script no responde.
 */

export type Hoja = 'movimientos' | 'privado'

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
  kind: 'auth' | 'network' | 'server' | 'permiso'
  constructor(message: string, kind: 'auth' | 'network' | 'server' | 'permiso') {
    super(message)
    this.kind = kind
  }
}

const MENSAJES: Record<string, [string, SheetsError['kind']]> = {
  PIN_INVALIDO: ['PIN incorrecto', 'auth'],
  SIN_PERMISO: ['Ese cambio solo lo puede hacer la dueña', 'permiso'],
  SOLO_HOY: ['Desde la caja solo se pueden registrar o corregir movimientos de hoy', 'permiso'],
}

async function parse(res: Response) {
  let data: { ok?: boolean; error?: string; [k: string]: unknown }
  try {
    data = await res.json()
  } catch {
    throw new SheetsError('El Sheet no respondió con datos válidos. ¿La URL es la del Web App (/exec)?', 'server')
  }
  if (!data.ok) {
    const [msg, kind] = MENSAJES[String(data.error)] ?? [String(data.error ?? 'Error del Sheet'), 'server']
    throw new SheetsError(msg, kind)
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

export interface Datos {
  rol: Rol
  rows: Movimiento[]
  privados: Movimiento[]
  precios: Precio[]
}

export async function listar(url: string, pin: string): Promise<Datos> {
  const d = await call(`${url}?action=list&pin=${encodeURIComponent(pin)}&t=${Date.now()}`)
  return {
    rol: d.rol === 'duena' ? 'duena' : 'equipo',
    rows: ((d.rows as Movimiento[]) ?? []).map(normalizar),
    privados: ((d.privados as Movimiento[]) ?? []).map(normalizar),
    precios: ((d.precios as Precio[]) ?? []).map(normalizarPrecio).filter((p) => p.producto),
  }
}

const post = (url: string, body: object) =>
  call(url, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })

export const ping = async (url: string, pin: string): Promise<Rol> => ((await post(url, { action: 'ping', pin })).rol === 'duena' ? 'duena' : 'equipo')
export const guardar = (url: string, pin: string, rows: Movimiento[], hoja: Hoja = 'movimientos') => post(url, { action: 'upsert', pin, hoja, rows })
export const borrar = (url: string, pin: string, ids: string[], hoja: Hoja = 'movimientos') => post(url, { action: 'delete', pin, hoja, ids })
export const guardarPrecios = (url: string, pin: string, precios: Precio[]) => post(url, { action: 'precios', pin, precios })

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
