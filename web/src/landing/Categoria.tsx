import { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { CATEGORIAS, type Categoria as Cat } from './catalogo'
import { waLink } from '../config'

gsap.registerPlugin(useGSAP)

/** Celda final "¿Buscas otra tela?": en celular siempre; en tablet (2 col) y escritorio (3 col) solo si hay hueco. */
function relleno(n: number) {
  const sm = (2 - (n % 2)) % 2
  const lg = (3 - (n % 3)) % 3
  return `${sm ? 'sm:flex sm:col-span-1' : 'sm:hidden'} ${['lg:hidden', 'lg:flex lg:col-span-1', 'lg:flex lg:col-span-2'][lg]}`
}

/** Página de una categoría de telas (#telas-colegio, #telas-trajes…). */
export default function Categoria({ cat }: { cat: Cat }) {
  const root = useRef<HTMLDivElement>(null)
  const otras = CATEGORIAS.filter((c) => c.slug !== cat.slug)

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
              <li key={t.nombre} data-in className="flex flex-col bg-paper p-6">
                <h3 className="font-display text-xl tracking-tight">{t.nombre}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{t.uso}</p>
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
