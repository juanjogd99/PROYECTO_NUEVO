import { useEffect, useMemo, useRef, useState } from 'react'
import { CATEGORIAS, CATEGORIAS_PRIVADO, FORMAS, type Movimiento, type Precio, type Rol, type Tipo } from '../lib/types'
import { money, number, todayISO } from '../lib/format'
import { nuevoId } from '../lib/useCaja'
import { cotizar } from '../lib/precios'

export type Modo = 'caja' | 'privado'

interface Props {
  open: boolean
  initial: Movimiento | null
  modo: Modo
  rol: Rol
  precios: Precio[]
  productos: string[]
  onClose: () => void
  onSave: (m: Movimiento, keepOpen: boolean) => void
  onDelete: (id: string) => void
}

const cats = (modo: Modo) => (modo === 'privado' ? CATEGORIAS_PRIVADO : CATEGORIAS)

const blank = (modo: Modo, tipo: Tipo = modo === 'privado' ? 'Egreso' : 'Ingreso'): Movimiento => ({
  id: '',
  fecha: todayISO(),
  tipo,
  categoria: cats(modo)[tipo][0],
  concepto: '',
  cantidad: 1,
  valor: 0,
  total: 0,
  forma: modo === 'privado' ? 'Transferencia' : 'Efectivo',
  asesor: '',
  nota: '',
  origen: modo === 'privado' ? 'privado' : 'app',
})

const field = 'w-full rounded-xl border border-line bg-linen/50 px-3.5 py-2.5 outline-none transition-colors focus:border-ink/50 focus:bg-paper'

export default function MovForm({ open, initial, modo, rol, precios, productos, onClose, onSave, onDelete }: Props) {
  const [m, setM] = useState<Movimiento>(blank(modo))
  const [valorManual, setValorManual] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [mounted, setMounted] = useState(open)
  const [shown, setShown] = useState(false)
  const conceptoRef = useRef<HTMLInputElement>(null)
  const privado = modo === 'privado'
  const soloHoy = rol === 'equipo'

  // montaje/desmontaje con transición (entrada 320ms, salida más rápida)
  useEffect(() => {
    if (open) {
      setMounted(true)
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)))
      return () => cancelAnimationFrame(id)
    }
    setShown(false)
    const t = window.setTimeout(() => setMounted(false), 220)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!open) return
    setM(initial ? { ...initial } : blank(modo))
    setValorManual(Boolean(initial))
    setConfirmDel(false)
    if (window.matchMedia('(pointer: fine)').matches) window.setTimeout(() => conceptoRef.current?.focus(), 60)
  }, [open, initial, modo])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // precio automático según la lista de la dueña (detal o por mayor según la cantidad)
  const cot = useMemo(() => (!privado && m.tipo === 'Ingreso' ? cotizar(precios, m.concepto, Number(m.cantidad) || 0) : undefined), [privado, precios, m.tipo, m.concepto, m.cantidad])
  useEffect(() => {
    if (cot && !valorManual) setM((p) => (p.valor === cot.valor ? p : { ...p, valor: cot.valor }))
  }, [cot, valorManual])

  const total = useMemo(() => Math.round((privado ? 1 : Number(m.cantidad) || 0) * (Number(m.valor) || 0)), [privado, m.cantidad, m.valor])
  const valid = m.fecha && total > 0 && m.concepto.trim().length > 0
  const set = <K extends keyof Movimiento>(k: K, v: Movimiento[K]) => setM((p) => ({ ...p, [k]: v }))

  const submit = (keepOpen: boolean) => {
    if (!valid) return
    const row: Movimiento = { ...m, id: m.id || nuevoId(), concepto: m.concepto.trim(), total, cantidad: privado ? 1 : Number(m.cantidad), valor: Number(m.valor) }
    onSave(row, keepOpen)
    if (keepOpen) {
      setM((p) => ({ ...blank(modo, p.tipo), fecha: p.fecha, forma: p.forma, asesor: p.asesor, categoria: p.categoria }))
      setValorManual(false)
      conceptoRef.current?.focus()
    }
  }

  if (!mounted) return null
  const editing = Boolean(initial)
  const titulo = privado ? (editing ? 'Editar cuenta privada' : 'Nueva cuenta privada') : editing ? 'Editar movimiento' : 'Nuevo movimiento'

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={titulo}>
      <div onClick={onClose} className={`absolute inset-0 bg-ink/40 transition-opacity ${shown ? 'opacity-100 duration-300' : 'opacity-0 duration-200'}`} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit(false)
        }}
        className={`absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-3xl bg-paper shadow-2xl transition-transform will-change-transform md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl ${
          shown ? 'translate-y-0 duration-[320ms] md:translate-x-0' : 'translate-y-full duration-200 md:translate-x-full md:translate-y-0'
        }`}
        style={{ transitionTimingFunction: 'var(--ease-drawer)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-line md:hidden" aria-hidden />
        <header className="flex items-center justify-between px-5 pt-4 pb-3 sm:px-6">
          <div>
            <h2 className="font-display text-xl tracking-tight">{titulo}</h2>
            {privado && <p className="text-xs text-muted">Solo la ves tú. No aparece en la caja del equipo.</p>}
          </div>
          <button type="button" onClick={onClose} className="press grid size-9 place-items-center rounded-full hover:bg-linen" aria-label="Cerrar">
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain px-5 pb-4 sm:px-6" data-lenis-prevent>
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-linen p-1">
            {(['Ingreso', 'Egreso'] as Tipo[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setM((p) => ({ ...p, tipo: t, categoria: cats(modo)[t][0] }))}
                className={`press rounded-lg py-2 text-sm font-semibold ${m.tipo === t ? (t === 'Ingreso' ? 'bg-paper text-good shadow-sm' : 'bg-paper text-bad shadow-sm') : 'text-muted'}`}
              >
                {t === 'Ingreso' ? '↑ Ingreso' : '↓ Egreso'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Fecha</span>
              <input type="date" required value={m.fecha} onChange={(e) => set('fecha', e.target.value)} disabled={soloHoy} className={`${field} disabled:opacity-70`} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Categoría</span>
              <select value={m.categoria} onChange={(e) => set('categoria', e.target.value)} className={field}>
                {cats(modo)[m.tipo].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          {soloHoy && <p className="-mt-3 text-xs text-muted">Desde la caja se registra el día de hoy.</p>}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-muted">{privado ? 'Concepto' : m.tipo === 'Ingreso' ? 'Producto' : 'Concepto del gasto'}</span>
            <input
              ref={conceptoRef}
              list={!privado && m.tipo === 'Ingreso' ? 'tm-productos' : undefined}
              value={m.concepto}
              onChange={(e) => {
                set('concepto', e.target.value)
                setValorManual(false)
              }}
              placeholder={privado ? 'Ej. Proveedor de gabardina, arriendo…' : m.tipo === 'Ingreso' ? 'Ej. Gabardina, Toalla, Satín…' : 'Ej. Transporte, almuerzo…'}
              autoComplete="off"
              className={field}
            />
            <datalist id="tm-productos">
              {productos.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
            {!privado && m.tipo === 'Ingreso' && !m.concepto && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {productos.slice(0, 8).map((p) => (
                  <button key={p} type="button" onClick={() => (set('concepto', p), setValorManual(false))} className="press rounded-full border border-line px-2.5 py-1 text-xs hover:border-ink/40">
                    {p}
                  </button>
                ))}
              </div>
            )}
          </label>

          {privado ? (
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Valor</span>
              <input type="number" inputMode="numeric" min="0" step="1000" value={m.valor || ''} onChange={(e) => set('valor', Number(e.target.value))} placeholder="$" className={`${field} tabular`} />
            </label>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">{cot?.precio.unidad === 'unidad' ? 'Cantidad (unidades)' : m.tipo === 'Ingreso' ? 'Cantidad (metros)' : 'Cantidad'}</span>
                  <input type="number" inputMode="decimal" min="0" step="0.05" value={m.cantidad || ''} onChange={(e) => set('cantidad', Number(e.target.value))} className={`${field} tabular`} />
                </label>
                <label className="block">
                  <span className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted">
                    Valor unitario
                    {cot && valorManual && (
                      <button type="button" onClick={() => setValorManual(false)} className="font-semibold text-madder hover:underline">
                        Usar lista
                      </button>
                    )}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="100"
                    value={m.valor || ''}
                    onChange={(e) => {
                      set('valor', Number(e.target.value))
                      setValorManual(true)
                    }}
                    placeholder="$"
                    className={`${field} tabular`}
                  />
                </label>
              </div>
              {cot && (
                <div className="-mt-2 rounded-xl border border-line px-3.5 py-2.5 text-xs leading-relaxed text-ink-2">
                  {valorManual ? (
                    <>Precio puesto a mano. Según la lista sería {money(cot.valor)}.</>
                  ) : cot.mayor ? (
                    <>
                      <b className="text-good">Precio por mayor</b> desde {number(cot.precio.mayorDesde)} {cot.precio.unidad === 'unidad' ? 'unid.' : 'm'}: {money(cot.precio.precioMayor)} en vez de {money(cot.precio.precio)}.
                    </>
                  ) : (
                    <>
                      Precio al detal {money(cot.precio.precio)}.
                      {cot.faltaParaMayor > 0 && (
                        <>
                          {' '}
                          Con {number(cot.faltaParaMayor)} {cot.precio.unidad === 'unidad' ? 'unid.' : 'm'} más queda a {money(cot.precio.precioMayor)} por mayor.
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex items-baseline justify-between rounded-xl bg-linen px-4 py-3">
            <span className="text-sm text-muted">Total</span>
            <span className={`font-display text-2xl tracking-tight tabular ${m.tipo === 'Egreso' ? 'text-bad' : ''}`}>{money(total)}</span>
          </div>

          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-muted">Forma de pago</legend>
            <div className="flex flex-wrap gap-1.5">
              {FORMAS.map((f) => (
                <button key={f} type="button" onClick={() => set('forma', f)} className={`press rounded-full border px-3 py-1.5 text-sm ${m.forma === f ? 'border-ink bg-ink text-linen' : 'border-line hover:border-ink/40'}`}>
                  {f}
                </button>
              ))}
            </div>
          </fieldset>

          <div className={privado ? '' : 'grid grid-cols-[1fr_2fr] gap-3'}>
            {!privado && (
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-muted">Asesor</span>
                <input value={m.asesor} onChange={(e) => set('asesor', e.target.value)} placeholder="Nº o nombre" className={field} />
              </label>
            )}
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-muted">Nota (opcional)</span>
              <input value={m.nota} onChange={(e) => set('nota', e.target.value)} placeholder={privado ? 'Factura, banco…' : 'Cliente, pedido…'} className={field} />
            </label>
          </div>

          {editing && (
            <p className="text-xs text-muted">
              ID {m.id} · origen: {m.origen}
            </p>
          )}
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-4 sm:px-6">
          {editing ? (
            confirmDel ? (
              <button type="button" onClick={() => onDelete(m.id)} className="press rounded-full bg-bad px-4 py-2.5 text-sm font-semibold text-paper">
                Sí, eliminar
              </button>
            ) : (
              <button type="button" onClick={() => setConfirmDel(true)} className="press rounded-full px-3 py-2.5 text-sm font-semibold text-bad hover:bg-bad/10">
                Eliminar
              </button>
            )
          ) : (
            <button type="button" disabled={!valid} onClick={() => submit(true)} className="press rounded-full border border-line px-4 py-2.5 text-sm font-semibold hover:border-ink/40 disabled:opacity-40">
              Guardar y otro
            </button>
          )}
          <button type="submit" disabled={!valid} className="press ml-auto rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-linen hover:bg-ink-2 disabled:opacity-40">
            {editing ? 'Guardar cambios' : 'Guardar'}
          </button>
        </footer>
      </form>
    </div>
  )
}
