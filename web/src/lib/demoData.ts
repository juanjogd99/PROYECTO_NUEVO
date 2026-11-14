import { efectivoDelDia, type Caja, type Movimiento, type Precio, type Variante } from './types'
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

/** Catálogo de EJEMPLO: modelos y colores con su estado de inventario. */
export const demoCatalogo: Variante[] = (
  [
    ['instituciones', 'Gabardina', 'Tempo', [['Azul oscuro', '#1f2a44', 'disponible'], ['Gris', '#7b7f86', 'disponible'], ['Beige', '#cdb894', 'pocas'], ['Verde', '#2f4a3a', 'disponible'], ['Negro', '#1c1c1c', 'agotado']]],
    ['instituciones', 'Dril', 'Industrial', [['Caqui', '#a89270', 'disponible'], ['Azul', '#2b3d63', 'disponible'], ['Gris', '#6e7277', 'pocas']]],
    ['instituciones', 'Lino flex', 'Liso', [['Blanco', '#f4f2ec', 'disponible'], ['Azul cielo', '#a9c6e3', 'disponible'], ['Rosado', '#e9bfc8', 'agotado']]],
    ['instituciones', 'Escocés', 'Cuadro mediano', [['Rojo y azul', '#9b2d30', 'disponible'], ['Verde y azul', '#2f5a4a', 'pocas']]],
    ['instituciones', 'Escocés', 'Cuadro pequeño', [['Gris y vino', '#6b4048', 'disponible']]],
    ['instituciones', 'Antifluido', 'Liso', [['Azul turquesa', '#2a8c93', 'disponible'], ['Blanco', '#f6f6f2', 'disponible'], ['Vino', '#6d1f2a', 'pocas'], ['Verde quirúrgico', '#4f8f77', 'disponible']]],
    ['trajes', 'Paño', 'Liso', [['Negro', '#1c1c1c', 'disponible'], ['Gris oxford', '#4a4c51', 'disponible'], ['Azul marino', '#1d2740', 'pocas']]],
    ['trajes', 'Paño', 'Rayas finas', [['Gris', '#5b5e63', 'agotado'], ['Azul', '#25304d', 'disponible']]],
    ['trajes', 'Vértigo', 'Liso', [['Negro', '#1c1c1c', 'disponible'], ['Azul', '#27365a', 'disponible'], ['Café', '#5a4332', 'pocas']]],
    ['cortinas', 'Yakar', 'Damasco', [['Vino', '#6d1f2a', 'disponible'], ['Beige', '#d8c7a6', 'pocas'], ['Azul noche', '#1f2a44', 'agotado'], ['Dorado', '#b8954e', 'disponible']]],
    ['cortinas', 'Yakar', 'Rombos', [['Gris', '#8a8d91', 'disponible'], ['Verde oliva', '#5d6b3a', 'disponible'], ['Terracota', '#a9553a', 'agotado']]],
    ['cortinas', 'Yakar', 'Liso texturizado', [['Crudo', '#e6dccb', 'disponible'], ['Café', '#6a4e3a', 'pocas']]],
    ['cortinas', 'Velo liso', 'Liso', [['Blanco', '#f7f6f2', 'disponible'], ['Hueso', '#ede4d3', 'disponible'], ['Gris perla', '#c9c9c6', 'pocas']]],
    ['cortinas', 'Velo bordado', 'Flores', [['Blanco', '#f7f6f2', 'disponible'], ['Beige', '#e3d6bd', 'agotado']]],
    ['cortinas', 'Velo bordado', 'Hojas', [['Blanco', '#f7f6f2', 'pocas']]],
    ['hogar', 'Toalla por metro', 'Lisa', [['Blanco', '#f7f6f2', 'disponible'], ['Azul', '#3d5a8a', 'disponible'], ['Fucsia', '#c2386f', 'pocas']]],
    ['hogar', 'Toalla por metro', 'Rayas', [['Multicolor', '#d08a3a', 'disponible']]],
    ['fiesta', 'Satín', 'Liso', [['Blanco', '#f3efe8', 'disponible'], ['Dorado', '#c9a24b', 'disponible'], ['Rojo', '#b1252c', 'disponible'], ['Azul rey', '#24439a', 'pocas'], ['Fucsia', '#c2386f', 'agotado']]],
    ['fiesta', 'Lentejuela', 'Clásica', [['Dorado', '#c9a24b', 'disponible'], ['Plateado', '#c0c2c4', 'pocas']]],
  ] as [string, string, string, [string, string, Variante['estado']][]][]
).flatMap(([categoria, tela, modelo, colores]) => colores.map(([color, hex, estado]) => ({ categoria, tela, modelo, color, hex, estado, nota: '' })))
