import type { Precio } from './types'

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/** Busca el producto en la lista: primero exacto, luego el nombre más largo con el que empieza. */
export function buscarPrecio(precios: Precio[], concepto: string): Precio | undefined {
  const c = norm(concepto)
  if (!c) return undefined
  const exacto = precios.find((p) => norm(p.producto) === c)
  if (exacto) return exacto
  return [...precios].sort((a, b) => b.producto.length - a.producto.length).find((p) => c.startsWith(norm(p.producto)))
}

export interface Cotizacion {
  precio: Precio
  valor: number // precio unitario aplicado
  mayor: boolean // si aplicó el precio por mayor
  total: number
  faltaParaMayor: number // unidades que faltan para el precio por mayor (0 si ya aplica o no existe)
}

/** El cálculo que hace la dueña de memoria: detal o por mayor según la cantidad. */
export function cotizar(precios: Precio[], concepto: string, cantidad: number): Cotizacion | undefined {
  const p = buscarPrecio(precios, concepto)
  if (!p) return undefined
  const tieneMayor = p.mayorDesde > 0 && p.precioMayor > 0
  const mayor = tieneMayor && cantidad >= p.mayorDesde
  const valor = mayor ? p.precioMayor : p.precio
  return {
    precio: p,
    valor,
    mayor,
    total: Math.round(valor * cantidad),
    faltaParaMayor: tieneMayor && !mayor ? Math.max(0, Math.round((p.mayorDesde - cantidad) * 100) / 100) : 0,
  }
}

export function normalizarPrecio(r: Partial<Precio>): Precio {
  const n = (v: unknown) => {
    const x = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[$.\s]/g, '').replace(',', '.'))
    return Number.isFinite(x) ? x : 0
  }
  return {
    producto: String(r.producto ?? '').trim(),
    unidad: String(r.unidad ?? 'metro').toLowerCase().startsWith('u') ? 'unidad' : 'metro',
    precio: n(r.precio),
    mayorDesde: n(r.mayorDesde),
    precioMayor: n(r.precioMayor),
  }
}
