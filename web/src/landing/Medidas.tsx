import { useMemo, useState } from 'react'
import { waLink } from '../config'

/*
 * Calculadora de cortinas y manteles listos para poner.
 * Medidas de referencia del mercado colombiano (paneles de 1,40–1,80 m de ancho y 1,80–2,30 m de alto;
 * manteles redondos de Ø1,50 a Ø2,70 m y rectangulares de 1,40×1,80 a 1,80×3,00 m).
 * La disponibilidad real la confirma el almacén.
 */

const m = (cm: number) => `${(cm / 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} m`

/* ── Cortinas ─────────────────────────────────────────────── */
const PANEL_ANCHOS = [140, 150, 180]
const PANEL_ALTOS = [180, 220, 230]
const TIPOS = [
  { id: 'velo', nombre: 'Velo', desc: 'Deja pasar la luz con privacidad' },
  { id: 'blackout', nombre: 'Blackout', desc: 'Oscurece el cuarto y aísla el calor' },
  { id: 'juego', nombre: 'Juego velo + cortina', desc: 'Dos capas: luz de día y oscuridad de noche' },
] as const

function calcCortina(ancho: number, alto: number) {
  const barra = ancho + 30 // 15 cm a cada lado de la ventana
  const tela = barra * 1.8 // para que caiga con ondas, no estirada
  // la combinación de paños (en pares) que menos tela sobrante deja
  const opciones = PANEL_ANCHOS.map((w) => {
    let n = Math.max(2, Math.ceil(tela / w))
    if (n % 2) n++
    return { w, n, sobra: n * w - tela }
  }).sort((a, b) => a.n - b.n || a.sobra - b.sobra)
  const mejor = opciones[0]
  const altoStd = PANEL_ALTOS.find((h) => h >= alto - 3)
  const aMedida = !altoStd || mejor.n > 6
  return { barra, mejor, altoStd: altoStd ?? alto, aMedida, ruedo: altoStd && altoStd - alto > 10 ? altoStd - alto : 0 }
}

/* ── Manteles ─────────────────────────────────────────────── */
type Forma = 'redonda' | 'cuadrada' | 'rectangular' | 'ovalada'
const STD: Record<Forma, [number, number][]> = {
  redonda: [150, 180, 200, 240, 270].map((d) => [d, d]),
  cuadrada: [140, 150, 180, 200].map((d) => [d, d]),
  rectangular: [[140, 180], [150, 200], [150, 250], [180, 230], [150, 300], [180, 300]],
  ovalada: [[140, 180], [150, 200], [150, 250], [180, 230], [150, 300], [180, 300]],
}
const CAIDAS = [
  { cm: 20, nombre: 'Corta', desc: 'Uso diario' },
  { cm: 25, nombre: 'Normal', desc: 'La más común' },
  { cm: 30, nombre: 'Larga', desc: 'Eventos' },
]

function calcMantel(forma: Forma, largo: number, ancho: number, caida: number) {
  const [L, A] = forma === 'redonda' || forma === 'cuadrada' ? [largo, largo] : [Math.max(largo, ancho), Math.min(largo, ancho)]
  const necesita: [number, number] = [L + 2 * caida, A + 2 * caida]
  // las medidas estándar se comparan lado largo con lado largo
  const std = STD[forma].map(([x, y]) => [Math.max(x, y), Math.min(x, y)] as [number, number]).find(([sl, sa]) => sl >= necesita[0] - 5 && sa >= necesita[1] - 5)
  const puestos = forma === 'redonda' ? (L <= 90 ? 4 : L <= 120 ? 6 : L <= 150 ? 8 : 10) : forma === 'cuadrada' ? (L <= 100 ? 4 : 8) : Math.max(4, 2 * Math.floor(L / 60) + (A >= 90 ? 2 : 0))
  return { L, A, necesita, std, puestos }
}

const input = 'w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 tabular outline-none focus:border-ink/50'
const chip = (on: boolean) => `press rounded-xl border px-3 py-2.5 text-left text-sm ${on ? 'border-ink bg-ink text-linen' : 'border-line bg-paper hover:border-ink/40'}`

export default function Medidas() {
  const [tab, setTab] = useState<'cortinas' | 'manteles'>('cortinas')

  // cortinas
  const [vAncho, setVAncho] = useState(150)
  const [vAlto, setVAlto] = useState(220)
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]['id']>('velo')
  const c = useMemo(() => calcCortina(vAncho || 0, vAlto || 0), [vAncho, vAlto])
  const tipoNombre = TIPOS.find((t) => t.id === tipo)!.nombre

  // manteles
  const [forma, setForma] = useState<Forma>('redonda')
  const [mLargo, setMLargo] = useState(120)
  const [mAncho, setMAncho] = useState(80)
  const [caida, setCaida] = useState(25)
  const t = useMemo(() => calcMantel(forma, mLargo || 0, mAncho || 0, caida), [forma, mLargo, mAncho, caida])
  const dosMedidas = forma === 'rectangular' || forma === 'ovalada'

  const msgCortina = `Hola, quiero una cortina tipo ${tipoNombre.toLowerCase()} para una ventana de ${vAncho} cm de ancho y ${vAlto} cm de alto. ${c.aMedida ? '¿Me la cotizan a la medida?' : `¿Tienen ${c.mejor.n} paños de ${m(c.mejor.w)} × ${m(c.altoStd)}?`}`
  const msgMantel = `Hola, busco un mantel para una mesa ${forma} de ${dosMedidas ? `${mLargo} × ${mAncho}` : mLargo} cm. ${t.std ? `¿Tienen de ${forma === 'redonda' ? `Ø${m(t.std[0])}` : `${m(t.std[1])} × ${m(t.std[0])}`}?` : '¿Me lo cotizan a la medida?'}`

  return (
    <section id="medidas" className="border-y border-line bg-paper">
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p data-reveal className="mb-5 text-xs font-semibold tracking-[0.22em] text-madder uppercase">Listas para poner</p>
            <h2 data-reveal className="max-w-2xl font-display text-[clamp(2.25rem,5vw,4rem)] leading-none font-light tracking-tight [text-wrap:balance]">
              Cortinas y manteles <em className="text-madder">a tu medida estándar</em>
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-sm leading-relaxed text-muted">
            Escribe las medidas de tu ventana o de tu mesa y te decimos qué tamaño te sirve. Si no hay estándar, te lo hacemos a la medida.
          </p>
        </div>

        <div data-reveal role="tablist" aria-label="Calculadora" className="mb-6 inline-grid grid-cols-2 gap-1 rounded-full bg-linen p-1">
          {(['cortinas', 'manteles'] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`press rounded-full px-5 py-2 text-sm font-semibold ${tab === k ? 'bg-ink text-linen' : 'text-ink-2'}`}>
              {k === 'cortinas' ? 'Cortinas' : 'Manteles'}
            </button>
          ))}
        </div>

        {tab === 'cortinas' ? (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5 rounded-3xl border border-line bg-linen/50 p-6">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">Ancho de la ventana (cm)</span>
                  <input type="number" inputMode="numeric" min="40" max="600" value={vAncho || ''} onChange={(e) => setVAncho(Number(e.target.value))} className={input} />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">Alto de la cortina (cm)</span>
                  <input type="number" inputMode="numeric" min="60" max="400" value={vAlto || ''} onChange={(e) => setVAlto(Number(e.target.value))} className={input} />
                </label>
              </div>
              <p className="-mt-2 text-xs text-muted">El alto se mide desde donde va la barra hasta donde quieres que llegue (al piso o un poco debajo del marco).</p>
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-muted">Tipo de cortina</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {TIPOS.map((ti) => (
                    <button key={ti.id} type="button" onClick={() => setTipo(ti.id)} className={chip(tipo === ti.id)}>
                      <span className="block font-semibold">{ti.nombre}</span>
                      <span className={`block text-xs ${tipo === ti.id ? 'text-linen/70' : 'text-muted'}`}>{ti.desc}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="flex flex-col rounded-3xl bg-ink p-6 text-linen sm:p-8">
              <p className="text-xs font-semibold tracking-wide text-linen/60 uppercase">Te recomendamos</p>
              {vAncho > 0 && vAlto > 0 ? (
                <>
                  <p className="mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                    {c.aMedida ? 'Cortina a la medida' : `${c.mejor.n} paños de ${m(c.mejor.w)} × ${m(c.altoStd)}`}
                  </p>
                  <p className="mt-1 text-linen/70">
                    {tipoNombre}
                    {tipo === 'juego' && !c.aMedida && ` · ${c.mejor.n} de velo + ${c.mejor.n} de cortina`}
                  </p>
                  <CortinaSVG ancho={vAncho} alto={vAlto} barra={c.barra} panels={c.aMedida ? 2 : c.mejor.n} />
                  <ul className="mt-auto space-y-1.5 text-sm text-linen/80">
                    <li>• Barra de {m(c.barra)}: 15 cm más a cada lado de la ventana.</li>
                    <li>• Se calcula casi el doble de tela que de barra para que caiga con ondas.</li>
                    {c.ruedo > 0 && <li>• Sobran unos {c.ruedo} cm de alto: se hace ruedo o se sube la barra.</li>}
                    {c.aMedida && <li>• Es más grande que las medidas estándar: la confeccionamos a la medida.</li>}
                  </ul>
                  <a href={waLink(msgCortina)} className="press mt-6 inline-flex w-fit rounded-full bg-madder px-5 py-3 text-sm font-semibold text-linen hover:bg-madder-2">
                    Pedir por WhatsApp con estas medidas
                  </a>
                </>
              ) : (
                <p className="mt-2 text-linen/70">Escribe el ancho y el alto.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5 rounded-3xl border border-line bg-linen/50 p-6">
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-muted">Forma de la mesa</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {(['redonda', 'cuadrada', 'rectangular', 'ovalada'] as Forma[]).map((f) => (
                    <button key={f} type="button" onClick={() => setForma(f)} className={`${chip(forma === f)} flex flex-col items-center gap-1.5 text-center`}>
                      <FormaIcon forma={f} />
                      <span className="font-semibold capitalize">{f}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className={`grid gap-3 ${dosMedidas ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold text-muted">{forma === 'redonda' ? 'Diámetro de la mesa (cm)' : forma === 'cuadrada' ? 'Lado de la mesa (cm)' : 'Largo de la mesa (cm)'}</span>
                  <input type="number" inputMode="numeric" min="40" max="400" value={mLargo || ''} onChange={(e) => setMLargo(Number(e.target.value))} className={input} />
                </label>
                {dosMedidas && (
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-semibold text-muted">Ancho de la mesa (cm)</span>
                    <input type="number" inputMode="numeric" min="40" max="300" value={mAncho || ''} onChange={(e) => setMAncho(Number(e.target.value))} className={input} />
                  </label>
                )}
              </div>
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-muted">¿Cuánto quieres que cuelgue por cada lado?</legend>
                <div className="grid grid-cols-3 gap-2">
                  {CAIDAS.map((k) => (
                    <button key={k.cm} type="button" onClick={() => setCaida(k.cm)} className={chip(caida === k.cm)}>
                      <span className="block font-semibold">
                        {k.nombre} · {k.cm} cm
                      </span>
                      <span className={`block text-xs ${caida === k.cm ? 'text-linen/70' : 'text-muted'}`}>{k.desc}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="flex flex-col rounded-3xl bg-ink p-6 text-linen sm:p-8">
              <p className="text-xs font-semibold tracking-wide text-linen/60 uppercase">Te recomendamos</p>
              {mLargo > 0 && (!dosMedidas || mAncho > 0) ? (
                <>
                  <p className="mt-2 font-display text-3xl leading-tight tracking-tight sm:text-4xl">
                    {t.std ? `Mantel ${forma === 'redonda' ? `de Ø${m(t.std[0])}` : `de ${m(t.std[1])} × ${m(t.std[0])}`}` : 'Mantel a la medida'}
                  </p>
                  <p className="mt-1 text-linen/70">Para unos {t.puestos} puestos</p>
                  <MantelSVG forma={forma} L={t.L} A={t.A} std={t.std ?? t.necesita} />
                  <ul className="mt-auto space-y-1.5 text-sm text-linen/80">
                    <li>
                      • Necesitas al menos {forma === 'redonda' ? `Ø${m(t.necesita[0])}` : `${m(t.necesita[0])} × ${m(t.necesita[1])}`}: la mesa más {caida} cm por lado.
                    </li>
                    {!t.std && <li>• Es más grande que las medidas estándar: lo hacemos a la medida.</li>}
                    {forma === 'ovalada' && <li>• Para mesa ovalada sirve un mantel ovalado o uno rectangular de la misma medida.</li>}
                  </ul>
                  <a href={waLink(msgMantel)} className="press mt-6 inline-flex w-fit rounded-full bg-madder px-5 py-3 text-sm font-semibold text-linen hover:bg-madder-2">
                    Pedir por WhatsApp con estas medidas
                  </a>
                </>
              ) : (
                <p className="mt-2 text-linen/70">Escribe las medidas de la mesa.</p>
              )}
            </div>
          </div>
        )}

        <details data-reveal className="mt-6 rounded-2xl border border-line px-5 py-4 text-sm">
          <summary className="cursor-pointer font-semibold">Medidas estándar de referencia</summary>
          <div className="mt-4 grid gap-6 text-ink-2 sm:grid-cols-3">
            <div>
              <p className="mb-1 font-semibold text-ink">Cortinas (por paño)</p>
              <p>1,40 × 1,80 m · 1,40 × 2,20 m · 1,50 × 2,30 m · 1,80 × 2,20 m</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-ink">Manteles redondos y cuadrados</p>
              <p>Ø1,50 · Ø1,80 · Ø2,00 · Ø2,40 · Ø2,70 m</p>
              <p>1,40 × 1,40 · 1,50 × 1,50 · 1,80 × 1,80 · 2,00 × 2,00 m</p>
            </div>
            <div>
              <p className="mb-1 font-semibold text-ink">Manteles rectangulares</p>
              <p>1,40 × 1,80 · 1,50 × 2,00 · 1,50 × 2,50 · 1,80 × 2,30 · 1,50 × 3,00 · 1,80 × 3,00 m</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Son medidas comunes del mercado. Pregúntanos cuáles tenemos disponibles y en qué colores.</p>
        </details>
      </div>
    </section>
  )
}

/* ── Dibujos a escala ─────────────────────────────────────── */

function CortinaSVG({ ancho, alto, barra, panels }: { ancho: number; alto: number; barra: number; panels: number }) {
  const W = 320
  const H = 190
  const s = Math.min((W - 40) / barra, (H - 30) / Math.max(alto, 1))
  const bw = barra * s
  const vw = ancho * s
  const h = alto * s
  const x0 = (W - bw) / 2
  const pw = bw / panels
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="my-6 w-full max-w-sm" role="img" aria-label={`Ventana de ${ancho} por ${alto} cm con ${panels} paños`}>
      <rect x={(W - vw) / 2} y={18} width={vw} height={h * 0.75} rx={3} fill="none" stroke="currentColor" strokeOpacity={0.35} strokeDasharray="4 4" />
      <line x1={x0 - 6} x2={x0 + bw + 6} y1={14} y2={14} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
      {Array.from({ length: panels }, (_, i) => {
        const x = x0 + i * pw
        const yb = 18 + h
        const waves = 4
        const seg = pw / waves
        // borde inferior ondulado, de derecha a izquierda
        const bottom = Array.from({ length: waves }, (_, k) => `Q ${x + pw - (k + 0.5) * seg} ${yb + (k % 2 ? 4 : -4)} ${x + pw - (k + 1) * seg} ${yb}`).join(' ')
        return <path key={i} d={`M ${x} 16 H ${x + pw} V ${yb} ${bottom} Z`} fill="#c4553a" fillOpacity={i % 2 ? 0.55 : 0.75} stroke="#efe7da" strokeOpacity={0.5} strokeWidth={1} />
      })}
    </svg>
  )
}

function MantelSVG({ forma, L, A, std }: { forma: Forma; L: number; A: number; std: [number, number] }) {
  const W = 320
  const H = 190
  const s = Math.min((W - 30) / std[0], (H - 20) / std[1])
  const cx = W / 2
  const cy = H / 2
  const round = forma === 'redonda'
  const oval = forma === 'ovalada'
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="my-6 w-full max-w-sm" role="img" aria-label="Mantel sobre la mesa, a escala">
      {round ? <circle cx={cx} cy={cy} r={(std[0] * s) / 2} fill="#c4553a" fillOpacity={0.7} /> : <rect x={cx - (std[0] * s) / 2} y={cy - (std[1] * s) / 2} width={std[0] * s} height={std[1] * s} rx={oval ? (std[1] * s) / 2 : 6} fill="#c4553a" fillOpacity={0.7} />}
      {round ? (
        <circle cx={cx} cy={cy} r={(L * s) / 2} fill="none" stroke="#efe7da" strokeWidth={2} strokeDasharray="5 4" />
      ) : (
        <rect x={cx - (L * s) / 2} y={cy - (A * s) / 2} width={L * s} height={A * s} rx={oval ? (A * s) / 2 : 3} fill="none" stroke="#efe7da" strokeWidth={2} strokeDasharray="5 4" />
      )}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fill="#efe7da">
        mesa
      </text>
    </svg>
  )
}

function FormaIcon({ forma }: { forma: Forma }) {
  return (
    <svg viewBox="0 0 32 22" className="h-5 w-8" aria-hidden>
      {forma === 'redonda' && <circle cx="16" cy="11" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />}
      {forma === 'cuadrada' && <rect x="7" y="2" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />}
      {forma === 'rectangular' && <rect x="2" y="4" width="28" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />}
      {forma === 'ovalada' && <rect x="2" y="4" width="28" height="14" rx="7" fill="none" stroke="currentColor" strokeWidth="1.8" />}
    </svg>
  )
}
