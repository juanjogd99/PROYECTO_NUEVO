import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Movimiento, Rol } from '../lib/types'
import { DEMO_PINES, limpiarSesion, useCaja, type SyncState } from '../lib/useCaja'
import { getSheetsUrl, ping } from '../lib/sheets'
import { dayShort, parseDate, todayISO } from '../lib/format'
import Balance from './Balance'
import Movimientos from './Movimientos'
import MovForm, { type Modo } from './MovForm'
import Ajustes from './Ajustes'
import Hoy from './Hoy'
import Precios from './Precios'
import Privado from './Privado'
import { HistorialCajas } from './CajaDia'

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

interface Sesion {
  pin: string
  rol: Rol
}
const readSesion = (): Sesion | null => {
  try {
    const pin = sessionStorage.getItem('tm.pin')
    const rol = sessionStorage.getItem('tm.rol') as Rol | null
    return pin && rol ? { pin, rol } : null
  } catch {
    return null
  }
}

export default function CajaApp() {
  const [sesion, setSesion] = useState<Sesion | null>(readSesion)
  if (!sesion) return <Login onOk={setSesion} />
  return (
    <Shell
      key={sesion.rol}
      pin={sesion.pin}
      rol={sesion.rol}
      onLogout={() => {
        limpiarSesion()
        setSesion(null)
      }}
    />
  )
}

/* ───────────────────────── Login ───────────────────────── */

function Login({ onOk }: { onOk: (s: Sesion) => void }) {
  const demo = !getSheetsUrl()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      let rol: Rol
      if (demo) {
        if (!DEMO_PINES[value]) throw new Error('PIN incorrecto')
        rol = DEMO_PINES[value]
      } else rol = await ping(getSheetsUrl(), value)
      try {
        sessionStorage.setItem('tm.pin', value)
        sessionStorage.setItem('tm.rol', rol)
      } catch {
        /* noop */
      }
      onOk({ pin: value, rol })
    } catch (err) {
      setError((err as Error).message)
      setValue('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-4 text-linen">
      <form onSubmit={submit} className="w-full max-w-sm">
        <a href="#" className="mb-12 block text-center font-display text-2xl tracking-tight">
          Textiles <em className="font-light">Myriam</em>
        </a>
        <div className="rounded-3xl bg-paper p-7 text-ink shadow-2xl">
          <h1 className="font-display text-2xl tracking-tight">Caja</h1>
          <p className="mt-1 text-sm text-muted">Ingresa tu PIN. La caja y la dueña tienen claves distintas.</p>
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="••••"
            className="mt-6 w-full rounded-xl border border-line bg-linen/50 px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-ink/50"
            aria-label="PIN"
          />
          {error && <p className="mt-2 text-center text-sm text-bad">{error}</p>}
          <button disabled={!value || busy} className="press mt-4 w-full rounded-xl bg-ink py-3 text-sm font-semibold text-linen disabled:opacity-40">
            {busy ? 'Verificando…' : 'Entrar'}
          </button>
          {demo && (
            <p className="mt-4 rounded-lg bg-linen px-3 py-2 text-center text-xs leading-relaxed text-muted">
              Demostración con datos de ejemplo
              <br />
              Caja (equipo): PIN <b className="text-ink">1234</b> · Dueña: PIN <b className="text-ink">2026</b>
            </p>
          )}
        </div>
        <a href="#" className="mt-6 block text-center text-sm text-linen/60 hover:text-linen">
          ← Volver a la página
        </a>
      </form>
    </div>
  )
}

/* ───────────────────────── Periodos ───────────────────────── */

interface Periodo {
  key: string
  label: string
  desde: string
  hasta: string
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

function periodos(rows: Movimiento[]): Periodo[] {
  if (!rows.length) return [{ key: 'todo', label: 'Todo', desde: '0000', hasta: '9999' }]
  const fechas = [...new Set(rows.map((r) => r.fecha))].sort()
  const out: Periodo[] = [{ key: 'todo', label: 'Todo', desde: fechas[0], hasta: fechas[fechas.length - 1] }]
  for (const m of [...new Set(fechas.map((f) => f.slice(0, 7)))]) {
    const [y, mm] = m.split('-').map(Number)
    out.push({ key: `m-${m}`, label: `${MESES[mm - 1]} ${y}`, desde: `${m}-01`, hasta: `${m}-31` })
  }
  // semanas de lunes a domingo
  const semanas = new Map<string, Periodo>()
  for (const f of fechas) {
    const d = parseDate(f)
    const lunes = new Date(d)
    lunes.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const dom = new Date(lunes)
    dom.setDate(lunes.getDate() + 6)
    const k = iso(lunes)
    if (!semanas.has(k)) semanas.set(k, { key: `s-${k}`, label: `Sem. ${dayShort(iso(lunes))} – ${dayShort(iso(dom))}`, desde: iso(lunes), hasta: iso(dom) })
  }
  return [...out, ...[...semanas.values()].slice(-8).reverse()]
}

/* ───────────────────────── Shell ───────────────────────── */

const SYNC: Record<SyncState, { label: string; dot: string }> = {
  demo: { label: 'Demostración · datos de ejemplo', dot: 'bg-indigo' },
  cargando: { label: 'Cargando del Sheet…', dot: 'bg-muted animate-pulse' },
  sincronizado: { label: 'Sincronizado con Sheets', dot: 'bg-good' },
  guardando: { label: 'Guardando en Sheets…', dot: 'bg-madder animate-pulse' },
  'sin-conexion': { label: 'Sin conexión · se subirá luego', dot: 'bg-madder' },
  error: { label: 'Error de sincronización', dot: 'bg-bad' },
}

type Tab = 'hoy' | 'balance' | 'movimientos' | 'privado' | 'precios' | 'ajustes'
const TABS: Record<Rol, { key: Tab; label: string; corto?: string }[]> = {
  equipo: [
    { key: 'hoy', label: 'Hoy' },
    { key: 'precios', label: 'Precios' },
  ],
  duena: [
    { key: 'balance', label: 'Balance' },
    { key: 'hoy', label: 'Caja diaria', corto: 'Caja' },
    { key: 'movimientos', label: 'Movimientos', corto: 'Movim.' },
    { key: 'privado', label: 'Mis cuentas', corto: 'Cuentas' },
    { key: 'precios', label: 'Precios' },
    { key: 'ajustes', label: 'Ajustes' },
  ],
}
const TITULOS: Partial<Record<Tab, string>> = { balance: 'Balance', movimientos: 'Movimientos de caja', privado: 'Mis cuentas' }

function Shell({ pin, rol, onLogout }: { pin: string; rol: Rol; onLogout: () => void }) {
  const caja = useCaja(pin, rol)
  const tabs = TABS[rol]
  const esDuena = rol === 'duena'
  const [tab, setTab] = useState<Tab>(tabs[0].key)
  const [form, setForm] = useState<{ open: boolean; initial: Movimiento | null; modo: Modo }>({ open: false, initial: null, modo: 'caja' })
  const [toast, setToast] = useState('')
  const lista = useMemo(() => periodos([...caja.rows, ...caja.privados]), [caja.rows, caja.privados])
  const [pk, setPk] = useState('todo')
  const periodo = lista.find((p) => p.key === pk) ?? lista[0]
  const enPeriodo = useCallback((r: Movimiento) => r.fecha >= periodo.desde && r.fecha <= periodo.hasta, [periodo])
  const rows = useMemo(() => caja.rows.filter(enPeriodo), [caja.rows, enPeriodo])
  const privados = useMemo(() => caja.privados.filter(enPeriodo), [caja.privados, enPeriodo])

  // sugerencias: la lista de precios primero, luego lo más vendido
  const productos = useMemo(() => {
    const c = new Map<string, number>()
    for (const p of caja.precios) c.set(p.producto, 1e6)
    for (const r of caja.rows) if (r.tipo === 'Ingreso' && r.concepto && r.concepto !== 'Venta sin detalle') c.set(r.concepto, (c.get(r.concepto) ?? 0) + 1)
    return [...c].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 120)
  }, [caja.rows, caja.precios])

  const flash = useCallback((t: string) => {
    setToast(t)
    window.setTimeout(() => setToast(''), 2600)
  }, [])

  const cajaHoy = caja.cajas.find((c) => c.fecha === todayISO())

  const nuevo = useCallback(
    (modo: Modo = tab === 'privado' ? 'privado' : 'caja') => {
      // el equipo solo factura con la caja de hoy abierta (el Apps Script también lo exige)
      if (rol === 'equipo' && modo === 'caja' && cajaHoy?.estado !== 'abierta') {
        setTab('hoy')
        flash(cajaHoy ? 'La caja de hoy ya está cerrada' : 'Primero abre la caja con la base del día')
        return
      }
      setForm({ open: true, initial: null, modo })
    },
    [tab, rol, cajaHoy?.estado, cajaHoy, flash],
  )

  // atajo: "n" abre un movimiento nuevo (sin animación extra: es una acción de teclado frecuente)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key === 'n' && !form.open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        nuevo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [form.open, nuevo])

  useEffect(() => {
    if (caja.error && caja.state === 'error') flash(caja.error)
  }, [caja.error, caja.state, flash])

  const s = SYNC[caja.state]
  const movil = tabs.filter((t) => t.key !== 'ajustes')
  const conPeriodo = tab === 'balance' || tab === 'movimientos' || tab === 'privado'

  return (
    <div className="min-h-dvh bg-linen pb-28 md:pb-12">
      <header className="sticky top-0 z-30 border-b border-line bg-linen/90 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
          <a href="#" className="shrink-0 font-display text-lg tracking-tight" title="Ir a la página">
            Textiles <em className="font-light">Myriam</em>
          </a>
          <span className={`hidden rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase sm:inline ${esDuena ? 'bg-indigo text-linen' : 'bg-linen-2 text-ink-2'}`}>{esDuena ? 'Dueña' : 'Caja'}</span>
          <nav className="ml-2 hidden gap-1 md:flex">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`press rounded-full px-3.5 py-2 text-sm font-semibold ${tab === t.key ? 'bg-ink text-linen' : 'text-ink-2 hover:bg-linen-2'}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <button onClick={() => caja.refresh()} title={caja.error || (caja.lastSync ? `Última sincronización ${caja.lastSync.toLocaleTimeString('es-CO')}` : '')} className="ml-auto flex items-center gap-2 rounded-full px-2 py-1 text-xs text-muted hover:text-ink">
            <span className={`size-2 rounded-full ${s.dot}`} />
            <span className="hidden lg:inline">{s.label}</span>
          </button>
          {esDuena && (
            <button onClick={() => setTab('ajustes')} className={`press rounded-full px-3 py-2 text-xs font-semibold md:hidden ${tab === 'ajustes' ? 'bg-ink text-linen' : 'text-muted hover:bg-linen-2'}`}>
              Ajustes
            </button>
          )}
          <button onClick={onLogout} className="press rounded-full px-3 py-2 text-xs font-semibold text-muted hover:bg-linen-2 hover:text-ink">
            Salir
          </button>
          <button onClick={() => nuevo()} className={`press hidden rounded-full px-4 py-2 text-sm font-semibold text-linen md:inline-flex ${tab === 'privado' ? 'bg-indigo' : 'bg-madder hover:bg-madder-2'}`}>
            + {tab === 'privado' ? 'Cuenta privada' : 'Movimiento'} <kbd className="ml-2 rounded bg-linen/20 px-1.5 text-[11px] font-normal">N</kbd>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {caja.state === 'error' && (
          <p className="mb-4 rounded-xl bg-bad/10 px-4 py-3 text-sm text-bad">
            {caja.error}.{' '}
            {esDuena && (
              <button className="font-semibold underline" onClick={() => setTab('ajustes')}>
                Revisar ajustes
              </button>
            )}
          </p>
        )}

        {tab === 'hoy' && <h1 className="mb-6 font-display text-3xl tracking-tight sm:text-4xl">{esDuena ? 'Caja diaria' : 'Caja de hoy'}</h1>}
        {tab === 'precios' && <h1 className="mb-6 font-display text-3xl tracking-tight sm:text-4xl">Precios</h1>}
        {conPeriodo && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{TITULOS[tab]}</h1>
              <p className="mt-1 text-sm text-muted">
                {periodo.key === 'todo' ? `${dayShort(periodo.desde)} – ${dayShort(periodo.hasta)}` : periodo.label} · {(tab === 'privado' ? privados : rows).length.toLocaleString('es-CO')} movimientos
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-muted">Periodo</span>
              <select value={pk} onChange={(e) => setPk(e.target.value)} className="rounded-full border border-line bg-paper px-4 py-2 font-semibold outline-none focus:border-ink/40">
                {lista.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {caja.state === 'cargando' && !caja.rows.length ? (
          <p className="rounded-2xl border border-dashed border-line p-12 text-center font-display text-xl">Cargando…</p>
        ) : (
          <>
            {tab === 'hoy' && (
              <div className="space-y-5">
                <Hoy
                  rows={caja.rows}
                  caja={cajaHoy}
                  rol={rol}
                  onEdit={(m) => (rol === 'equipo' && cajaHoy?.estado !== 'abierta' ? flash('La caja no está abierta: no se puede corregir') : setForm({ open: true, initial: m, modo: 'caja' }))}
                  onAbrir={(base, quien, nota) => (caja.abrir(base, quien, nota), flash(`Caja abierta con ${base.toLocaleString('es-CO')} de base`))}
                  onCerrar={(contado, quien, nota) => (caja.cerrar(contado, quien, nota), flash('Caja cerrada'))}
                  onReabrir={(fecha) => (caja.reabrir(fecha), flash('Caja reabierta'))}
                />
                {esDuena && <HistorialCajas cajas={caja.cajas} />}
              </div>
            )}
            {tab === 'balance' && <Balance rows={rows} periodo={periodo.label} />}
            {tab === 'movimientos' && <Movimientos rows={rows} onEdit={(m) => setForm({ open: true, initial: m, modo: 'caja' })} />}
            {tab === 'privado' && <Privado caja={rows} privados={privados} periodo={periodo.label} onNew={() => nuevo('privado')} onEdit={(m) => setForm({ open: true, initial: m, modo: 'privado' })} />}
            {tab === 'precios' && <Precios precios={caja.precios} rol={rol} onSave={(l) => (caja.savePrecios(l), flash('Lista de precios guardada'))} />}
            {tab === 'ajustes' && <Ajustes demo={caja.demo} pin={pin} total={caja.rows.length} onResetDemo={() => (caja.resetDemo(), flash('Datos de demostración restaurados'))} onLogout={onLogout} />}
          </>
        )}
      </main>

      {/* Barra inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around px-2 py-2">
          {movil.slice(0, Math.ceil(movil.length / 2)).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-1 py-2 text-xs font-semibold ${tab === t.key ? 'text-ink' : 'text-muted'}`}>
              {t.corto ?? t.label}
            </button>
          ))}
          <button onClick={() => nuevo()} className={`press grid size-12 shrink-0 place-items-center rounded-full text-2xl text-linen shadow-lg ${tab === 'privado' ? 'bg-indigo' : 'bg-madder'}`} aria-label="Nuevo movimiento">
            +
          </button>
          {movil.slice(Math.ceil(movil.length / 2)).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`px-1 py-2 text-xs font-semibold ${tab === t.key ? 'text-ink' : 'text-muted'}`}>
              {t.corto ?? t.label}
            </button>
          ))}
        </div>
      </nav>

      <MovForm
        open={form.open}
        initial={form.initial}
        modo={form.modo}
        rol={rol}
        precios={caja.precios}
        productos={productos}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
        onSave={(m, keep) => {
          const hoja = form.modo === 'privado' ? 'privado' : 'movimientos'
          caja.save(m, hoja)
          flash(caja.demo ? 'Guardado (demo, solo en este navegador)' : hoja === 'privado' ? 'Guardado en tus cuentas privadas' : 'Guardado · subiendo al Sheet')
          if (!keep) setForm((f) => ({ ...f, open: false }))
        }}
        onDelete={(id) => {
          caja.remove(id, form.modo === 'privado' ? 'privado' : 'movimientos')
          flash('Eliminado')
          setForm((f) => ({ ...f, open: false }))
        }}
      />

      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-24 left-1/2 z-[60] max-w-[90vw] -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-center text-sm text-linen shadow-xl transition-[opacity,translate] md:bottom-8 ${
          toast ? 'translate-y-0 opacity-100 duration-300' : 'translate-y-3 opacity-0 duration-200'
        }`}
        style={{ transitionTimingFunction: 'var(--ease-out)' }}
      >
        {toast}
      </div>
    </div>
  )
}
