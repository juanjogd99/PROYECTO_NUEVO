import { useMemo } from 'react'
import { COSTOS_NEGOCIO, type Movimiento } from '../lib/types'
import { dayShort, money, moneyShort, pct } from '../lib/format'
import { BarList } from './charts'

interface Props {
  caja: Movimiento[] // movimientos de la caja en el periodo
  privados: Movimiento[] // cuentas privadas en el periodo
  periodo: string
  onEdit: (m: Movimiento) => void
  onNew: () => void
}

/**
 * Cuentas privadas de la dueña: lo que paga aparte de la caja (proveedores, nómina, arriendo,
 * impuestos) y sus retiros. Cruzado con la caja da la utilidad real del negocio.
 */
export default function Privado({ caja, privados, periodo, onEdit, onNew }: Props) {
  const r = useMemo(() => {
    const suma = (rows: Movimiento[], f: (m: Movimiento) => boolean) => rows.filter(f).reduce((s, m) => s + m.total, 0)
    const netoCaja = suma(caja, (m) => m.tipo === 'Ingreso') - suma(caja, (m) => m.tipo === 'Egreso')
    const costos = suma(privados, (m) => m.tipo === 'Egreso' && COSTOS_NEGOCIO.includes(m.categoria))
    const personales = suma(privados, (m) => m.tipo === 'Egreso' && !COSTOS_NEGOCIO.includes(m.categoria))
    const aparte = suma(privados, (m) => m.tipo === 'Ingreso')
    const utilidad = netoCaja - costos
    const porCat = new Map<string, number>()
    for (const m of privados) if (m.tipo === 'Egreso') porCat.set(m.categoria, (porCat.get(m.categoria) ?? 0) + m.total)
    return {
      netoCaja,
      costos,
      personales,
      aparte,
      utilidad,
      disponible: utilidad - personales + aparte,
      margen: netoCaja ? utilidad / suma(caja, (m) => m.tipo === 'Ingreso') : 0,
      porCat: [...porCat].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    }
  }, [caja, privados])

  const lista = useMemo(() => [...privados].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id)), [privados])

  return (
    <div className="space-y-5">
      <p className="flex items-center gap-2 rounded-xl bg-indigo/8 px-4 py-3 text-sm text-indigo">
        <svg viewBox="0 0 20 20" className="size-4 shrink-0" fill="none" aria-hidden>
          <rect x="4" y="9" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        Solo tú ves esta sección. El equipo no recibe estos datos, ni siquiera desde el Sheet.
      </p>

      {/* Del ingreso a lo que queda: una cascada leída de arriba abajo */}
      <section className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
        <header className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-lg tracking-tight">Resultado del negocio</h2>
            <p className="text-xs text-muted">{periodo}</p>
          </div>
          <button onClick={onNew} className="press rounded-full bg-indigo px-4 py-2 text-sm font-semibold text-linen">
            + Registrar cuenta privada
          </button>
        </header>
        <dl className="divide-y divide-line/70 text-sm">
          {[
            { k: 'Neto de caja del almacén', v: r.netoCaja, hint: 'Ingresos menos gastos registrados en la caja' },
            { k: '− Costos pagados aparte', v: -r.costos, hint: 'Proveedores, nómina, arriendo, impuestos' },
            { k: '= Utilidad estimada del negocio', v: r.utilidad, strong: true, hint: r.netoCaja ? `Margen ${pct(r.margen)} sobre lo vendido` : '' },
            { k: '− Retiros y ahorro personal', v: -r.personales, hint: 'Lo que sacaste para ti' },
            { k: '+ Ingresos aparte', v: r.aparte, hint: 'Préstamos u otros ingresos fuera de la caja' },
            { k: '= Queda en el negocio', v: r.disponible, strong: true, hint: '' },
          ].map((row) => (
            <div key={row.k} className={`flex items-baseline justify-between gap-4 py-3 ${row.strong ? 'font-semibold' : ''}`}>
              <dt>
                {row.k}
                {row.hint && <span className="block text-xs font-normal text-muted">{row.hint}</span>}
              </dt>
              <dd className={`shrink-0 font-display text-xl tracking-tight tabular ${row.strong ? (row.v < 0 ? 'text-bad' : 'text-ink') : row.v < 0 ? 'text-ink-2' : ''}`}>{money(row.v)}</dd>
            </div>
          ))}
        </dl>
        {r.costos === 0 && r.netoCaja > 0 && (
          <p className="mt-4 rounded-xl bg-linen px-4 py-3 text-sm text-ink-2">Todavía no registras costos de este periodo. Sin proveedores, nómina y arriendo, la utilidad sale más alta de lo que en realidad es.</p>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
          <h2 className="mb-5 font-display text-lg tracking-tight">Pagos por categoría</h2>
          {r.porCat.length ? <BarList data={r.porCat} total={r.costos + r.personales} tone="ink" /> : <p className="text-sm text-muted">Sin pagos en este periodo.</p>}
        </section>

        <section className="overflow-hidden rounded-2xl border border-line bg-paper">
          <header className="flex items-baseline justify-between border-b border-line px-5 py-3">
            <h2 className="font-display text-lg tracking-tight">Mis movimientos</h2>
            <span className="text-xs text-muted">{lista.length} en el periodo</span>
          </header>
          {lista.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-muted">No hay cuentas privadas en este periodo.</p>
          ) : (
            <ul className="max-h-[28rem] divide-y divide-line/70 overflow-y-auto" data-lenis-prevent>
              {lista.map((m) => (
                <li key={m.id}>
                  <button onClick={() => onEdit(m)} className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left hover:bg-linen/60">
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{m.concepto}</span>
                      <span className="block text-xs text-muted">
                        {dayShort(m.fecha)} · {m.categoria} · {m.forma}
                      </span>
                    </span>
                    <span className={`shrink-0 font-semibold tabular ${m.tipo === 'Egreso' ? 'text-bad' : 'text-good'}`}>
                      {m.tipo === 'Egreso' ? '−' : '+'}
                      {moneyShort(m.total)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
