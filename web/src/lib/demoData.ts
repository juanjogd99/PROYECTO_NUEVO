import { efectivoDelDia, type Caja, type Movimiento, type Precio } from './types'
import { todayISO } from './format'
import { cotizar } from './precios'

/**
 * Datos de EJEMPLO para el modo demostración (inventados, no son ventas reales).
 * Las ventas reales viven solo en el Google Sheet, protegidas por el PIN.
 * Se generan con una semilla fija: siempre salen iguales para el mismo día.
 */

export const demoPrecios: Precio[] = [
  { producto: 'Gabardina', unidad: 'metro', precio: 16000, mayorDesde: 10, precioMayor: 14000 },
  { producto: 'Dril', unidad: 'metro', precio: 14000, mayorDesde: 10, precioMayor: 12500 },
  { producto: 'Paño', unidad: 'metro', precio: 28000, mayorDesde: 5, precioMayor: 25000 },
  { producto: 'Dacrón', unidad: 'metro', precio: 26000, mayorDesde: 5, precioMayor: 23500 },
  { producto: 'Toalla', unidad: 'metro', precio: 12500, mayorDesde: 5, precioMayor: 11000 },
  { producto: 'Satín', unidad: 'metro', precio: 4500, mayorDesde: 20, precioMayor: 3800 },
  { producto: 'Lencería', unidad: 'metro', precio: 8500, mayorDesde: 10, precioMayor: 7500 },
  { producto: 'Lino', unidad: 'metro', precio: 8000, mayorDesde: 10, precioMayor: 7000 },
  { producto: 'Velo bordado', unidad: 'metro', precio: 17000, mayorDesde: 10, precioMayor: 15000 },
  { producto: 'Yakar', unidad: 'metro', precio: 15000, mayorDesde: 5, precioMayor: 13500 },
  { producto: 'Piel de conejo', unidad: 'metro', precio: 15500, mayorDesde: 5, precioMayor: 14000 },
  { producto: 'Antifluido', unidad: 'metro', precio: 12000, mayorDesde: 10, precioMayor: 10500 },
  { producto: 'Muselina', unidad: 'metro', precio: 7500, mayorDesde: 10, precioMayor: 6500 },
  { producto: 'Organza', unidad: 'metro', precio: 14000, mayorDesde: 10, precioMayor: 12000 },
  { producto: 'Mantel', unidad: 'unidad', precio: 38000, mayorDesde: 0, precioMayor: 0 },
  { producto: 'Cortina', unidad: 'unidad', precio: 60000, mayorDesde: 0, precioMayor: 0 },
]

const PESO: Record<string, number> = { Toalla: 14, Gabardina: 7, Dril: 5, Satín: 8, Lencería: 7, Yakar: 5, 'Piel de conejo': 5, Lino: 6, 'Velo bordado': 5, Paño: 4, Dacrón: 3, Antifluido: 4, Muselina: 3, Organza: 2, Mantel: 2, Cortina: 5 }
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
function pick<T>(r: () => number, items: [T, number][]): T {
  const total = items.reduce((s, it) => s + it[1], 0)
  let x = r() * total
  for (const it of items) if ((x -= it[1]) <= 0) return it[0]
  return items[items.length - 1][0]
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const dias = (n: number) => {
  const [y, m, d] = todayISO().split('-').map(Number)
  const day = new Date(y, m - 1, d)
  day.setDate(day.getDate() - n)
  return day
}

export function demoMovimientos(): Movimiento[] {
  const r = rng(20260901)
  const out: Movimiento[] = []
  const productos = demoPrecios.map((p) => [p.producto, PESO[p.producto] ?? 2] as [string, number])
  let n = 0
  for (let back = 30; back >= 0; back--) {
    const day = dias(back)
    const wd = day.getDay()
    if (wd === 0) continue // domingo cerrado
    const fecha = iso(day)
    const hoy = back === 0
    const ventas = Math.round((wd === 6 ? 62 : wd === 1 ? 38 : 48) * (0.8 + r() * 0.4) * (hoy ? 0.4 : 1))
    for (let i = 0; i < ventas; i++) {
      const concepto = pick(r, productos)
      const unidad = demoPrecios.find((p) => p.producto === concepto)!.unidad === 'unidad'
      const cantidad = unidad ? 1 + Math.floor(r() * 2) : Math.round((0.5 + r() * (r() < 0.12 ? 14 : 3)) * 10) / 10
      const cot = cotizar(demoPrecios, concepto, cantidad)!
      const abono = concepto === 'Cortina' && r() < 0.35
      out.push({
        id: `DEMO-${String(++n).padStart(4, '0')}`,
        fecha,
        tipo: 'Ingreso',
        categoria: abono ? 'Abono / saldo de pedido' : 'Venta',
        concepto: abono ? 'Abono cortina' : r() < 0.08 ? 'Venta sin detalle' : concepto,
        cantidad,
        valor: cot.valor,
        total: cot.total,
        forma: pick(r, FORMAS),
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

export function demoPrivados(): Movimiento[] {
  const rows: [number, string, string, number, string][] = [
    [28, 'Pago a proveedor', 'Proveedor de gabardina y dril', 9800000, 'Transferencia'],
    [25, 'Arriendo y servicios', 'Arriendo del local', 3500000, 'Transferencia'],
    [24, 'Arriendo y servicios', 'Luz y agua', 420000, 'Transferencia'],
    [21, 'Nómina', 'Pago quincena (3 personas)', 2400000, 'Efectivo'],
    [18, 'Retiro personal', 'Retiro para la casa', 1500000, 'Efectivo'],
    [14, 'Pago a proveedor', 'Proveedor de toalla y lencería', 8600000, 'Transferencia'],
    [7, 'Pago a proveedor', 'Proveedor de satín y velos', 6400000, 'Transferencia'],
    [10, 'Impuestos', 'Industria y comercio', 380000, 'Transferencia'],
    [6, 'Nómina', 'Pago quincena (3 personas)', 2400000, 'Efectivo'],
    [4, 'Ahorro / inversión', 'Ahorro programado', 1000000, 'Transferencia'],
    [2, 'Retiro personal', 'Retiro para la casa', 1200000, 'Efectivo'],
  ]
  return rows.map(([back, categoria, concepto, total, forma], i) => ({
    id: `PRIV-DEMO-${i + 1}`,
    fecha: iso(dias(back)),
    tipo: 'Egreso',
    categoria,
    concepto,
    cantidad: 1,
    valor: total,
    total,
    forma,
    asesor: '',
    nota: '',
    origen: 'ejemplo',
  }))
}

/** Historial de aperturas y cierres de EJEMPLO. Hoy queda sin abrir para probar la apertura. */
export function demoCajas(rows: Movimiento[]): Caja[] {
  const r = rng(77)
  const hoy = todayISO()
  const fechas = [...new Set(rows.map((x) => x.fecha))].filter((f) => f < hoy).sort()
  return fechas.map((fecha, i) => {
    const { ventas, gastos } = efectivoDelDia(rows, fecha)
    const base = 200000
    const esperado = base + ventas - gastos
    const x = r()
    const diferencia = x < 0.7 ? 0 : x < 0.9 ? -Math.round((2 + r() * 13) * 1000) : Math.round((1 + r() * 4) * 1000)
    return {
      fecha,
      estado: 'cerrada',
      base,
      abrio: i % 3 ? 'Ana' : 'Luis',
      apertura: `08:0${Math.floor(r() * 9)}`,
      ventasEfectivo: ventas,
      gastosEfectivo: gastos,
      esperado,
      contado: esperado + diferencia,
      diferencia,
      cerro: i % 3 ? 'Ana' : 'Luis',
      cierre: `19:${String(Math.floor(r() * 40) + 10)}`,
      nota: '',
    } satisfies Caja
  })
}
