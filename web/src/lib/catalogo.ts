import type { Stock, Variante } from './types'

export const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

export interface ResumenTela {
  estado: Stock // el mejor estado entre sus colores
  disponibles: number
  total: number
  modelos: { modelo: string; colores: Variante[] }[]
}

/** Agrupa las variantes de una tela por modelo y resume si hay o no. */
export function resumenTela(catalogo: Variante[], tela: string): ResumenTela | undefined {
  const vs = catalogo.filter((v) => norm(v.tela) === norm(tela))
  if (!vs.length) return undefined
  const modelos = new Map<string, Variante[]>()
  for (const v of vs) modelos.set(v.modelo || '—', [...(modelos.get(v.modelo || '—') ?? []), v])
  const disponibles = vs.filter((v) => v.estado !== 'agotado').length
  return {
    estado: vs.some((v) => v.estado === 'disponible') ? 'disponible' : vs.some((v) => v.estado === 'pocas') ? 'pocas' : 'agotado',
    disponibles,
    total: vs.length,
    modelos: [...modelos].map(([modelo, colores]) => ({ modelo, colores })),
  }
}

export function normalizarVariante(v: Partial<Variante>): Variante {
  const e = norm(String(v.estado ?? ''))
  return {
    categoria: String(v.categoria ?? '').trim(),
    tela: String(v.tela ?? '').trim(),
    modelo: String(v.modelo ?? '').trim(),
    color: String(v.color ?? '').trim(),
    hex: /^#[0-9a-f]{6}$/i.test(String(v.hex ?? '')) ? String(v.hex) : '#cfc6b8',
    estado: e.startsWith('ago') ? 'agotado' : e.startsWith('poc') ? 'pocas' : 'disponible',
    nota: String(v.nota ?? ''),
  }
}
