import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Threads from '../components/reactbits/Threads/Threads'
import SplitText from '../components/reactbits/SplitText/SplitText'
import ScrollReveal from '../components/reactbits/ScrollReveal/ScrollReveal'
import Noise from '../components/reactbits/Noise/Noise'
import { useSmoothScroll } from './useSmoothScroll'
import { TIENDA, waLink } from '../config'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/* Precios de referencia tomados de las ventas reales de agosto 2026 (percentil bajo por familia). */
const COLECCION = [
  { nombre: 'Cortinas a la medida', uso: 'Confección por encargo, con abono', precio: 'desde $48.000', unidad: 'el paño', weave: 'weave-cortina', dark: true, destacado: true },
  { nombre: 'Velos', uso: 'Bordados, suizos, de cuadros y lisos', precio: '$7.500', unidad: 'metro', weave: 'weave-velo' },
  { nombre: 'Toallas y lencería', uso: 'Toalla por metro, lino y lencería para el hogar', precio: '$8.500', unidad: 'metro', weave: 'weave-toalla' },
  { nombre: 'Satín', uso: 'Para decoración, forros y eventos', precio: '$4.500', unidad: 'metro', weave: 'weave-satin' },
  { nombre: 'Yakar', uso: 'Tapicería y cojines', precio: '$14.300', unidad: 'metro', weave: 'weave-yakar', dark: true },
  { nombre: 'Piel de conejo', uso: 'Peluches, mantas y abrigo', precio: '$15.500', unidad: 'metro', weave: 'weave-piel' },
  { nombre: 'Temporada navideña', uso: 'Manteles, caminos y telas de Navidad', precio: '$12.000', unidad: 'metro', weave: 'weave-navidad', dark: true },
]

const TELAS = ['Toalla', 'Satín', 'Velo bordado', 'Yakar', 'Piel de conejo', 'Lino', 'Lencería', 'Antifluido', 'Organza', 'Muselina', 'Dacrón', 'Seda', 'Tul escarchado', 'Pana', 'Franela', 'Lame', 'Paño', 'Neopreno']

const PASOS = [
  { n: '01', t: 'Nos cuentas el espacio', d: 'Medidas de la ventana, el estilo y la luz que quieres. Te mostramos telas en mano.' },
  { n: '02', t: 'Cotizas y abonas', d: 'Precio claro desde el primer día. Separas tu pedido con un abono.' },
  { n: '03', t: 'Confeccionamos', d: 'Cortamos y cosemos a tu medida, con acabados que duran.' },
  { n: '04', t: 'Recoges y pagas el saldo', d: 'Tu cortina lista para colgar. Pagas el saldo al recibir.' },
]

const DATOS = [
  { valor: 4000, prefijo: '+', sufijo: ' m', label: 'de tela cortados en agosto' },
  { valor: 1500, prefijo: '+', sufijo: '', label: 'ventas atendidas en un mes' },
  { valor: 20, prefijo: '+', sufijo: '', label: 'familias de tela en tienda' },
  { valor: 6, prefijo: '', sufijo: ' días', label: 'a la semana abiertos para ti' },
]

export default function Landing() {
  const root = useRef<HTMLDivElement>(null)
  const [scrolled, setScrolled] = useState(false)
  useSmoothScroll()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ motion: '(prefers-reduced-motion: no-preference)', reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
        const reduce = ctx.conditions?.reduce

        // Nav: fondo sólido al salir del hero
        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => setScrolled(self.scroll() > 80) })

        if (reduce) return

        // Hero: el texto lo anima SplitText; aquí acompañan eyebrow, subtítulo y botones
        gsap.from('[data-hero-in]', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.55 })
        gsap.from('[data-hero-threads]', { autoAlpha: 0, duration: 2.2, ease: 'power2.out' })
        // Parallax suave del hero al salir
        gsap.to('[data-hero-content]', { yPercent: -12, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } })

        // Bloques que entran al hacer scroll (en grupo, con stagger corto)
        gsap.set('[data-reveal]', { autoAlpha: 0, y: 28 })
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 88%',
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, overwrite: true }),
        })

        // Muestras: se "desenrollan" con clip-path
        gsap.utils.toArray<HTMLElement>('[data-swatch]').forEach((el) => {
          gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        })

        // Proceso: la línea de hilo se cose con el scroll
        gsap.fromTo('[data-thread-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-pasos]', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } })

        // Cifras: cuentan hacia arriba una sola vez
        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const end = Number(el.dataset.count)
          const obj = { v: 0 }
          gsap.to(obj, {
            v: end,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('es-CO')),
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="bg-linen text-ink">
      {/* ── NAV ───────────────────────────────────────── */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,color] duration-300 ${
          scrolled ? 'bg-linen/85 text-ink shadow-[0_1px_0_var(--color-line)] backdrop-blur-md' : 'text-linen'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <a href="#inicio" className="flex items-baseline gap-2 font-display text-xl tracking-tight">
            Textiles <em className="font-light">Myriam</em>
          </a>
          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#coleccion" className="opacity-80 transition-opacity hover:opacity-100">Colección</a>
            <a href="#cortinas" className="opacity-80 transition-opacity hover:opacity-100">Cortinas a medida</a>
            <a href="#visitanos" className="opacity-80 transition-opacity hover:opacity-100">Visítanos</a>
          </div>
          <a
            href="#caja"
            className={`press rounded-full border px-4 py-2 text-xs font-semibold tracking-wide uppercase ${
              scrolled ? 'border-ink/20 hover:bg-ink hover:text-linen' : 'border-linen/30 hover:bg-linen hover:text-ink'
            }`}
          >
            Caja · equipo
          </a>
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────── */}
      <section id="inicio" data-hero className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-linen">
        <div data-hero-threads className="absolute inset-0" aria-hidden>
          <Threads color="#efe7da" accentColor="#c4553a" amplitude={1.4} distance={0.3} lineCount={70} speed={0.35} angle={18} opacity={0.75} brightness={1.15} fade={0.25} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" aria-hidden />
        <Noise opacity={0.09} fps={12} blendMode="overlay" className="pointer-events-none" />

        <div data-hero-content className="relative mx-auto w-full max-w-7xl px-4 pt-32 pb-14 sm:px-8 sm:pb-20">
          <p data-hero-in className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-linen/70 uppercase">
            <span className="h-px w-8 bg-madder" /> Telas por metro<span className="hidden sm:inline"> · Cortinas a la medida</span>
          </p>
          <SplitText
            text="Telas que visten tu casa."
            tag="h1"
            className="max-w-4xl font-display text-[clamp(3rem,9vw,7.5rem)] [text-wrap:balance] leading-[0.95] font-light tracking-[-0.03em]"
            textAlign="left"
            splitType="words"
            effect="rise"
            mask
            trigger="load"
            delay={70}
            duration={1.1}
          />
          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <p data-hero-in className="max-w-md text-base leading-relaxed text-linen/75 sm:text-lg">
              Velos, satín, toallas, yakar y lencería medidos y cortados frente a ti. Y cortinas hechas a la medida de tu ventana.
            </p>
            <div data-hero-in className="flex flex-wrap gap-3">
              <a href={waLink()} className="press rounded-full bg-madder px-6 py-3.5 text-sm font-semibold text-linen hover:bg-madder-2">
                Cotizar por WhatsApp
              </a>
              <a href="#coleccion" className="press rounded-full border border-linen/25 px-6 py-3.5 text-sm font-semibold hover:bg-linen hover:text-ink">
                Ver colección
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE DE TELAS ─────────────────────────── */}
      <div className="marquee overflow-hidden border-b border-line bg-paper py-5" aria-label="Telas disponibles">
        <div className="marquee-track flex w-max gap-10 pr-10 font-display text-2xl font-light whitespace-nowrap text-ink/80 italic sm:text-3xl">
          {[...TELAS, ...TELAS].map((t, i) => (
            <span key={i} className="flex items-center gap-10" aria-hidden={i >= TELAS.length}>
              {t} <span className="text-base text-madder not-italic">✳</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── MANIFIESTO ───────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-4 py-28 sm:px-8 sm:py-40">
        <p data-reveal className="mb-8 text-xs font-semibold tracking-[0.22em] text-madder uppercase">La tienda</p>
        <ScrollReveal
          baseOpacity={0.12}
          enableBlur
          blurStrength={3}
          baseRotation={0}
          containerClassName="font-display font-light"
          textClassName="text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.15] font-light tracking-[-0.015em]"
        >
          Cada metro se mide, se corta y se entrega a mano. En Textiles Myriam ayudamos a vestir hogares, negocios y temporadas: desde una toalla hasta las cortinas de toda la casa.
        </ScrollReveal>
      </section>

      {/* ── COLECCIÓN ────────────────────────────────── */}
      <section id="coleccion" className="border-t border-line bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 data-reveal className="max-w-xl font-display text-[clamp(2.25rem,5vw,4rem)] leading-none font-light tracking-tight">
              Lo que más se lleva <em className="text-madder">la gente</em>
            </h2>
            <p data-reveal className="max-w-sm text-sm leading-relaxed text-muted">
              Ordenado según lo que nuestros clientes compraron en agosto. Precios de referencia por metro; pregunta por promociones y cortes por mayor.
            </p>
          </div>
          <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {COLECCION.map((c) => (
              <article key={c.nombre} data-reveal className={`group ${c.destacado ? 'sm:col-span-2 lg:row-span-1' : ''}`}>
                <div data-swatch className={`swatch ${c.weave} mb-4 rounded-2xl ${c.destacado ? 'aspect-[16/10] sm:aspect-[2/1] lg:aspect-[16/7.6]' : 'aspect-[4/3]'}`}>
                  {c.destacado && (
                    <span className="absolute top-4 left-4 z-10 rounded-full bg-linen/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-ink uppercase">
                      La más pedida
                    </span>
                  )}
                </div>
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-xl tracking-tight">{c.nombre}</h3>
                  <p className="text-right text-sm font-semibold tabular whitespace-nowrap">
                    {c.precio}
                    <span className="ml-1 font-normal text-muted">/ {c.unidad}</span>
                  </p>
                </div>
                <p className="mt-1 text-sm text-muted">{c.uso}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CORTINAS A LA MEDIDA ─────────────────────── */}
      <section id="cortinas" className="relative overflow-hidden bg-ink text-linen">
        <div className="mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p data-reveal className="mb-6 text-xs font-semibold tracking-[0.22em] text-madder uppercase">Por encargo</p>
            <h2 data-reveal className="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.98] font-light tracking-tight">
              Cortinas hechas para <em>tu</em> ventana.
            </h2>
            <p data-reveal className="mt-6 max-w-md leading-relaxed text-linen/70">
              Es lo que más nos piden: casi una de cada cinco ventas de la tienda. Tú eliges la tela, nosotros medimos, cortamos y confeccionamos.
            </p>
            <a data-reveal href={waLink('Hola, quiero cotizar unas cortinas a la medida. ')} className="press mt-10 inline-flex rounded-full bg-linen px-6 py-3.5 text-sm font-semibold text-ink hover:bg-paper">
              Cotizar mis cortinas
            </a>
          </div>
          <ol data-pasos className="relative space-y-14 pl-10 sm:pl-14">
            <span className="absolute top-2 bottom-2 left-[7px] w-px bg-linen/15 sm:left-[11px]" aria-hidden />
            <span data-thread-line className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-madder sm:left-[11px]" aria-hidden />
            {PASOS.map((p) => (
              <li key={p.n} data-reveal className="relative">
                <span className="absolute top-1.5 -left-10 grid size-4 place-items-center rounded-full border border-madder bg-ink sm:-left-14 sm:size-6" aria-hidden>
                  <span className="size-1.5 rounded-full bg-madder sm:size-2" />
                </span>
                <p className="font-display text-sm text-linen/45 tabular">{p.n}</p>
                <h3 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl">{p.t}</h3>
                <p className="mt-2 max-w-md leading-relaxed text-linen/65">{p.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── CIFRAS ───────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {DATOS.map((d) => (
            <div key={d.label} data-reveal className="bg-linen px-4 py-12 sm:px-8 sm:py-16">
              <p className="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-none font-light tracking-tight whitespace-nowrap tabular">
                {d.prefijo}
                <span data-count={d.valor}>{d.valor.toLocaleString('es-CO')}</span>
                <span className="text-[0.6em] text-madder">{d.sufijo}</span>
              </p>
              <p className="mt-3 max-w-[14rem] text-sm text-muted">{d.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VISÍTANOS ────────────────────────────────── */}
      <section id="visitanos" className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-end">
          <h2 data-reveal className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-light tracking-tight">
            Ven a tocar <br />
            <em className="text-madder">las telas.</em>
          </h2>
          <div data-reveal className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Dónde</p>
              <p className="mt-2 leading-relaxed">
                {TIENDA.direccion}
                <br />
                {TIENDA.ciudad}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-muted uppercase">Cuándo</p>
              <p className="mt-2 leading-relaxed">{TIENDA.horario}</p>
            </div>
            <a href={waLink()} className="press col-span-full inline-flex w-fit rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-linen hover:bg-ink-2">
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} Textiles Myriam</p>
          <a href="#caja" className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-madder">
            Acceso equipo → Caja
          </a>
        </div>
      </footer>
    </div>
  )
}
