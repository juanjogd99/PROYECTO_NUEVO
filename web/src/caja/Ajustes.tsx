import { useState } from 'react'
import { getSheetsUrl, ping, setSheetsUrl } from '../lib/sheets'

interface Props {
  demo: boolean
  pin: string
  total: number
  onResetDemo: () => void
  onLogout: () => void
}

export default function Ajustes({ demo, pin, total, onResetDemo, onLogout }: Props) {
  const [url, setUrl] = useState(getSheetsUrl())
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const conectar = async () => {
    const clean = url.trim()
    if (!/^https:\/\/script\.google\.com\/macros\/s\/.+\/exec$/.test(clean)) {
      setMsg({ ok: false, text: 'La URL debe ser la del Web App y terminar en /exec.' })
      return
    }
    setBusy(true)
    setMsg(null)
    try {
      await ping(clean, pin)
      setSheetsUrl(clean)
      setMsg({ ok: true, text: 'Conectado. Recargando…' })
      window.setTimeout(() => window.location.reload(), 700)
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message + '. Revisa que el PIN de la Caja sea el mismo del Apps Script.' })
    } finally {
      setBusy(false)
    }
  }

  const desconectar = () => {
    setSheetsUrl('')
    window.location.reload()
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <section className="rounded-2xl border border-line bg-paper p-6">
        <h2 className="font-display text-xl tracking-tight">Conexión con Google Sheets</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {demo
            ? 'Ahora estás en modo demostración: ves datos de ejemplo inventados y los cambios se guardan solo en este navegador. Conecta tu Sheet para trabajar con tus ventas reales.'
            : `Conectado. Hay ${total.toLocaleString('es-CO')} movimientos en el Sheet; cada cambio se sube al instante y lo que se edite en el Sheet aparece aquí en menos de 30 segundos.`}
        </p>

        <label className="mt-5 block">
          <span className="mb-1.5 block text-xs font-semibold text-muted">URL del Web App de Apps Script</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/…/exec"
            className="w-full rounded-xl border border-line bg-linen/50 px-3.5 py-2.5 font-mono text-sm outline-none focus:border-ink/50 focus:bg-paper"
          />
        </label>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={conectar} disabled={busy} className="press rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-linen disabled:opacity-50">
            {demo ? 'Conectar' : 'Guardar URL'}
          </button>
          {!demo && (
            <button onClick={desconectar} className="press rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:border-ink/40">
              Desconectar
            </button>
          )}
        </div>
        {msg && <p className={`mt-3 text-sm ${msg.ok ? 'text-good' : 'text-bad'}`}>{msg.text}</p>}

        <details className="mt-6 rounded-xl bg-linen p-4 text-sm">
          <summary className="cursor-pointer font-semibold">¿Cómo obtengo la URL? (5 minutos, una sola vez)</summary>
          <ol className="mt-3 list-decimal space-y-2 pl-5 leading-relaxed text-ink-2">
            <li>Abre tu Google Sheet (la plantilla Textiles_Myriam_Caja) → menú <b>Extensiones → Apps Script</b>.</li>
            <li>Borra lo que haya y pega el archivo <code>apps-script/Code.gs</code> del proyecto. Cambia el <b>PIN</b> en la línea 15 y guarda.</li>
            <li>Arriba elige la función <b>instalar</b> y pulsa <b>Ejecutar</b>. Acepta los permisos. Respeta las pestañas MOVIMIENTOS y BALANCE de la plantilla.</li>
            <li>
              <b>Implementar → Nueva implementación →</b> tipo <b>Aplicación web</b>. Ejecutar como: <b>Yo</b>. Acceso: <b>Cualquier persona</b>.
            </li>
            <li>Copia la URL que termina en <code>/exec</code>, pégala arriba y pulsa Conectar.</li>
          </ol>
        </details>
      </section>

      <section className="flex flex-wrap gap-2">
        {demo && (
          <button onClick={onResetDemo} className="press rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-semibold hover:border-ink/40">
            Restaurar datos de demostración
          </button>
        )}
        <button onClick={onLogout} className="press rounded-full border border-line bg-paper px-5 py-2.5 text-sm font-semibold hover:border-ink/40">
          Cerrar sesión
        </button>
      </section>
    </div>
  )
}
