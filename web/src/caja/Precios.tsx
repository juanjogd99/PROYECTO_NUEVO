import { useEffect, useMemo, useState } from 'react'
import type { Precio, Rol } from '../lib/types'
import { cotizar } from '../lib/precios'
import { money, number } from '../lib/format'

const input = 'w-full rounded-lg border border-line bg-paper px-2.5 py-2 outline-none focus:border-ink/50'

export default function Precios({ precios, rol, onSave }: { precios: Precio[]; rol: Rol; onSave: (list: Precio[]) => void }) {
  const editable = rol === 'duena'
  const [producto, setProducto] = useState('')
  const [cantidad, setCantidad] = useState(1)
  const [draft, setDraft] = useState<Precio[]>(precios)
  const [q, setQ] = useState('')
  const [msg, setMsg] = useState('')

  // si llegan precios nuevos del Sheet y no hay cambios sin guardar, se reflejan
  const dirty = JSON.stringify(draft) !== JSON.stringify(precios)
  useEffect(() => {
    if (!dirty) setDraft(precios)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precios])

  const cot = useMemo(() => cotizar(precios, producto, cantidad || 0), [precios, producto, cantidad])
  const lista = useMemo(() => {
    const t = q.trim().toLowerCase()
    return draft.map((p, i) => ({ p, i })).filter(({ p }) => !t || p.producto.toLowerCase().includes(t))
  }, [draft, q])

  const upd = (i: number, k: keyof Precio, v: string) =>
    setDraft((d) => d.map((p, j) => (j === i ? { ...p, [k]: k === 'producto' ? v : k === 'unidad' ? (v as Precio['unidad']) : Number(v) || 0 } : p)))

  const guardar = () => {
    const limpia = draft.filter((p) => p.producto.trim()).map((p) => ({ ...p, producto: p.producto.trim() }))
    onSave(limpia)
    setDraft(limpia)
    setMsg('Lista guardada. El equipo ya ve los precios nuevos.')
    window.setTimeout(() => setMsg(''), 3000)
  }

  return (
    <div className="space-y-5">
      {/* Calculadora */}
      <section className="rounded-2xl bg-ink p-5 text-linen sm:p-6">
        <h2 className="font-display text-xl tracking-tight">Calcular precio</h2>
        <p className="mt-0.5 text-sm text-linen/60">Elige la tela y la cantidad: la app aplica el precio al detal o por mayor.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-linen/60">Tela o producto</span>
            <input list="tm-lista-precios" value={producto} onChange={(e) => setProducto(e.target.value)} placeholder="Ej. Gabardina" className="w-full rounded-xl border border-linen/20 bg-linen/10 px-3.5 py-2.5 text-linen outline-none placeholder:text-linen/40 focus:border-linen/50" />
            <datalist id="tm-lista-precios">
              {precios.map((p) => (
                <option key={p.producto} value={p.producto} />
              ))}
            </datalist>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-linen/60">{cot?.precio.unidad === 'unidad' ? 'Unidades' : 'Metros'}</span>
            <input type="number" inputMode="decimal" min="0" step="0.1" value={cantidad || ''} onChange={(e) => setCantidad(Number(e.target.value))} className="w-full rounded-xl border border-linen/20 bg-linen/10 px-3.5 py-2.5 text-linen tabular outline-none focus:border-linen/50" />
          </label>
          <div className="rounded-xl bg-linen px-4 py-2.5 text-ink sm:min-w-44">
            <p className="text-xs text-muted">Total</p>
            <p className="font-display text-2xl tracking-tight tabular">{cot ? money(cot.total) : '—'}</p>
          </div>
        </div>
        <p className="mt-3 min-h-5 text-sm text-linen/75">
          {!producto
            ? ' '
            : !cot
              ? 'Esa tela no está en la lista de precios.'
              : cot.mayor
                ? `Precio por mayor: ${money(cot.valor)} por ${cot.precio.unidad} (al detal ${money(cot.precio.precio)}).`
                : `Precio al detal: ${money(cot.valor)} por ${cot.precio.unidad}.${cot.faltaParaMayor > 0 ? ` Llevando ${number(cot.precio.mayorDesde)} o más queda a ${money(cot.precio.precioMayor)}.` : ''}`}
        </p>
      </section>

      {/* Lista */}
      <section className="rounded-2xl border border-line bg-paper">
        <header className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg tracking-tight">Lista de precios</h2>
            <p className="text-xs text-muted">{editable ? 'Solo tú puedes cambiarla. Los cambios llegan a la caja al guardar.' : 'La mantiene la dueña. Si un precio no cuadra, avísale.'}</p>
          </div>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar tela…" className="rounded-full border border-line bg-paper px-4 py-2 outline-none focus:border-ink/40 sm:w-56" aria-label="Buscar tela" />
        </header>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-linen-2/50 text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-2.5 font-semibold">Producto</th>
                <th className="px-4 py-2.5 font-semibold">Unidad</th>
                <th className="px-4 py-2.5 text-right font-semibold">Detal</th>
                <th className="px-4 py-2.5 text-right font-semibold">Por mayor desde</th>
                <th className="px-4 py-2.5 text-right font-semibold">Precio mayor</th>
                {editable && <th className="w-10" />}
              </tr>
            </thead>
            <tbody>
              {lista.map(({ p, i }) => (
                <tr key={i} className="border-t border-line/60">
                  {editable ? (
                    <>
                      <td className="px-3 py-1.5">
                        <input value={p.producto} onChange={(e) => upd(i, 'producto', e.target.value)} className={input} aria-label="Producto" />
                      </td>
                      <td className="px-3 py-1.5">
                        <select value={p.unidad} onChange={(e) => upd(i, 'unidad', e.target.value)} className={input} aria-label="Unidad">
                          <option value="metro">metro</option>
                          <option value="unidad">unidad</option>
                        </select>
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" inputMode="numeric" value={p.precio || ''} onChange={(e) => upd(i, 'precio', e.target.value)} className={`${input} text-right tabular`} aria-label="Precio al detal" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" inputMode="decimal" value={p.mayorDesde || ''} onChange={(e) => upd(i, 'mayorDesde', e.target.value)} placeholder="—" className={`${input} text-right tabular`} aria-label="Por mayor desde" />
                      </td>
                      <td className="px-3 py-1.5">
                        <input type="number" inputMode="numeric" value={p.precioMayor || ''} onChange={(e) => upd(i, 'precioMayor', e.target.value)} placeholder="—" className={`${input} text-right tabular`} aria-label="Precio por mayor" />
                      </td>
                      <td className="px-2">
                        <button onClick={() => setDraft((d) => d.filter((_, j) => j !== i))} className="press grid size-8 place-items-center rounded-full text-muted hover:bg-bad/10 hover:text-bad" aria-label={`Quitar ${p.producto}`}>
                          ×
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 font-medium">{p.producto}</td>
                      <td className="px-4 py-2.5 text-muted">{p.unidad}</td>
                      <td className="px-4 py-2.5 text-right tabular">{money(p.precio)}</td>
                      <td className="px-4 py-2.5 text-right text-muted tabular">{p.mayorDesde ? `${number(p.mayorDesde)} ${p.unidad === 'unidad' ? 'unid.' : 'm'}` : '—'}</td>
                      <td className="px-4 py-2.5 text-right tabular">{p.precioMayor ? money(p.precioMayor) : '—'}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {lista.length === 0 && <p className="px-5 py-10 text-center text-sm text-muted">{draft.length ? 'Ninguna tela coincide con la búsqueda.' : 'La lista está vacía.'}</p>}

        {editable && (
          <footer className="flex flex-wrap items-center gap-2 border-t border-line p-4">
            <button onClick={() => setDraft((d) => [...d, { producto: '', unidad: 'metro', precio: 0, mayorDesde: 0, precioMayor: 0 }])} className="press rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink/40">
              + Agregar tela
            </button>
            {msg && <span className="text-sm text-good">{msg}</span>}
            {dirty && (
              <>
                <button onClick={() => setDraft(precios)} className="press ml-auto rounded-full px-4 py-2 text-sm font-semibold text-muted hover:text-ink">
                  Descartar
                </button>
                <button onClick={guardar} className="press rounded-full bg-ink px-5 py-2 text-sm font-semibold text-linen">
                  Guardar lista
                </button>
              </>
            )}
          </footer>
        )}
      </section>
    </div>
  )
}
