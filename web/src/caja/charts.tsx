import { useState } from 'react'
import { dateLong, dayShort, money, moneyShort, pct } from '../lib/format'

/* Gráficos en HTML/CSS: una sola serie por gráfico (sin leyenda, el título la nombra),
   barras finas con punta redondeada de 4px anclada a la base, rejilla recesiva y tooltip al pasar. */

const niceMax = (v: number) => {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]
  return (steps.find((s) => s * p >= v) ?? 10) * p
}

export function DailyBars({ data }: { data: { fecha: string; ingresos: number; egresos: number }[] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = niceMax(Math.max(...data.map((d) => d.ingresos), 0))
  const ticks = [max, max / 2, 0]
  const best = data.reduce((b, d, i) => (d.ingresos > (data[b]?.ingresos ?? -1) ? i : b), 0)
  const h = hover ?? null
  return (
    <div className="relative">
      <div className="flex h-56 gap-3 sm:h-64">
        {/* eje Y */}
        <div className="flex w-12 shrink-0 flex-col justify-between pb-6 text-right text-[11px] text-muted tabular">
          {ticks.map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0">
              {moneyShort(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1">
          {/* rejilla */}
          <div className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
            {ticks.map((t) => (
              <span key={t} className={`h-px ${t === 0 ? 'bg-ink/25' : 'bg-line/70'}`} />
            ))}
          </div>
          <div className="absolute inset-x-0 top-0 bottom-6 flex items-end gap-[2px]" onPointerLeave={() => setHover(null)}>
            {data.map((d, i) => (
              <button
                key={d.fecha}
                type="button"
                aria-label={`${dateLong(d.fecha)}: ${money(d.ingresos)}`}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="group relative flex h-full flex-1 items-end outline-none"
              >
                <span
                  className={`block w-full rounded-t-[4px] transition-colors duration-150 ${
                    h === null ? 'bg-madder' : h === i ? 'bg-madder' : 'bg-madder/35'
                  }`}
                  style={{ height: `${(d.ingresos / max) * 100}%`, minHeight: d.ingresos ? 2 : 0 }}
                />
              </button>
            ))}
          </div>
          {/* eje X: primer día, mejor día y último */}
          <div className="absolute inset-x-0 bottom-0 flex h-5 text-[11px] text-muted">
            {data.map((d, i) => (
              <span key={d.fecha} className="relative flex-1">
                {(i === 0 || i === data.length - 1 || i === best) && (
                  <span className={`absolute top-0 whitespace-nowrap ${i === 0 ? 'left-0' : i === data.length - 1 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}>
                    {dayShort(d.fecha)}
                  </span>
                )}
              </span>
            ))}
          </div>
          {h !== null && data[h] && (
            <div
              className="pointer-events-none absolute -top-2 z-10 w-max rounded-lg bg-ink px-3 py-2 text-xs text-linen shadow-lg"
              style={{ left: `${((h + 0.5) / data.length) * 100}%`, transform: `translate(${h > data.length * 0.66 ? '-100%' : h < data.length * 0.33 ? '0' : '-50%'}, -100%)` }}
            >
              <p className="font-semibold first-letter:uppercase">{dateLong(data[h].fecha)}</p>
              <p className="mt-1 tabular">Ingresos {money(data[h].ingresos)}</p>
              {data[h].egresos > 0 && <p className="tabular text-linen/70">Egresos {money(data[h].egresos)}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/** Lista de barras horizontales ordenada: la etiqueta da la identidad, no el color. */
export function BarList({ data, total, max = 8, tone = 'madder' }: { data: { label: string; value: number }[]; total: number; max?: number; tone?: 'madder' | 'ink' }) {
  const rows = data.length > max ? [...data.slice(0, max - 1), { label: `Otros (${data.length - max + 1})`, value: data.slice(max - 1).reduce((s, d) => s + d.value, 0) }] : data
  const top = Math.max(...rows.map((r) => r.value), 1)
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label} className="group" title={`${r.label}: ${money(r.value)}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 tabular">
              <span className="font-semibold">{moneyShort(r.value)}</span>
              <span className="ml-2 inline-block w-12 text-right text-xs text-muted">{pct(total ? r.value / total : 0)}</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-linen-2">
            <div className={`h-full rounded-full ${tone === 'ink' ? 'bg-ink' : 'bg-madder'} transition-opacity group-hover:opacity-80`} style={{ width: `${(r.value / top) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/** Promedio por día de la semana, en columnas compactas. */
export function WeekdayColumns({ data }: { data: { label: string; value: number; dias: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const best = data.reduce((b, d) => (d.value > b.value ? d : b), data[0])
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${d.label}: ${money(d.value)} promedio (${d.dias} días)`}>
          <span className={`text-[11px] tabular ${d === best ? 'font-semibold text-ink' : 'text-muted'}`}>{moneyShort(d.value)}</span>
          <span className={`w-full max-w-10 rounded-t-[4px] ${d === best ? 'bg-madder' : 'bg-ink/15'}`} style={{ height: `${(d.value / max) * 70}%` }} />
          <span className={`text-xs ${d === best ? 'font-semibold' : 'text-muted'}`}>{d.label}</span>
        </div>
      ))}
    </div>
  )
}
