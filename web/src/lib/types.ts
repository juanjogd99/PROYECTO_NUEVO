export type Tipo = 'Ingreso' | 'Egreso'

export const FORMAS = ['Efectivo', 'Transferencia', 'Tarjeta', 'Nequi', 'QR'] as const
export type Forma = (typeof FORMAS)[number] | string

export const CATEGORIAS: Record<Tipo, string[]> = {
  Ingreso: ['Venta', 'Abono / saldo de pedido', 'Otro ingreso'],
  Egreso: ['Compra de mercancía', 'Gasto operativo', 'Nómina', 'Arriendo y servicios', 'Retiro del dueño', 'Otro egreso'],
}

/** Una fila de la pestaña MOVIMIENTOS del Google Sheet. */
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
