import type { Movimiento } from './types'
import { todayISO } from './format'

/**
 * Datos de EJEMPLO para el modo demostración (inventados, no son ventas reales).
 * Las ventas reales viven solo en el Google Sheet, protegidas por el PIN.
 * Se generan con una semilla fija: siempre salen iguales.
 */

const PRODUCTOS: [string, number, number][] = [
  // nombre, precio por metro/unidad, peso (qué tan seguido se vende)
  ['Toalla', 12000, 14],
  ['Satín', 4500, 8],
  ['Lencería', 8500, 7],
  ['Yakar', 15000, 6],
  ['Piel de conejo', 15500, 6],
  ['Lino', 8000, 6],
  ['Velo bordado', 17000, 5],
  ['Antifluido', 12000, 4],
  ['Muselina', 7500, 3],
  ['Paño', 28000, 3],
  ['Organza', 14000, 2],
  ['Mantel', 38000, 2],
  ['Cortina', 60000, 5],
]
const FORMAS: [string, number][] = [['Efectivo', 78], ['Transferencia', 11], ['Tarjeta', 8], ['QR', 2], ['Nequi', 1]]
const GASTOS: [string, string, number][] = [
  ['Gasto operativo', 'Transporte', 45000],
  ['Gasto operativo', 'Almuerzo', 20000],
  ['Gasto operativo', 'Domicilio', 10000],
  ['Compra de mercancía', 'Compra de satín', 180000],
  ['Gasto operativo', 'Flete', 80000],
]

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}
const pick = <T,>(r: () => number, items: [T, ...unknown[]][], wIndex: number) => {
  const total = items.reduce((s, it) => s + (it[wIndex] as number), 0)
  let x = r() * total
  for (const it of items) if ((x -= it[wIndex] as number) <= 0) return it
  return items[items.length - 1]
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function demoMovimientos(): Movimiento[] {
  const r = rng(20260901)
  const out: Movimiento[] = []
  const [y, m, d] = todayISO().split('-').map(Number)
  const end = new Date(y, m - 1, d)
  let n = 0
  for (let back = 30; back >= 1; back--) {
    const day = new Date(end)
    day.setDate(end.getDate() - back)
    const wd = day.getDay()
    if (wd === 0) continue // domingo cerrado
    const fecha = iso(day)
    const ventas = Math.round((wd === 6 ? 62 : wd === 1 ? 38 : 48) * (0.8 + r() * 0.4))
    for (let i = 0; i < ventas; i++) {
      const [concepto, precio] = pick(r, PRODUCTOS, 2) as [string, number, number]
      const esCortina = concepto === 'Cortina'
      const cantidad = esCortina ? 1 + Math.floor(r() * 2) : Math.round((0.5 + r() * (r() < 0.1 ? 12 : 3)) * 10) / 10
      const valor = Math.round((precio * (0.85 + r() * 0.3)) / 500) * 500
      const abono = esCortina && r() < 0.35
      out.push({
        id: `DEMO-${String(++n).padStart(4, '0')}`,
        fecha,
        tipo: 'Ingreso',
        categoria: abono ? 'Abono / saldo de pedido' : 'Venta',
        concepto: abono ? 'Abono cortina' : r() < 0.1 ? 'Venta sin detalle' : concepto,
        cantidad,
        valor,
        total: Math.round(cantidad * valor),
        forma: (pick(r, FORMAS, 1) as [string, number])[0],
        asesor: String(1 + Math.floor(r() * 3)),
        nota: '',
        origen: 'ejemplo',
      })
    }
    if (r() < 0.45) {
      const [categoria, concepto, valor] = GASTOS[Math.floor(r() * GASTOS.length)]
      out.push({ id: `DEMO-${String(++n).padStart(4, '0')}`, fecha, tipo: 'Egreso', categoria, concepto, cantidad: 1, valor, total: valor, forma: 'Efectivo', asesor: '', nota: '', origen: 'ejemplo' })
    }
  }
  return out
}
