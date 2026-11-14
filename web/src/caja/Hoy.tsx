import { useMemo } from 'react'
import type { Movimiento } from '../lib/types'
import { dateLong, money, number, todayISO } from '../lib/format'

/** Vista del equipo: solo el día de hoy, con lo necesario para cuadrar la caja al cerrar. */
export default function Hoy({ rows, onEdit }: { rows: Movimiento[]; onEdit: (m: Movimiento) => void }) {
  const hoy = todayISO()
  const delDia = useMemo(() => rows.filter((r) => r.fecha === hoy).sort((a, b) => b.id.localeCompare(a.id)), [rows, hoy])

  const r = useMemo(() => {
    const ing = delDia.filter((m) => m.tipo === 'Ingreso')
    const egr = delDia.filter((m) => m.tipo === 'Egreso')
    const porForma = new Map<string, number>()
    for (const m of ing) porForma.set(String(m.forma), (porForma.get(String(m.forma)) ?? 0) + m.total)
    const efectivoEntra = porForma.get('Efectivo') ?? 0
    const efectivoSale = egr.filter((m) => m.forma === 'Efectivo').reduce((s, m) => s + m.total, 0)
    return {
      vendido: ing.reduce((s, m) => s + m.total, 0),
      ventas: ing.length,
      gastos: egr.reduce((s, m) => s + m.total, 0),
      efectivoEnCaja: efectivoEntra - efectivoSale,
      porForma: [...porForma].sort((a, b) => b[1] - a[1]),
    }
  }, [delDia])

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-ink p-5 text-linen">
          <p className="text-xs font-semibold tracking-wide text-linen/60 uppercase">Vendido hoy</p>
          <p className="mt-2 font-display text-3xl tracking-tight tabular">{money(r.vendido)}</p>
          <p className="mt-1 text-xs text-linen/60">{r.ventas} ventas</p>
        </div>
        <div className="rounded-2xl border border-line bg-paper p-5">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Gastos de caja</p>
          <p className="mt-2 font-display text-3xl tracking-tight tabular">{money(r.gastos)}</p>
        </div>
        <div className="col-span-2 rounded-2xl border border-good/30 bg-good/5 p-5">
          <p className="text-xs font-semibold tracking-wide text-good uppercase">Efectivo que debe haber en caja</p>
          <p className="mt-2 font-display text-3xl tracking-tight tabular">{money(r.efectivoEnCaja)}</p>
          <p className="mt-1 text-xs text-muted">Ventas en efectivo menos gastos pagados en efectivo. Compáralo con lo que cuentas al cerrar (más la base del día).</p>
        </div>
      </div>

      {r.porForma.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {r.porForma.map(([f, v]) => (
            <span key={f} className="rounded-full border border-line bg-paper px-3 py-1.5 text-sm">
              {f} <b className="ml-1 tabular">{money(v)}</b>
            </span>
          ))}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-line bg-paper">
        <header className="flex items-baseline justify-between border-b border-line px-5 py-3">
          <h2 className="font-display text-lg tracking-tight first-letter:uppercase">{dateLong(hoy)}</h2>
          <span className="text-xs text-muted">Toca un movimiento para corregirlo</span>
        </header>
        {delDia.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted">Todavía no hay movimientos hoy. Registra la primera venta con el botón +.</p>
        ) : (
          <ul className="divide-y divide-line/70">
            {delDia.map((m) => (
              <li key={m.id}>
                <button onClick={() => onEdit(m)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-linen/60">
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{m.concepto}</span>
                    <span className="block text-xs text-muted">
                      {m.tipo === 'Ingreso' ? `${number(m.cantidad)} × ${money(m.valor)}` : m.categoria} · {m.forma}
                      {m.asesor && ` · asesor ${m.asesor}`}
                    </span>
                  </span>
                  <span className={`shrink-0 font-semibold tabular ${m.tipo === 'Egreso' ? 'text-bad' : ''}`}>
                    {m.tipo === 'Egreso' ? '−' : ''}
                    {money(m.total)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
