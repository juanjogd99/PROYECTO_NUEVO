import type { Movimiento } from './types'
import { parseDate } from './format'

const FAMILIAS: [string, string[]][] = [
  ['Cortinas', ['CORTINA']],
  ['Velos', ['VELO']],
  ['Toallas', ['TOALLA']],
  ['Yakar', ['YAKAR']],
  ['Satín', ['SATIN', 'SATÍN']],
  ['Piel de conejo', ['PIEL', 'P CONEJO', 'P. CONEJO']],
  ['Lino', ['LINO']],
  ['Lencería', ['LENCERIA', 'LENCERÍA']],
  ['Paños', ['PAÑO', 'PANO']],
  ['Antifluido', ['ANTIFLUIDO']],
  ['Dacrón', ['DACRON', 'DACRÓN', 'DACR']],
  ['Muselina', ['MUSELINA', 'MUS ']],
  ['Manteles', ['MANTEL']],
  ['Seda', ['SEDA']],
  ['Tul', ['TUL']],
  ['Navidad', ['NAVID']],
  ['Organza', ['ORGANZA']],
  ['Franela', ['FRANELA']],
]

/** Agrupa nombres escritos a mano ("toalla est", "TOALLA RAYAS") en familias de producto. */
export function familia(concepto: string) {
  const u = concepto.toUpperCase().trim()
  if (!u || u === 'VENTA SIN DETALLE') return 'Sin detalle'
  for (const [nombre, claves] of FAMILIAS) if (claves.some((k) => u.startsWith(k))) return nombre
  return 'Otras telas'
}

export interface Resumen {
  ingresos: number
  egresos: number
  neto: number
  ventas: number // nº de ventas (ingresos)
  ticket: number
  dias: number
  promedioDia: number
  porDia: { fecha: string; ingresos: number; egresos: number }[]
  porForma: { label: string; value: number }[]
  porFamilia: { label: string; value: number }[]
  porDiaSemana: { label: string; value: number; dias: number }[]
  porCategoriaEgreso: { label: string; value: number }[]
  mejorDia?: { fecha: string; ingresos: number }
  sinDetalle: number // proporción de ventas sin producto
  efectivo: number // proporción de ingresos en efectivo
  pedidos: number // ingresos por abonos/saldos de pedidos
}

const sumBy = <T,>(rows: T[], key: (r: T) => string, val: (r: T) => number) => {
  const m = new Map<string, number>()
  for (const r of rows) m.set(key(r), (m.get(key(r)) ?? 0) + val(r))
  return [...m].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

const SEMANA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function resumir(rows: Movimiento[]): Resumen {
  const ing = rows.filter((r) => r.tipo === 'Ingreso')
  const egr = rows.filter((r) => r.tipo === 'Egreso')
  const ingresos = ing.reduce((s, r) => s + r.total, 0)
  const egresos = egr.reduce((s, r) => s + r.total, 0)

  const dias = new Map<string, { ingresos: number; egresos: number }>()
  for (const r of rows) {
    const d = dias.get(r.fecha) ?? { ingresos: 0, egresos: 0 }
    if (r.tipo === 'Ingreso') d.ingresos += r.total
    else d.egresos += r.total
    dias.set(r.fecha, d)
  }
  const porDia = [...dias].map(([fecha, v]) => ({ fecha, ...v })).sort((a, b) => a.fecha.localeCompare(b.fecha))
  const conVentas = porDia.filter((d) => d.ingresos > 0)
  const mejorDia = conVentas.reduce<Resumen['mejorDia']>((m, d) => (!m || d.ingresos > m.ingresos ? d : m), undefined)

  const sem = SEMANA.map((label) => ({ label, total: 0, dias: 0 }))
  for (const d of conVentas) {
    const i = (parseDate(d.fecha).getDay() + 6) % 7
    sem[i].total += d.ingresos
    sem[i].dias += 1
  }

  const ventas = ing.filter((r) => r.categoria === 'Venta')
  return {
    ingresos,
    egresos,
    neto: ingresos - egresos,
    ventas: ing.length,
    ticket: ing.length ? ingresos / ing.length : 0,
    dias: conVentas.length,
    promedioDia: conVentas.length ? ingresos / conVentas.length : 0,
    porDia,
    porForma: sumBy(ing, (r) => String(r.forma || 'Efectivo'), (r) => r.total),
    porFamilia: sumBy(ventas, (r) => familia(r.concepto), (r) => r.total),
    porDiaSemana: sem.filter((s) => s.dias > 0).map((s) => ({ label: s.label, value: s.total / s.dias, dias: s.dias })),
    porCategoriaEgreso: sumBy(egr, (r) => r.categoria, (r) => r.total),
    mejorDia,
    sinDetalle: ventas.length ? ventas.filter((r) => familia(r.concepto) === 'Sin detalle').length / ventas.length : 0,
    efectivo: ingresos ? ing.filter((r) => (r.forma || 'Efectivo') === 'Efectivo').reduce((s, r) => s + r.total, 0) / ingresos : 0,
    pedidos: ing.filter((r) => r.categoria.startsWith('Abono')).reduce((s, r) => s + r.total, 0),
  }
}

/** Semana del mes (1–5) con semanas que empiezan en lunes, como en la hoja original. */
export function semanaDelMes(iso: string) {
  const d = parseDate(iso)
  const first = new Date(d.getFullYear(), d.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  return Math.floor((d.getDate() + offset - 1) / 7) + 1
}
