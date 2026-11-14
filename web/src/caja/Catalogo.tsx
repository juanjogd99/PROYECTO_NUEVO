import { useEffect, useMemo, useState } from 'react'
import { STOCK, type Rol, type Stock, type Variante } from '../lib/types'
import { norm, resumenTela } from '../lib/catalogo'
import { CATEGORIAS } from '../landing/catalogo'

export const STOCK_ESTILO: Record<Stock, { dot: string; chip: string; on: string }> = {
  disponible: { dot: 'bg-good', chip: 'text-good bg-good/10', on: 'bg-good text-paper border-good' },
  pocas: { dot: 'bg-warn', chip: 'text-warn bg-warn/10', on: 'bg-warn text-paper border-warn' },
  agotado: { dot: 'bg-muted', chip: 'text-muted bg-linen-2', on: 'bg-ink-2 text-paper border-ink-2' },
}

const nuevo = (categoria: string, tela: string, modelo = ''): Variante => ({ categoria, tela, modelo, color: '', hex: '#cfc6b8', estado: 'disponible', nota: '' })

/** Inventario por tela → modelo → color. La dueña lo edita; el equipo lo consulta. Se publica en la página. */
export default function Catalogo({ catalogo, rol, onSave }: { catalogo: Variante[]; rol: Rol; onSave: (list: Variante[]) => void }) {
  const editable = rol === 'duena'
  const [draft, setDraft] = useState<Variante[]>(catalogo)
  const [cat, setCat] = useState('todas')
  const [q, setQ] = useState('')
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({})
  const [msg, setMsg] = useState('')
  const dirty = JSON.stringify(draft) !== JSON.stringify(catalogo)
  useEffect(() => {
    if (!dirty) setDraft(catalogo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalogo])

  // todas las telas del catálogo de la página, más las que la dueña haya agregado
  const telas = useMemo(() => {
    const out: { categoria: string; tela: string }[] = []
    const seen = new Set<string>()
    const add = (categoria: string, tela: string) => {
      const k = norm(tela)
      if (!seen.has(k)) (seen.add(k), out.push({ categoria, tela }))
    }
    for (const c of CATEGORIAS) for (const t of c.telas) add(c.slug, t.nombre)
    for (const v of draft) add(v.categoria, v.tela)
    const term = norm(q)
    return out.filter(
      (t) => (cat === 'todas' || t.categoria === cat) && (!term || norm(t.tela).includes(term) || draft.some((v) => norm(v.tela) === norm(t.tela) && norm(`${v.modelo} ${v.color}`).includes(term))),
    )
  }, [draft, cat, q])

  const idx = (v: Variante) => draft.indexOf(v)
  const upd = (v: Variante, patch: Partial<Variante>) => setDraft((d) => d.map((x) => (x === v ? { ...x, ...patch } : x)))
  const quitar = (v: Variante) => setDraft((d) => d.filter((x) => x !== v))
  const guardar = () => {
    const limpia = draft.filter((v) => v.tela.trim() && (v.color.trim() || v.modelo.trim())).map((v) => ({ ...v, color: v.color.trim(), modelo: v.modelo.trim() }))
    onSave(limpia)
    setDraft(limpia)
    setMsg('Catálogo guardado. La página ya muestra lo que hay.')
    window.setTimeout(() => setMsg(''), 3000)
  }

  const totales = useMemo(() => ({ agotados: draft.filter((v) => v.estado === 'agotado').length, pocas: draft.filter((v) => v.estado === 'pocas').length, total: draft.length }), [draft])

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-2">
          <b className="tabular">{totales.total}</b> colores en el catálogo · <span className="text-warn">{totales.pocas} con pocas unidades</span> · <span className="text-muted">{totales.agotados} agotados</span>
        </p>
        <p className="text-xs text-muted">{editable ? 'Lo que marques aquí se ve en la página pública (sin precios).' : 'Lo mantiene la dueña. Si ves que algo se acabó, avísale.'}</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar tela, modelo o color… (ej. yakar vino)" className="flex-1 rounded-full border border-line bg-paper px-4 py-2.5 outline-none focus:border-ink/40" aria-label="Buscar en el catálogo" />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {[{ slug: 'todas', nombre: 'Todas' }, ...CATEGORIAS].map((c) => (
            <button key={c.slug} onClick={() => setCat(c.slug)} className={`press rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap ${cat === c.slug ? 'border-ink bg-ink text-linen' : 'border-line bg-paper hover:border-ink/40'}`}>
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {telas.map(({ categoria, tela }) => {
          const r = resumenTela(draft, tela)
          const open = abiertas[tela] ?? Boolean(q)
          const variantes = draft.filter((v) => norm(v.tela) === norm(tela))
          const modelos = [...new Set(variantes.map((v) => v.modelo))]
          return (
            <section key={tela} className="overflow-hidden rounded-2xl border border-line bg-paper">
              <button onClick={() => setAbiertas((a) => ({ ...a, [tela]: !open }))} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-linen/50" aria-expanded={open}>
                <span className="min-w-0">
                  <span className="block font-display text-lg tracking-tight">{tela}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1">
                    {variantes.slice(0, 14).map((v, i) => (
                      <span key={i} title={`${v.modelo} · ${v.color}`} className={`size-3.5 rounded-full border border-ink/10 ${v.estado === 'agotado' ? 'opacity-30' : ''}`} style={{ backgroundColor: v.hex }} />
                    ))}
                    {!variantes.length && <span className="text-xs text-muted">Sin modelos ni colores cargados</span>}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {r && (
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STOCK_ESTILO[r.estado].chip}`}>
                      {r.estado === 'agotado' ? 'Agotado' : `${r.disponibles} de ${r.total} colores`}
                    </span>
                  )}
                  <span className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden>
                    ⌄
                  </span>
                </span>
              </button>

              {open && (
                <div className="space-y-4 border-t border-line px-5 py-4">
                  {modelos.map((modelo, mi) => (
                    <div key={mi}>
                      <div className="mb-2 flex items-center gap-2">
                        {editable ? (
                          <input
                            value={modelo}
                            onChange={(e) => setDraft((d) => d.map((x) => (norm(x.tela) === norm(tela) && x.modelo === modelo ? { ...x, modelo: e.target.value } : x)))}
                            placeholder="Nombre del modelo"
                            className="rounded-lg border border-line bg-paper px-2.5 py-1.5 text-sm font-semibold outline-none focus:border-ink/40"
                            aria-label="Modelo"
                          />
                        ) : (
                          <p className="text-sm font-semibold">Modelo {modelo || 'único'}</p>
                        )}
                      </div>
                      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {variantes
                          .filter((v) => v.modelo === modelo)
                          .map((v) => (
                            <li key={idx(v)} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
                              {editable ? (
                                <input type="color" value={v.hex} onChange={(e) => upd(v, { hex: e.target.value })} className="size-8 shrink-0 cursor-pointer rounded-full border-0 bg-transparent p-0" aria-label={`Tono de ${v.color || 'color'}`} />
                              ) : (
                                <span className="size-8 shrink-0 rounded-full border border-ink/10" style={{ backgroundColor: v.hex }} />
                              )}
                              <div className="min-w-0 flex-1">
                                {editable ? (
                                  <input value={v.color} onChange={(e) => upd(v, { color: e.target.value })} placeholder="Color" className="w-full bg-transparent text-sm font-medium outline-none" aria-label="Color" />
                                ) : (
                                  <p className={`truncate text-sm font-medium ${v.estado === 'agotado' ? 'text-muted line-through' : ''}`}>{v.color}</p>
                                )}
                                {editable ? (
                                  <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Estado">
                                    {STOCK.map((s) => (
                                      <button key={s.id} type="button" role="radio" aria-checked={v.estado === s.id} onClick={() => upd(v, { estado: s.id })} className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${v.estado === s.id ? STOCK_ESTILO[s.id].on : 'border-line text-muted hover:border-ink/30'}`}>
                                        {s.id === 'pocas' ? 'Pocas' : s.label}
                                      </button>
                                    ))}
                                  </div>
                                ) : (
                                  <span className={`mt-0.5 inline-flex items-center gap-1.5 text-[11px] font-semibold ${STOCK_ESTILO[v.estado].chip.split(' ')[0]}`}>
                                    <span className={`size-1.5 rounded-full ${STOCK_ESTILO[v.estado].dot}`} />
                                    {STOCK.find((s) => s.id === v.estado)!.label}
                                  </span>
                                )}
                              </div>
                              {editable && (
                                <button onClick={() => quitar(v)} className="press grid size-7 shrink-0 place-items-center rounded-full text-muted hover:bg-bad/10 hover:text-bad" aria-label={`Quitar ${v.color}`}>
                                  ×
                                </button>
                              )}
                            </li>
                          ))}
                        {editable && (
                          <li>
                            <button onClick={() => setDraft((d) => [...d, nuevo(categoria, tela, modelo)])} className="press h-full min-h-12 w-full rounded-xl border border-dashed border-line px-3 py-2 text-sm font-semibold text-muted hover:border-ink/40 hover:text-ink">
                              + Color
                            </button>
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                  {editable && (
                    <button onClick={() => setDraft((d) => [...d, nuevo(categoria, tela, `Modelo ${modelos.length + 1}`)])} className="press rounded-full border border-line px-4 py-2 text-sm font-semibold hover:border-ink/40">
                      + Modelo
                    </button>
                  )}
                  {!editable && !variantes.length && <p className="text-sm text-muted">La dueña todavía no ha cargado modelos y colores de esta tela.</p>}
                </div>
              )}
            </section>
          )
        })}
        {telas.length === 0 && <p className="py-10 text-center text-sm text-muted">Nada coincide con la búsqueda.</p>}
      </div>

      {editable && (dirty || msg) && (
        <div className="sticky bottom-24 z-20 flex items-center gap-3 rounded-2xl bg-ink px-5 py-3 text-linen shadow-xl md:bottom-6">
          <span className="text-sm">{msg || 'Tienes cambios sin guardar en el catálogo.'}</span>
          {dirty && (
            <>
              <button onClick={() => setDraft(catalogo)} className="press ml-auto rounded-full px-4 py-2 text-sm font-semibold text-linen/70 hover:text-linen">
                Descartar
              </button>
              <button onClick={guardar} className="press rounded-full bg-linen px-5 py-2 text-sm font-semibold text-ink">
                Guardar catálogo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
