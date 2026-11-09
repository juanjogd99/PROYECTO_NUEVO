import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Movimiento } from '../lib/types'
import { useCaja, type SyncState } from '../lib/useCaja'
import { getSheetsUrl, ping } from '../lib/sheets'
import { dayShort, parseDate } from '../lib/format'
import Balance from './Balance'
import Movimientos from './Movimientos'
import MovForm from './MovForm'
import Ajustes from './Ajustes'

const PIN_KEY = 'tm.pin'
const DEMO_PIN = '1234'
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']

const readPin = () => {
  try {
    return sessionStorage.getItem(PIN_KEY) ?? ''
  } catch {
    return ''
  }
}

export default function CajaApp() {
  const [pin, setPin] = useState(readPin)
  if (!pin) return <Login onOk={setPin} />
  return (
    <Shell
      pin={pin}
      onLogout={() => {
        try {
          sessionStorage.removeItem(PIN_KEY)
        } catch {
          /* noop */
        }
        setPin('')
      }}
    />
  )
}

/* ───────────────────────── Login ───────────────────────── */

function Login({ onOk }: { onOk: (pin: string) => void }) {
  const demo = !getSheetsUrl()
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      if (demo) {
        if (value !== DEMO_PIN) throw new Error('PIN incorrecto')
      } else await ping(getSheetsUrl(), value)
      try {
        sessionStorage.setItem(PIN_KEY, value)
      } catch {
        /* noop */
      }
      onOk(value)
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
          <p className="mt-1 text-sm text-muted">Ingresa el PIN del equipo para registrar movimientos.</p>
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
          {demo && <p className="mt-4 rounded-lg bg-linen px-3 py-2 text-center text-xs text-muted">Modo demostración con datos de ejemplo · PIN {DEMO_PIN}</p>}
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
  const meses = [...new Set(fechas.map((f) => f.slice(0, 7)))]
  for (const m of meses) {
    const [y, mm] = m.split('-').map(Number)
    out.push({ key: `m-${m}`, label: `${MESES[mm - 1]} ${y}`, desde: `${m}-01`, hasta: `${m}-31` })
  }
  // semanas de lunes a domingo, como las pestañas del Sheet original
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

type Tab = 'balance' | 'movimientos' | 'ajustes'

function Shell({ pin, onLogout }: { pin: string; onLogout: () => void }) {
  const caja = useCaja(pin)
  const [tab, setTab] = useState<Tab>('balance')
  const [form, setForm] = useState<{ open: boolean; initial: Movimiento | null }>({ open: false, initial: null })
  const [toast, setToast] = useState('')
  const lista = useMemo(() => periodos(caja.rows), [caja.rows])
  const [pk, setPk] = useState('todo')
  const periodo = lista.find((p) => p.key === pk) ?? lista[0]

  const rows = useMemo(() => caja.rows.filter((r) => r.fecha >= periodo.desde && r.fecha <= periodo.hasta), [caja.rows, periodo])

  const productos = useMemo(() => {
    const c = new Map<string, number>()
    for (const r of caja.rows) if (r.tipo === 'Ingreso' && r.concepto && r.concepto !== 'Venta sin detalle') c.set(r.concepto, (c.get(r.concepto) ?? 0) + 1)
    return [...c].sort((a, b) => b[1] - a[1]).map(([k]) => k).slice(0, 120)
  }, [caja.rows])

  const flash = useCallback((t: string) => {
    setToast(t)
    window.setTimeout(() => setToast(''), 2400)
  }, [])

  // atajo: "n" abre un movimiento nuevo (sin animación extra, es una acción de teclado frecuente)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key === 'n' && !form.open && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName) && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setForm({ open: true, initial: null })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [form.open])

  const s = SYNC[caja.state]
  const tabs: { key: Tab; label: string }[] = [
    { key: 'balance', label: 'Balance' },
    { key: 'movimientos', label: 'Movimientos' },
    { key: 'ajustes', label: 'Ajustes' },
  ]

  return (
    <div className="min-h-dvh bg-linen pb-28 md:pb-12">
      <header className="sticky top-0 z-30 border-b border-line bg-linen/90 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <a href="#" className="shrink-0 font-display text-lg tracking-tight" title="Ir a la página">
            Textiles <em className="font-light">Myriam</em>
          </a>
          <nav className="ml-4 hidden gap-1 md:flex">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`press rounded-full px-4 py-2 text-sm font-semibold ${tab === t.key ? 'bg-ink text-linen' : 'text-ink-2 hover:bg-linen-2'}`}>
                {t.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => caja.refresh()}
            title={caja.error || (caja.lastSync ? `Última sincronización ${caja.lastSync.toLocaleTimeString('es-CO')}` : '')}
            className="ml-auto flex items-center gap-2 rounded-full px-2 py-1 text-xs text-muted hover:text-ink"
          >
            <span className={`size-2 rounded-full ${s.dot}`} />
            <span className="hidden sm:inline">{s.label}</span>
          </button>
          <button onClick={() => setForm({ open: true, initial: null })} className="press hidden rounded-full bg-madder px-4 py-2 text-sm font-semibold text-linen hover:bg-madder-2 md:inline-flex">
            + Movimiento <kbd className="ml-2 rounded bg-linen/20 px-1.5 text-[11px] font-normal">N</kbd>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        {caja.state === 'error' && (
          <p className="mb-4 rounded-xl bg-bad/10 px-4 py-3 text-sm text-bad">
            {caja.error}. <button className="font-semibold underline" onClick={() => setTab('ajustes')}>Revisar ajustes</button>
          </p>
        )}

        {tab !== 'ajustes' && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{tab === 'balance' ? 'Balance' : 'Movimientos de caja'}</h1>
              <p className="mt-1 text-sm text-muted">
                {periodo.key === 'todo' ? `${dayShort(periodo.desde)} – ${dayShort(periodo.hasta)}` : periodo.label} · {rows.length.toLocaleString('es-CO')} movimientos
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

        {caja.rows.length === 0 && caja.state !== 'demo' ? (
          <div className="rounded-2xl border border-dashed border-line p-12 text-center">
            <p className="font-display text-xl">{caja.state === 'cargando' ? 'Cargando movimientos…' : 'El Sheet está vacío'}</p>
            {caja.state === 'sincronizado' && (
              <p className="mt-2 text-sm text-muted">Registra el primer movimiento con el botón + o escribe en la pestaña MOVIMIENTOS del Sheet.</p>
            )}
          </div>
        ) : tab === 'balance' ? (
          <Balance rows={rows} periodo={periodo.label} />
        ) : tab === 'movimientos' ? (
          <Movimientos rows={rows} onEdit={(m) => setForm({ open: true, initial: m })} />
        ) : null}

        {tab === 'ajustes' && (
          <Ajustes demo={caja.demo} pin={pin} total={caja.rows.length} onResetDemo={() => (caja.resetDemo(), flash('Datos de demostración restaurados'))} onLogout={onLogout} />
        )}
      </main>

      {/* Barra inferior (móvil) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur-md md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="grid grid-cols-4 items-center px-2 py-2">
          {tabs.slice(0, 2).map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`py-2 text-xs font-semibold ${tab === t.key ? 'text-ink' : 'text-muted'}`}>
              {t.label}
            </button>
          ))}
          <button onClick={() => setForm({ open: true, initial: null })} className="press mx-auto grid size-12 place-items-center rounded-full bg-madder text-2xl text-linen shadow-lg" aria-label="Nuevo movimiento">
            +
          </button>
          <button onClick={() => setTab('ajustes')} className={`py-2 text-xs font-semibold ${tab === 'ajustes' ? 'text-ink' : 'text-muted'}`}>
            Ajustes
          </button>
        </div>
      </nav>

      <MovForm
        open={form.open}
        initial={form.initial}
        productos={productos}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
        onSave={(m, keep) => {
          caja.save(m)
          flash(caja.demo ? 'Guardado (demo, solo en este navegador)' : 'Guardado · subiendo al Sheet')
          if (!keep) setForm((f) => ({ ...f, open: false }))
        }}
        onDelete={(id) => {
          caja.remove(id)
          flash('Movimiento eliminado')
          setForm((f) => ({ ...f, open: false }))
        }}
      />

      {/* Toast: entra y sale desde abajo, misma dirección */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-24 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-4 py-2.5 text-sm text-linen shadow-xl transition-[opacity,translate] md:bottom-8 ${
          toast ? 'translate-y-0 opacity-100 duration-300' : 'translate-y-3 opacity-0 duration-200'
        }`}
        style={{ transitionTimingFunction: 'var(--ease-out)' }}
      >
        {toast}
      </div>
    </div>
  )
}
