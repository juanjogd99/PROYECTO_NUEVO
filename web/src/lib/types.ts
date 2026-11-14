export type Tipo = 'Ingreso' | 'Egreso'

/** equipo: registra el día y consulta precios. duena: ve todo, edita y tiene sus cuentas privadas. */
export type Rol = 'equipo' | 'duena'

export const FORMAS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'QR'] as const
export type Forma = (typeof FORMAS)[number] | string

/** Categorías de la caja del almacén (pestaña MOVIMIENTOS). */
export const CATEGORIAS: Record<Tipo, string[]> = {
  Ingreso: ['Venta', 'Abono / saldo de pedido', 'Otro ingreso'],
  Egreso: ['Gasto operativo', 'Compra de mercancía', 'Otro egreso'],
}

/** Categorías de las cuentas privadas de la dueña (pestaña PRIVADO). */
export const CATEGORIAS_PRIVADO: Record<Tipo, string[]> = {
  Egreso: ['Pago a proveedor', 'Nómina', 'Arriendo y servicios', 'Impuestos', 'Otro costo del negocio', 'Retiro personal', 'Ahorro / inversión'],
  Ingreso: ['Ingreso aparte', 'Préstamo recibido'],
}
/** Egresos privados que son costos del negocio (restan para calcular la utilidad). */
export const COSTOS_NEGOCIO = ['Pago a proveedor', 'Nómina', 'Arriendo y servicios', 'Impuestos', 'Otro costo del negocio']

/** Una fila de MOVIMIENTOS o de PRIVADO en el Google Sheet. */
export interface Movimiento {
  id: string
  fecha: string // yyyy-mm-dd
  tipo: Tipo
  categoria: string
  concepto: string
  cantidad: number
  valor: number // valor unitario
  total: number
  forma: Forma
  asesor: string
  nota: string
  origen: string // de dónde vino: "app", "sheet", "Semana 1!20"…
}

/** Una fila de la pestaña PRECIOS. */
export interface Precio {
  producto: string
  unidad: 'metro' | 'unidad'
  precio: number // precio al detal
  mayorDesde: number // desde cuántas unidades aplica el precio por mayor (0 = no hay)
  precioMayor: number
}

/** Apertura y cierre de la caja de un día (pestaña CAJAS). */
export interface Caja {
  fecha: string // yyyy-mm-dd
  estado: 'abierta' | 'cerrada'
  base: number // efectivo con que se abre
  abrio: string
  apertura: string // hora HH:mm
  ventasEfectivo: number // calculado al cerrar
  gastosEfectivo: number
  esperado: number // base + ventas en efectivo − gastos en efectivo
  contado: number // efectivo contado al cerrar
  diferencia: number // contado − esperado (positivo sobra, negativo falta)
  cerro: string
  cierre: string // hora HH:mm
  nota: string
}

/** Lo que entra y sale en efectivo en un día: la base del cuadre. */
export function efectivoDelDia(rows: Movimiento[], fecha: string) {
  let ventas = 0
  let gastos = 0
  for (const r of rows) {
    if (r.fecha !== fecha || (r.forma || 'Efectivo') !== 'Efectivo') continue
    if (r.tipo === 'Ingreso') ventas += r.total
    else gastos += r.total
  }
  return { ventas, gastos }
}
