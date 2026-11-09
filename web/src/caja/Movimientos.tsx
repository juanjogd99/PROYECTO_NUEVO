import { useMemo, useState } from 'react'
import type { Movimiento } from '../lib/types'
import { dayShort, money, number, weekday } from '../lib/format'
import { familia } from '../lib/stats'

type Key = 'fecha' | 'concepto' | 'categoria' | 'cantidad' | 'valor' | 'total' | 'forma' | 'tipo'
const COLS: { key: Key; label: string; num?: boolean; className?: string }[] = [
  { key: 'fecha', label: 'Fecha' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'concepto', label: 'Concepto' },
  { key: 'categoria', label: 'Categoría', className: 'hidden xl:table-cell' },
  { key: 'cantidad', label: 'Cant.', num: true },
  { key: 'valor', label: 'Valor unit.', num: true, className: 'hidden lg:table-cell' },
  { key: 'forma', label: 'Pago' },
  { key: 'total', label: 'Total', num: true },
]
const PAGE = 50

const chip = (active: boolean) =>
  `press rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${active ? 'border-ink bg-ink text-linen' : 'border-line bg-paper text-ink-2 hover:border-ink/40'}`

export default function Movimientos({ rows, onEdit }: { rows: Movimiento[]; onEdit: (m: Movimiento) => void }) {
  const [q, setQ] = useState('')
  const [tipo, setTipo] = useState<'Todos' | 'Ingreso' | 'Egreso'>('Todos')
  const [forma, setForma] = useState('Todas')
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: 'fecha', dir: -1 })
  const [page, setPage] = useState(0)

  const formas = useMemo(() => ['Todas', ...new Set(rows.map((r) => String(r.forma)))], [rows])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    const out = rows.filter(
      (r) =>
        (tipo === 'Todos' || r.tipo === tipo) &&
        (forma === 'Todas' || r.forma === forma) &&
        (!term || `${r.concepto} ${r.categoria} ${familia(r.concepto)} ${r.nota} ${r.asesor} ${r.id}`.toLowerCase().includes(term)),
    )
    const { key, dir } = sort
    return out.sort((a, b) => {
      const va = a[key]
      const vb = b[key]
      const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'es')
      return c * dir || b.id.localeCompare(a.id) * dir
    })
  }, [rows, q, tipo, forma, sort])

  const totals = useMemo(() => {
    let ing = 0
    let egr = 0
    for (const r of filtered) r.tipo === 'Ingreso' ? (ing += r.total) : (egr += r.total)
    return { ing, egr }
  }, [filtered])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const current = Math.min(page, pages - 1)
  const visible = filtered.slice(current * PAGE, current * PAGE + PAGE)

  const toggleSort = (key: Key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === 'concepto' || key === 'forma' || key === 'tipo' ? 1 : -1 }))
    setPage(0)
  }

  const exportCsv = () => {
    const head = ['ID', 'Fecha', 'Tipo', 'Categoría', 'Concepto', 'Cantidad', 'Valor unitario', 'Total', 'Forma de pago', 'Asesor', 'Nota']
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const lines = [head, ...filtered.map((r) => [r.id, r.fecha, r.tipo, r.categoria, r.concepto, r.cantidad, r.valor, r.total, r.forma, r.asesor, r.nota])].map((l) => l.map(esc).join(';'))
    const blob = new Blob(['﻿' + lines.join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `movimientos-textiles-myriam.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="space-y-4">
      {/* Filtros: una sola fila sobre la tabla */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar</span>
          <svg className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
            <path d="m14 14 3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setPage(0)
            }}
            placeholder="Buscar producto, familia, nota…"
            className="w-full rounded-full border border-line bg-paper py-2.5 pr-4 pl-10 outline-none placeholder:text-muted focus:border-ink/40"
          />
        </label>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0 lg:pb-0">
          {(['Todos', 'Ingreso', 'Egreso'] as const).map((t) => (
            <button key={t} className={chip(tipo === t)} onClick={() => (setTipo(t), setPage(0))}>
              {t === 'Todos' ? 'Todos' : t + 's'}
            </button>
          ))}
          <span className="mx-1 w-px shrink-0 bg-line" />
          <select value={forma} onChange={(e) => (setForma(e.target.value), setPage(0))} className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-semibold outline-none" aria-label="Forma de pago">
            {formas.map((f) => (
              <option key={f}>{f === 'Todas' ? 'Toda forma de pago' : f}</option>
            ))}
          </select>
          <button onClick={exportCsv} className={chip(false)}>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Totales del filtro */}
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
        <span className="text-muted">{filtered.length.toLocaleString('es-CO')} movimientos</span>
        <span>
          Ingresos <strong className="tabular">{money(totals.ing)}</strong>
        </span>
        <span>
          Egresos <strong className="tabular">{money(totals.egr)}</strong>
        </span>
        <span>
          Neto <strong className="tabular">{money(totals.ing - totals.egr)}</strong>
        </span>
      </div>

      {/* Tabla (escritorio) */}
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-paper md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-linen-2/50 text-left text-xs text-muted">
            <tr>
              {COLS.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold ${c.num ? 'text-right' : ''} ${c.className ?? ''}`} aria-sort={sort.key === c.key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                  <button onClick={() => toggleSort(c.key)} className={`inline-flex items-center gap-1 hover:text-ink ${sort.key === c.key ? 'text-ink' : ''}`}>
                    {c.label}
                    <span className={`text-[10px] ${sort.key === c.key ? 'opacity-100' : 'opacity-0'}`}>{sort.dir === 1 ? '▲' : '▼'}</span>
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.id} onClick={() => onEdit(r)} className="cursor-pointer border-b border-line/60 last:border-0 hover:bg-linen/60">
                <td className="px-4 py-2.5 whitespace-nowrap tabular">
                  {dayShort(r.fecha)} <span className="text-xs text-muted first-letter:uppercase">{weekday(r.fecha).slice(0, 3)}</span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${r.tipo === 'Ingreso' ? 'text-good' : 'text-bad'}`}>
                    <span aria-hidden>{r.tipo === 'Ingreso' ? '↑' : '↓'}</span>
                    {r.tipo}
                  </span>
                </td>
                <td className="max-w-[16rem] truncate px-4 py-2.5">
                  {r.concepto}
                  {r.nota && <span className="ml-2 text-xs text-muted">· {r.nota}</span>}
                </td>
                <td className="hidden px-4 py-2.5 text-muted xl:table-cell">{r.categoria}</td>
                <td className="px-4 py-2.5 text-right tabular">{number(r.cantidad)}</td>
                <td className="hidden px-4 py-2.5 text-right text-muted tabular lg:table-cell">{money(r.valor)}</td>
                <td className="px-4 py-2.5 text-ink-2">{r.forma}</td>
                <td className={`px-4 py-2.5 text-right font-semibold tabular ${r.tipo === 'Egreso' ? 'text-bad' : ''}`}>
                  {r.tipo === 'Egreso' ? '−' : ''}
                  {money(r.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lista (móvil) */}
      <div className="space-y-2 md:hidden">
        <div className="flex items-center gap-2 text-xs text-muted">
          Ordenar por
          <select value={`${sort.key}:${sort.dir}`} onChange={(e) => { const [k, d] = e.target.value.split(':'); setSort({ key: k as Key, dir: Number(d) as 1 | -1 }); setPage(0) }} className="rounded-full border border-line bg-paper px-3 py-1 font-semibold text-ink outline-none">
            <option value="fecha:-1">Más recientes</option>
            <option value="fecha:1">Más antiguos</option>
            <option value="total:-1">Mayor valor</option>
            <option value="total:1">Menor valor</option>
            <option value="concepto:1">Producto A–Z</option>
          </select>
        </div>
        {visible.map((r) => (
          <button key={r.id} onClick={() => onEdit(r)} className="press flex w-full items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-left">
            <span className="min-w-0">
              <span className="block truncate font-medium">{r.concepto}</span>
              <span className="block text-xs text-muted">
                {dayShort(r.fecha)} · {number(r.cantidad)} × {money(r.valor)} · {r.forma}
              </span>
            </span>
            <span className={`shrink-0 font-semibold tabular ${r.tipo === 'Egreso' ? 'text-bad' : ''}`}>
              {r.tipo === 'Egreso' ? '−' : ''}
              {money(r.total)}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p className="py-12 text-center text-sm text-muted">Ningún movimiento coincide con la búsqueda.</p>}

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <button disabled={current === 0} onClick={() => setPage(current - 1)} className={`${chip(false)} disabled:opacity-40`}>
            ← Anterior
          </button>
          <span className="text-muted tabular">
            Página {current + 1} de {pages}
          </span>
          <button disabled={current >= pages - 1} onClick={() => setPage(current + 1)} className={`${chip(false)} disabled:opacity-40`}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  )
}
