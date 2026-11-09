const cop = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 })

export const money = (n: number) => cop.format(Math.round(n)).replace(/\s/g, ' ')
export const number = (n: number) => num.format(n)

/** $63,0 M · $845 mil · $9.500 — para titulares y ejes */
export function moneyShort(n: number) {
  const a = Math.abs(n)
  const s = n < 0 ? '−' : ''
  if (a >= 1_000_000) return `${s}$${num.format(a / 1_000_000)} M`
  if (a >= 10_000) return `${s}$${Math.round(a / 1000)} mil`
  return `${s}$${new Intl.NumberFormat('es-CO').format(Math.round(a))}`
}

export const pct = (n: number) => `${num.format(n * 100)} %`

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const parseDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
export const weekday = (iso: string) => DIAS[parseDate(iso).getDay()]
export const dayShort = (iso: string) => {
  const d = parseDate(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}
export const dateLong = (iso: string) => {
  const d = parseDate(iso)
  return `${DIAS[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}`
}
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
