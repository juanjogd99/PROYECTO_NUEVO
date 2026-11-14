import { useEffect, useMemo, useState } from 'react'
import { efectivoDelDia, type Caja, type Movimiento, type Rol } from '../lib/types'
import { money, todayISO } from '../lib/format'

/* Billetes y monedas en circulación en Colombia. */
const DENOMINACIONES = [100000, 50000, 20000, 10000, 5000, 2000, 1000, 500, 200, 100, 50]
const BASES = [100000, 150000, 200000, 300000]

const input = 'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 outline-none focus:border-ink/50'

interface Props {
  caja?: Caja // la de hoy
  rows: Movimiento[]
  rol: Rol
  onAbrir: (base: number, abrio: string, nota: string) => void
  onCerrar: (contado: number, cerro: string, nota: string) => void
  onReabrir: (fecha: string) => void
}

export function estadoDiferencia(d: number) {
  if (Math.abs(d) < 1) return { label: 'Cuadra', cls: 'bg-good/10 text-good' }
  return d > 0 ? { label: `Sobran ${money(d)}`, cls: 'bg-indigo/10 text-indigo' } : { label: `Faltan ${money(-d)}`, cls: 'bg-bad/10 text-bad' }
}

/** Apertura (mañana), estado del día y cierre (noche) de la caja. */
export default function CajaDia({ caja, rows, rol, onAbrir, onCerrar, onReabrir }: Props) {
  const [cerrando, setCerrando] = useState(false)
  const hoy = todayISO()

  if (!caja) return <Apertura onAbrir={onAbrir} />

  if (caja.estado === 'cerrada') {
    const e = estadoDiferencia(caja.diferencia)
    return (
      <section className="rounded-2xl border border-line bg-paper p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-muted uppercase">
              <span className="size-2 rounded-full bg-muted" /> Caja cerrada a las {caja.cierre}
              {caja.cerro && ` · cerró ${caja.cerro}`}
            </p>
            <p className="mt-2 font-display text-2xl tracking-tight">Contado: {money(caja.contado)}</p>
            <p className="mt-1 text-sm text-muted">
              Debía haber {money(caja.esperado)}: base {money(caja.base)} + ventas en efectivo {money(caja.ventasEfectivo)} − gastos en efectivo {money(caja.gastosEfectivo)}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${e.cls}`}>{e.label}</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-muted">Ya no se pueden registrar ventas de hoy.</span>
          {rol === 'duena' && (
            <button onClick={() => onReabrir(caja.fecha)} className="press rounded-full border border-line px-4 py-2 font-semibold hover:border-ink/40">
              Reabrir caja
            </button>
          )}
        </div>
      </section>
    )
  }

  const { ventas, gastos } = efectivoDelDia(rows, hoy)
  return (
    <>
      <section className="flex flex-col gap-4 rounded-2xl border border-good/30 bg-good/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-good uppercase">
            <span className="size-2 animate-pulse rounded-full bg-good" /> Caja abierta desde las {caja.apertura}
            {caja.abrio && ` · abrió ${caja.abrio}`}
          </p>
          <p className="mt-2 text-sm text-ink-2">
            Abrió con <b className="tabular">{money(caja.base)}</b> de base. Ahora debería haber <b className="tabular">{money(caja.base + ventas - gastos)}</b> en efectivo.
          </p>
        </div>
        <button onClick={() => setCerrando(true)} className="press shrink-0 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-linen hover:bg-ink-2">
          Cerrar caja
        </button>
      </section>
      <Cierre open={cerrando} caja={caja} ventas={ventas} gastos={gastos} onClose={() => setCerrando(false)} onCerrar={(c, quien, nota) => (onCerrar(c, quien, nota), setCerrando(false))} />
    </>
  )
}

/* ── Apertura ─────────────────────────────────────────────── */

function Apertura({ onAbrir }: { onAbrir: Props['onAbrir'] }) {
  const [base, setBase] = useState(200000)
  const [quien, setQuien] = useState('')
  return (
    <section className="rounded-3xl bg-ink p-6 text-linen sm:p-8">
      <p className="text-xs font-semibold tracking-wide text-linen/60 uppercase">Antes de la primera venta</p>
      <h2 className="mt-1 font-display text-3xl tracking-tight">Abrir la caja de hoy</h2>
      <p className="mt-2 max-w-xl text-sm text-linen/70">Cuenta el efectivo con el que empieza el día (la base para dar vueltas) y escríbelo aquí. Hasta abrir la caja no se pueden registrar ventas.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onAbrir(base, quien.trim(), '')
        }}
        className="mt-6 grid gap-4 sm:grid-cols-[1.3fr_1fr_auto] sm:items-end"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-linen/60">Base en efectivo</span>
          <input type="number" inputMode="numeric" min="0" step="1000" value={base || ''} onChange={(e) => setBase(Number(e.target.value))} className="w-full rounded-xl border border-linen/20 bg-linen/10 px-3.5 py-2.5 text-lg text-linen tabular outline-none focus:border-linen/50" />
          <span className="mt-2 flex flex-wrap gap-1.5">
            {BASES.map((b) => (
              <button key={b} type="button" onClick={() => setBase(b)} className={`press rounded-full border px-2.5 py-1 text-xs ${base === b ? 'border-linen bg-linen text-ink' : 'border-linen/25 hover:border-linen/60'}`}>
                {money(b)}
              </button>
            ))}
          </span>
        </label>
        <label className="block self-start">
          <span className="mb-1.5 block text-xs font-semibold text-linen/60">¿Quién abre?</span>
          <input value={quien} onChange={(e) => setQuien(e.target.value)} placeholder="Tu nombre" className="w-full rounded-xl border border-linen/20 bg-linen/10 px-3.5 py-2.5 text-linen outline-none placeholder:text-linen/40 focus:border-linen/50" />
        </label>
        <button disabled={!quien.trim()} className="press self-start rounded-full bg-madder px-6 py-3 text-sm font-semibold text-linen hover:bg-madder-2 disabled:opacity-40 sm:mt-6">
          Abrir caja
        </button>
      </form>
    </section>
  )
}

/* ── Cierre ───────────────────────────────────────────────── */

function Cierre({ open, caja, ventas, gastos, onClose, onCerrar }: { open: boolean; caja: Caja; ventas: number; gastos: number; onClose: () => void; onCerrar: (contado: number, quien: string, nota: string) => void }) {
  const [conteo, setConteo] = useState<Record<number, number>>({})
  const [manual, setManual] = useState<number | null>(null)
  const [quien, setQuien] = useState(caja.abrio)
  const [nota, setNota] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const sumaConteo = useMemo(() => DENOMINACIONES.reduce((s, d) => s + d * (conteo[d] || 0), 0), [conteo])
  const contado = manual ?? sumaConteo
  const esperado = caja.base + ventas - gastos
  const dif = contado - esperado
  const e = estadoDiferencia(dif)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-end sm:place-items-center" role="dialog" aria-modal="true" aria-label="Cerrar caja">
      <div onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <form
        onSubmit={(ev) => {
          ev.preventDefault()
          onCerrar(contado, quien.trim(), nota.trim())
        }}
        className="relative flex max-h-[94dvh] w-full flex-col rounded-t-3xl bg-paper shadow-2xl sm:max-w-2xl sm:rounded-3xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <header className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="font-display text-2xl tracking-tight">Cerrar la caja de hoy</h2>
          <button type="button" onClick={onClose} className="press grid size-9 place-items-center rounded-full hover:bg-linen" aria-label="Cancelar">
            ×
          </button>
        </header>
        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 pb-4" data-lenis-prevent>
          <dl className="divide-y divide-line/70 rounded-2xl border border-line text-sm">
            {[
              ['Base con que abrió', caja.base],
              ['+ Ventas en efectivo', ventas],
              ['− Gastos pagados en efectivo', gastos],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-2.5">
                <dt className="text-ink-2">{k}</dt>
                <dd className="tabular">{money(v as number)}</dd>
              </div>
            ))}
            <div className="flex justify-between bg-linen px-4 py-3 font-semibold">
              <dt>Debe haber en efectivo</dt>
              <dd className="tabular">{money(esperado)}</dd>
            </div>
          </dl>
          <p className="-mt-2 text-xs text-muted">Transferencias, tarjeta, Nequi y QR no entran a la caja física, por eso no se cuentan aquí.</p>

          <fieldset>
            <legend className="mb-2 flex w-full items-center justify-between text-xs font-semibold text-muted">
              Cuenta los billetes y monedas
              <button type="button" onClick={() => setManual(manual === null ? sumaConteo : null)} className="font-semibold text-madder hover:underline">
                {manual === null ? 'Escribir el total' : 'Contar por billetes'}
              </button>
            </legend>
            {manual === null ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {DENOMINACIONES.map((d) => (
                  <label key={d} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
                    <span className="w-[5.5rem] shrink-0 text-sm font-semibold whitespace-nowrap tabular">{money(d)}</span>
                    <span className="text-muted">×</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      min="0"
                      value={conteo[d] || ''}
                      onChange={(ev) => setConteo((c) => ({ ...c, [d]: Math.max(0, Number(ev.target.value) || 0) }))}
                      placeholder="0"
                      className="w-full min-w-0 bg-transparent text-right tabular outline-none"
                      aria-label={`Cantidad de ${money(d)}`}
                    />
                  </label>
                ))}
              </div>
            ) : (
              <input type="number" inputMode="numeric" min="0" step="100" value={manual || ''} onChange={(ev) => setManual(Number(ev.target.value))} placeholder="Total contado" className={`${input} text-lg tabular`} aria-label="Total contado" />
            )}
          </fieldset>

          <div className="flex items-center justify-between rounded-2xl bg-ink px-5 py-4 text-linen">
            <div>
              <p className="text-xs text-linen/60">Contado</p>
              <p className="font-display text-3xl tracking-tight tabular">{money(contado)}</p>
            </div>
            <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${contado ? e.cls.replace('/10', '/20') : 'bg-linen/10 text-linen/60'}`}>{contado ? e.label : 'Sin contar'}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">¿Quién cierra?</span>
              <input value={quien} onChange={(ev) => setQuien(ev.target.value)} placeholder="Tu nombre" className={input} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Nota (opcional)</span>
              <input value={nota} onChange={(ev) => setNota(ev.target.value)} placeholder={dif < 0 ? 'Por qué falta, si se sabe' : 'Observaciones'} className={input} />
            </label>
          </div>
        </div>
        <footer className="flex items-center gap-3 border-t border-line px-6 py-4">
          <p className="text-xs text-muted">Después de cerrar ya no se registran ventas de hoy.</p>
          <button disabled={!contado || !quien.trim()} className="press ml-auto shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-linen disabled:opacity-40">
            Cerrar caja
          </button>
        </footer>
      </form>
    </div>
  )
}

/* ── Historial (dueña) ────────────────────────────────────── */

export function HistorialCajas({ cajas }: { cajas: Caja[] }) {
  const lista = [...cajas].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const cerradas = lista.filter((c) => c.estado === 'cerrada')
  const faltantes = cerradas.filter((c) => c.diferencia < 0).reduce((s, c) => s + c.diferencia, 0)
  const sobrantes = cerradas.filter((c) => c.diferencia > 0).reduce((s, c) => s + c.diferencia, 0)
  const cuadradas = cerradas.filter((c) => Math.abs(c.diferencia) < 1).length
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-paper">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-lg tracking-tight">Aperturas y cierres</h2>
          <p className="text-xs text-muted">
            {cerradas.length} cierres · {cuadradas} cuadraron · faltantes {money(Math.abs(faltantes))} · sobrantes {money(sobrantes)}
          </p>
        </div>
      </header>
      {lista.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted">Todavía no hay aperturas registradas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-linen-2/50 text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Fecha</th>
                <th className="px-4 py-2.5 font-semibold">Abrió</th>
                <th className="px-4 py-2.5 text-right font-semibold">Base</th>
                <th className="px-4 py-2.5 text-right font-semibold">Esperado</th>
                <th className="px-4 py-2.5 text-right font-semibold">Contado</th>
                <th className="px-4 py-2.5 font-semibold">Resultado</th>
                <th className="px-4 py-2.5 font-semibold">Cerró</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((c) => {
                const e = estadoDiferencia(c.diferencia)
                return (
                  <tr key={c.fecha} className="border-t border-line/60">
                    <td className="px-4 py-2.5 whitespace-nowrap tabular">{c.fecha.split('-').reverse().slice(0, 2).join('/')}</td>
                    <td className="px-4 py-2.5 text-ink-2">
                      {c.abrio || '—'} <span className="text-xs text-muted">{c.apertura}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular">{money(c.base)}</td>
                    <td className="px-4 py-2.5 text-right tabular">{c.estado === 'cerrada' ? money(c.esperado) : '—'}</td>
                    <td className="px-4 py-2.5 text-right tabular">{c.estado === 'cerrada' ? money(c.contado) : '—'}</td>
                    <td className="px-4 py-2.5">{c.estado === 'cerrada' ? <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${e.cls}`}>{e.label}</span> : <span className="text-xs font-semibold text-good">Abierta</span>}</td>
                    <td className="px-4 py-2.5 text-ink-2">
                      {c.cerro || '—'} <span className="text-xs text-muted">{c.cierre}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
