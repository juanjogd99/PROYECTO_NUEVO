import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { CATEGORIAS, type Categoria as Cat } from './catalogo'
import { waLink } from '../config'
import { useCatalogoPublico } from './useCatalogoPublico'
import { resumenTela } from '../lib/catalogo'
import type { Stock } from '../lib/types'

const STOCK_PUB: Record<Stock, { label: string; cls: string; dot: string }> = {
  disponible: { label: 'Disponible', cls: 'bg-good/10 text-good', dot: 'bg-good' },
  pocas: { label: 'Pocas unidades', cls: 'bg-warn/10 text-warn', dot: 'bg-warn' },
  agotado: { label: 'Agotado', cls: 'bg-linen-2 text-muted', dot: 'bg-muted' },
}

gsap.registerPlugin(useGSAP)

/** Celda final "¿Buscas otra tela?": en celular siempre; en tablet (2 col) y escritorio (3 col) solo si hay hueco. */
function relleno(n: number) {
  const sm = (2 - (n % 2)) % 2
  const lg = (3 - (n % 3)) % 3
  return `${sm ? 'sm:flex sm:col-span-1' : 'sm:hidden'} ${['lg:hidden', 'lg:flex lg:col-span-1', 'lg:flex lg:col-span-2'][lg]}`
}

/** Página de una categoría de telas (#telas-instituciones, #telas-trajes…). */
export default function Categoria({ cat }: { cat: Cat }) {
  const root = useRef<HTMLDivElement>(null)
  const otras = CATEGORIAS.filter((c) => c.slug !== cat.slug)
  const catalogo = useCatalogoPublico()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-in]', { autoAlpha: 0, y: 18, duration: 0.7, ease: 'power3.out', stagger: 0.06 })
        gsap.from('[data-photo]', { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.out' })
      })
    },
    { scope: root, dependencies: [cat.slug], revertOnUpdate: true },
  )

  return (
    <div ref={root} className="min-h-dvh bg-linen text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-linen/90 backdrop-blur-md" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          <a href="#telas" className="press flex items-center gap-2 rounded-full px-1 py-2 text-sm font-semibold text-ink-2 hover:text-ink">
            <span aria-hidden>←</span> Todas las telas
          </a>
          <a href="#inicio" className="font-display text-lg tracking-tight">
            Textiles <em className="font-light">Myriam</em>
          </a>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 pt-10 pb-16 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:items-end lg:gap-16 lg:pt-16">
        <div>
          <p data-in className="mb-5 text-xs font-semibold tracking-[0.22em] text-madder uppercase">Telas para</p>
          <h1 data-in className="font-display text-[clamp(2.6rem,6.5vw,5.25rem)] leading-[0.95] font-light tracking-tight [text-wrap:balance]">
            {cat.nombre}
          </h1>
          <p data-in className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            {cat.intro}
          </p>
          <div data-in className="mt-8 flex flex-wrap gap-3">
            <a href={waLink(`Hola, busco telas de ${cat.nombre.toLowerCase()}. `)} className="press rounded-full bg-madder px-6 py-3.5 text-sm font-semibold text-linen hover:bg-madder-2">
              Preguntar por WhatsApp
            </a>
            {cat.slug === 'cortinas' && (
              <a href="#medidas" className="press rounded-full border border-ink/20 px-6 py-3.5 text-sm font-semibold hover:bg-ink hover:text-linen">
                Cortinas listas: calcular medida
              </a>
            )}
          </div>
        </div>
        <div data-photo className="overflow-hidden rounded-3xl">
          <img src={cat.foto} alt={cat.alt} className="aspect-[4/3] w-full object-cover" style={cat.pos ? { objectPosition: cat.pos } : undefined} />
        </div>
      </section>

      <section className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 sm:py-20">
          <h2 data-in className="mb-8 font-display text-2xl tracking-tight">Lo que encuentras</h2>
          <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {cat.telas.map((t) => (
              <li key={t.nombre} data-in className="group flex flex-col bg-paper p-4 sm:p-5">
                <div className="mb-4 overflow-hidden rounded-xl bg-linen-2">
                  {t.foto ? (
                    <img src={t.foto} alt={`Tela ${t.nombre.toLowerCase()}`} loading="lazy" className="aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] sm:aspect-[4/3]" />
                  ) : (
                    <div className="relative aspect-[16/9] w-full sm:aspect-[4/3]" style={{ backgroundColor: t.color ?? '#e5dccd' }} aria-hidden>
                      {/* trama sutil para que se lea como tela */}
                      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgb(0 0 0 / .18) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgb(255 255 255 / .25) 0 1px, transparent 1px 4px)' }} />
                      <span className="absolute bottom-3 left-3 rounded-full bg-paper/85 px-2.5 py-1 text-[11px] font-semibold text-ink-2">Pregunta por colores</span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl tracking-tight">{t.nombre}</h3>
                  {(() => {
                    const r = resumenTela(catalogo, t.nombre)
                    return r ? <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STOCK_PUB[r.estado].cls}`}>{r.estado === 'agotado' ? 'Agotado' : r.estado === 'pocas' ? 'Pocas unidades' : 'Disponible'}</span> : null
                  })()}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.uso}</p>
                <Colores tela={t.nombre} catalogo={catalogo} />
                <span className="flex-1" />
                <a href={waLink(`Hola, ¿tienen ${t.nombre.toLowerCase()}? `)} className="mt-4 w-fit text-sm font-semibold text-madder underline decoration-madder/30 underline-offset-4 hover:decoration-madder">
                  Preguntar por esta tela
                </a>
              </li>
            ))}
            {relleno(cat.telas.length) && (
              <li className={`flex flex-col justify-center bg-linen p-6 ${relleno(cat.telas.length)}`}>
                <p className="font-display text-xl tracking-tight">¿Buscas otra tela?</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">Tenemos más de 20 familias de tela. Si no está en la lista, pregúntanos.</p>
                <a href={waLink(`Hola, busco una tela para ${cat.nombre.toLowerCase()}: `)} className="mt-4 w-fit text-sm font-semibold text-madder underline decoration-madder/30 underline-offset-4 hover:decoration-madder">
                  Escribir por WhatsApp
                </a>
              </li>
            )}
          </ul>
          {cat.consejo && (
            <p data-in className="mt-6 flex items-start gap-3 rounded-2xl bg-linen px-5 py-4 text-sm leading-relaxed text-ink-2">
              <span className="mt-0.5 font-display text-lg text-madder" aria-hidden>
                ✳
              </span>
              {cat.consejo}
            </p>
          )}
          <p data-in className="mt-6 text-sm text-muted">El precio depende de cuánto lleves: entre más metros, mejor precio. Colores y disponibilidad cambian; pregúntanos.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <h2 className="mb-6 font-display text-2xl tracking-tight">Otras telas</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {otras.map((c) => (
            <a key={c.slug} href={`#telas-${c.slug}`} className="press group overflow-hidden rounded-2xl border border-line bg-paper">
              <img src={c.foto} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" style={c.pos ? { objectPosition: c.pos } : undefined} />
              <span className="block px-4 py-3 text-sm font-semibold">{c.nombre} →</span>
            </a>
          ))}
        </div>
      </section>

      <footer className="border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-8 text-sm text-muted sm:px-8">
          <p>© {new Date().getFullYear()} Textiles Myriam · Más de 50 años</p>
          <a href="#inicio" className="font-medium text-ink underline decoration-line underline-offset-4">
            Volver al inicio
          </a>
        </div>
      </footer>
    </div>
  )
}

/** Modelos y colores de una tela con su estado, para que el cliente sepa qué hay antes de venir. */
function Colores({ tela, catalogo }: { tela: string; catalogo: ReturnType<typeof useCatalogoPublico> }) {
  const r = resumenTela(catalogo, tela)
  if (!r) return null
  return (
    <div className="mt-4 space-y-2.5">
      {r.modelos.map((m) => (
        <div key={m.modelo}>
          {(r.modelos.length > 1 || (m.modelo && m.modelo !== '—' && m.modelo !== 'Liso')) && <p className="mb-1 text-[11px] font-semibold tracking-wide text-muted uppercase">{m.modelo}</p>}
          <ul className="flex flex-wrap gap-1.5">
            {m.colores.map((v) => (
              <li
                key={v.color}
                title={`${v.color}: ${STOCK_PUB[v.estado].label}`}
                className={`flex items-center gap-1.5 rounded-full border border-line py-0.5 pr-2.5 pl-0.5 text-xs ${v.estado === 'agotado' ? 'text-muted line-through decoration-muted/60' : 'text-ink-2'}`}
              >
                <span className={`relative size-5 shrink-0 rounded-full border border-ink/10 ${v.estado === 'agotado' ? 'opacity-35' : ''}`} style={{ backgroundColor: v.hex }}>
                  {v.estado === 'pocas' && <span className={`absolute -top-0.5 -right-0.5 size-2 rounded-full ring-2 ring-paper ${STOCK_PUB.pocas.dot}`} />}
                </span>
                {v.color}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <p className="text-[11px] text-muted">
        {r.disponibles} de {r.total} colores disponibles
        {r.modelos.some((m) => m.colores.some((v) => v.estado === 'pocas')) && <> · <span className="text-warn">●</span> pocas unidades</>}
      </p>
    </div>
  )
}
