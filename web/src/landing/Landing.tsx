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
import fotoHero from '../assets/fotos/hero-rollos.jpg'
import fotoHistoria from '../assets/fotos/historia-corte.jpg'
import fotoBodega from '../assets/fotos/bodega.jpg'
import { CATEGORIAS } from './catalogo'
import Medidas from './Medidas'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const TELAS = ['Gabardina', 'Dril', 'Paño', 'Dacrón', 'Lino', 'Toalla', 'Satín', 'Velo bordado', 'Yakar', 'Antifluido', 'Piel de conejo', 'Lencería', 'Organza', 'Muselina', 'Seda', 'Tul', 'Franela', 'Lame']

const PILARES = [
  { t: 'Confianza', d: 'Más de 50 años y generaciones de clientes que vuelven.' },
  { t: 'Variedad', d: 'Telas para colegio, sastrería, hogar, fiesta y temporada.' },
  { t: 'Atención', d: 'Te ayudamos a escoger la tela y a calcular cuánta llevar.' },
]

const PASOS = [
  { n: '01', t: 'Nos cuentas el espacio', d: 'Medidas de la ventana, el estilo y la luz que quieres. Te mostramos telas en mano.' },
  { n: '02', t: 'Cotizas y abonas', d: 'Precio claro desde el primer día. Separas tu pedido con un abono.' },
  { n: '03', t: 'Confeccionamos', d: 'Cortamos y cosemos a tu medida, con acabados que duran.' },
  { n: '04', t: 'Recoges y pagas el saldo', d: 'Tu cortina lista para colgar. Pagas el saldo al recibir.' },
]

const DATOS = [
  { valor: 50, prefijo: '+', sufijo: ' años', label: 'atendiendo familias, modistas, sastres y colegios' },
  { valor: 20, prefijo: '+', sufijo: '', label: 'familias de tela en un solo lugar' },
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
        ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => setScrolled(self.scroll() > 80) })
        if (ctx.conditions?.reduce) return

        // Portada: el título lo anima SplitText; aquí entran la foto, el subtítulo y los botones
        gsap.from('[data-hero-photo]', { scale: 1.08, duration: 2.4, ease: 'power2.out' })
        gsap.from('[data-hero-in]', { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.55 })
        gsap.to('[data-hero-photo]', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } })
        gsap.to('[data-hero-content]', { yPercent: -10, autoAlpha: 0.25, ease: 'none', scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true } })

        gsap.set('[data-reveal]', { autoAlpha: 0, y: 28 })
        ScrollTrigger.batch('[data-reveal]', {
          start: 'top 88%',
          once: true,
          onEnter: (els) => gsap.to(els, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.07, overwrite: true }),
        })

        // Fotos: se descubren de abajo hacia arriba, como una tela que se desenrolla
        gsap.utils.toArray<HTMLElement>('[data-photo]').forEach((el) => {
          gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        })

        gsap.fromTo('[data-thread-line]', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '[data-pasos]', start: 'top 70%', end: 'bottom 60%', scrub: 0.6 } })

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
            <a href="#nosotros" className="opacity-80 transition-opacity hover:opacity-100">Nosotros</a>
            <a href="#telas" className="opacity-80 transition-opacity hover:opacity-100">Telas</a>
            <a href="#cortinas" className="opacity-80 transition-opacity hover:opacity-100">Cortinas</a>
            <a href="#medidas" className="opacity-80 transition-opacity hover:opacity-100">Medidas</a>
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

      {/* ── PORTADA ───────────────────────────────────── */}
      <section id="inicio" data-hero className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink text-linen">
        <img data-hero-photo src={fotoHero} alt="" aria-hidden className="absolute inset-0 size-full object-cover will-change-transform" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30" aria-hidden />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/30 to-transparent" aria-hidden />
        <Noise opacity={0.08} fps={12} blendMode="overlay" className="pointer-events-none" />

        <div data-hero-content className="relative mx-auto w-full max-w-7xl px-4 pt-32 pb-14 sm:px-8 sm:pb-20">
          <p data-hero-in className="mb-6 flex items-center gap-3 text-xs font-semibold tracking-[0.22em] text-linen/80 uppercase">
            <span className="h-px w-8 bg-madder" /> Más de 50 años en el oficio
          </p>
          <SplitText
            text="Todo empieza con una buena tela."
            tag="h1"
            className="max-w-4xl font-display text-[clamp(2.9rem,8.5vw,7rem)] leading-[0.95] font-light tracking-[-0.03em] [text-wrap:balance]"
            textAlign="left"
            splitType="words"
            effect="rise"
            mask
            trigger="load"
            delay={70}
            duration={1.1}
          />
          <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <p data-hero-in className="max-w-md text-base leading-relaxed text-linen/80 sm:text-lg">
              Telas para uniformes de colegio, trajes, cortinas, lencería y confección. Variedad, buen precio según la cantidad y una atención que te ayuda a calcular cuánto llevar.
            </p>
            <div data-hero-in className="flex flex-wrap gap-3">
              <a href={waLink()} className="press rounded-full bg-madder px-6 py-3.5 text-sm font-semibold text-linen hover:bg-madder-2">
                Cotizar por WhatsApp
              </a>
              <a href="#telas" className="press rounded-full border border-linen/30 px-6 py-3.5 text-sm font-semibold hover:bg-linen hover:text-ink">
                Ver telas
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

      {/* ── NOSOTROS ─────────────────────────────────── */}
      <section id="nosotros" className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20">
        <div data-photo className="relative overflow-hidden rounded-3xl">
          <img src={fotoHistoria} alt="Manos cortando tela sobre la mesa con el metro" loading="lazy" className="aspect-[4/5] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5]" />
          <span className="absolute bottom-4 left-4 rounded-full bg-linen/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-ink uppercase">Medimos y cortamos frente a ti</span>
        </div>
        <div>
          <p data-reveal className="mb-6 text-xs font-semibold tracking-[0.22em] text-madder uppercase">Nuestra historia</p>
          <h2 data-reveal className="font-display text-[clamp(2.25rem,4.6vw,3.9rem)] leading-[1] font-light tracking-tight [text-wrap:balance]">
            Un almacén de confianza, atendido <em className="text-madder">con paciencia.</em>
          </h2>
          <p data-reveal className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Textiles Myriam lleva más de 50 años surtiendo a familias, modistas, sastres y colegios. Aquí encuentras variedad de telas, precios justos según la cantidad que lleves y alguien que te asesora metro a metro.
          </p>
          <dl className="mt-10 grid gap-6 sm:grid-cols-3">
            {PILARES.map((p) => (
              <div key={p.t} data-reveal className="border-t border-ink/15 pt-4">
                <dt className="font-display text-xl tracking-tight">{p.t}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted">{p.d}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── FRASE ────────────────────────────────────── */}
      <section className="border-y border-line bg-paper">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:px-8 sm:py-32">
          <ScrollReveal
            baseOpacity={0.12}
            enableBlur
            blurStrength={3}
            baseRotation={0}
            containerClassName="font-display font-light"
            textClassName="text-[clamp(1.75rem,4vw,3.25rem)] leading-[1.15]! font-light! tracking-[-0.015em]"
          >
            El uniforme del primer día de colegio, el traje del grado, las cortinas de la casa nueva. Hace más de medio siglo que cada metro se mide, se corta y se entrega a mano.
          </ScrollReveal>
        </div>
      </section>

      {/* ── TELAS ────────────────────────────────────── */}
      <section id="telas">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-8 sm:py-32">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 data-reveal className="max-w-xl font-display text-[clamp(2.25rem,5vw,4rem)] leading-none font-light tracking-tight">
              Una tela para <em className="text-madder">cada ocasión</em>
            </h2>
            <p data-reveal className="max-w-sm text-sm leading-relaxed text-muted">
              El precio depende de cuánto lleves: entre más metros, mejor precio. Escríbenos y te cotizamos al instante.
            </p>
          </div>
          <div className="grid gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIAS.map((c) => (
              <a key={c.slug} href={`#telas-${c.slug}`} data-reveal className="group block">
                <div data-photo className="swatch mb-4 overflow-hidden rounded-2xl bg-linen-2">
                  <img
                    src={c.foto}
                    alt={c.alt}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.03]"
                    style={c.pos ? { objectPosition: c.pos } : undefined}
                  />
                </div>
                <h3 className="flex items-baseline justify-between gap-3 font-display text-xl tracking-tight">
                  {c.nombre}
                  <span className="shrink-0 font-sans text-sm font-semibold text-madder transition-transform duration-300 group-hover:translate-x-1">Ver telas →</span>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{c.resumen}</p>
              </a>
            ))}
          </div>
          <div data-reveal className="mt-14 flex flex-col items-start justify-between gap-4 rounded-2xl bg-ink px-6 py-6 text-linen sm:flex-row sm:items-center sm:px-8">
            <p className="max-w-xl leading-relaxed text-linen/85">¿No ves la tela que buscas? Tenemos más de 20 familias de tela en el almacén. Pregúntanos por la que necesitas.</p>
            <a href={waLink('Hola, estoy buscando una tela: ')} className="press shrink-0 rounded-full bg-linen px-5 py-3 text-sm font-semibold text-ink hover:bg-paper">
              Preguntar por una tela
            </a>
          </div>
        </div>
      </section>

      {/* ── CORTINAS A LA MEDIDA ─────────────────────── */}
      <section id="cortinas" className="relative overflow-hidden bg-ink text-linen">
        <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
          <Threads color="#efe7da" accentColor="#c4553a" amplitude={1.1} distance={0.25} lineCount={50} speed={0.25} angle={-12} opacity={0.5} brightness={1} fade={0.4} />
        </div>
        <div className="relative mx-auto grid max-w-7xl gap-16 px-4 py-24 sm:px-8 sm:py-32 lg:grid-cols-[1fr_1.1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p data-reveal className="mb-6 text-xs font-semibold tracking-[0.22em] text-madder uppercase">Por encargo</p>
            <h2 data-reveal className="font-display text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.98] font-light tracking-tight">
              Cortinas hechas para <em>tu</em> ventana.
            </h2>
            <p data-reveal className="mt-6 max-w-md leading-relaxed text-linen/70">
              Es uno de los servicios que más nos piden. Tú eliges la tela; nosotros medimos, cortamos y confeccionamos. ¿Tienes afán? También hay cortinas listas para poner.
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

      <Medidas />

      {/* ── CIFRAS ───────────────────────────────────── */}
      <section className="border-b border-line">
        <div className="mx-auto grid max-w-7xl gap-px bg-line sm:grid-cols-3">
          {DATOS.map((d) => (
            <div key={d.label} data-reveal className="bg-linen px-4 py-12 sm:px-8 sm:py-16">
              <p className="font-display text-[clamp(2.75rem,6vw,4.75rem)] leading-none font-light tracking-tight whitespace-nowrap tabular">
                {d.prefijo}
                <span data-count={d.valor}>{d.valor.toLocaleString('es-CO')}</span>
                <span className="text-[0.55em] text-madder">{d.sufijo}</span>
              </p>
              <p className="mt-3 max-w-[16rem] text-sm text-muted">{d.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VISÍTANOS ────────────────────────────────── */}
      <section id="visitanos" className="relative overflow-hidden bg-ink text-linen">
        <img data-photo src={fotoBodega} alt="Rollos de tela en el almacén" loading="lazy" className="absolute inset-0 size-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-8 sm:py-32 lg:grid-cols-2 lg:items-end">
          <h2 data-reveal className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-light tracking-tight">
            Ven a tocar <br />
            <em className="text-madder">las telas.</em>
          </h2>
          <div data-reveal className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-linen/60 uppercase">Dónde</p>
              <p className="mt-2 leading-relaxed">
                {TIENDA.direccion}
                <br />
                {TIENDA.ciudad}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-linen/60 uppercase">Cuándo</p>
              <p className="mt-2 leading-relaxed">{TIENDA.horario}</p>
            </div>
            <a href={waLink()} className="press col-span-full inline-flex w-fit rounded-full bg-madder px-6 py-3.5 text-sm font-semibold text-linen hover:bg-madder-2">
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer className="border-t border-line" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} Textiles Myriam · Más de 50 años <span className="mx-2 text-line">|</span> Fotos: Pexels
          </p>
          <a href="#caja" className="font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-madder">
            Acceso equipo → Caja
          </a>
        </div>
      </footer>
    </div>
  )
}
