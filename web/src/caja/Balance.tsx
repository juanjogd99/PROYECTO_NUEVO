import { useMemo } from 'react'
import type { Movimiento } from '../lib/types'
import { resumir } from '../lib/stats'
import { dateLong, money, moneyShort, pct } from '../lib/format'
import { BarList, DailyBars, WeekdayColumns } from './charts'

function Kpi({ label, value, hint, strong }: { label: string; value: string; hint?: string; strong?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 ${strong ? 'bg-ink text-linen' : 'border border-line bg-paper'}`}>
      <p className={`text-xs font-semibold tracking-wide uppercase ${strong ? 'text-linen/60' : 'text-muted'}`}>{label}</p>
      <p className="mt-2 font-display text-3xl tracking-tight tabular sm:text-[2.1rem]">{value}</p>
      {hint && <p className={`mt-1 text-xs ${strong ? 'text-linen/60' : 'text-muted'}`}>{hint}</p>}
    </div>
  )
}

function Card({ title, sub, children, className = '' }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-paper p-5 sm:p-6 ${className}`}>
      <header className="mb-5">
        <h2 className="font-display text-lg tracking-tight">{title}</h2>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </header>
      {children}
    </section>
  )
}

const SIN = ['Otras telas', 'Sin detalle']
const DIA: Record<string, string> = { Lun: 'lunes', Mar: 'martes', Mié: 'miércoles', Jue: 'jueves', Vie: 'viernes', Sáb: 'sábado', Dom: 'domingo' }

export default function Balance({ rows, periodo }: { rows: Movimiento[]; periodo: string }) {
  const r = useMemo(() => resumir(rows), [rows])

  const lecturas = useMemo(() => {
    const out: { titulo: string; texto: string; tono: 'alerta' | 'oportunidad' | 'ok' }[] = []
    if (!r.ingresos) return out
    const ratioEgr = r.egresos / r.ingresos
    if (ratioEgr < 0.15)
      out.push({
        tono: 'alerta',
        titulo: `Los egresos registrados son solo el ${pct(ratioEgr)} de los ingresos`,
        texto:
          'Faltan las compras de mercancía, la nómina, el arriendo y los servicios. Mientras no estén aquí, el saldo es caja recibida, no utilidad. Registrarlos convierte este tablero en un estado de resultados real.',
      })
    if (r.efectivo > 0.6)
      out.push({
        tono: 'alerta',
        titulo: `${pct(r.efectivo)} de lo que entra es efectivo`,
        texto: 'Mucho efectivo en caja es riesgo de pérdidas y descuadres. Recomendado: hacer arqueo diario contra este registro, consignar a diario y empujar transferencias o QR, que dejan rastro solos.',
      })
    if (r.sinDetalle > 0.05)
      out.push({
        tono: 'oportunidad',
        titulo: `${pct(r.sinDetalle)} de las ventas se anotan sin producto`,
        texto: 'Sin el producto no se sabe qué tela rota y cuál se queda quieta, y eso es plata parada en la bodega. En la Caja el producto se elige de una lista: toma dos segundos.',
      })
    if (r.porDiaSemana.length >= 4) {
      const best = r.porDiaSemana.reduce((a, b) => (b.value > a.value ? b : a))
      const worst = r.porDiaSemana.reduce((a, b) => (b.value < a.value ? b : a))
      const b = DIA[best.label] ?? best.label
      const w = DIA[worst.label] ?? worst.label
      if (best.value > worst.value * 1.2)
        out.push({
          tono: 'oportunidad',
          titulo: `El ${b} se vende ${pct(best.value / worst.value - 1)} más que el ${w}`,
          texto: `En promedio ${moneyShort(best.value)} contra ${moneyShort(worst.value)}. Conviene reforzar personal el ${b} y probar una promoción para el ${w} (retazos, o el metro adicional con descuento).`,
        })
    }
    const top = r.porFamilia.find((f) => f.label !== 'Sin detalle' && f.label !== 'Otras telas')
    const totalVentas = r.porFamilia.reduce((s, f) => s + f.value, 0)
    if (top && totalVentas)
      out.push({
        tono: 'ok',
        titulo: `${top.label}: la línea que más factura (${pct(top.value / totalVentas)})`,
        texto:
          top.label === 'Cortinas'
            ? `Además entraron ${moneyShort(r.pedidos)} en abonos y saldos de pedidos. Vale la pena llevar control de pedidos pendientes por cobrar y mostrar las cortinas en la vitrina y en la web.`
            : 'Asegurar inventario de esta línea y negociar mejor precio con el proveedor por volumen.',
      })
    return out
  }, [r])

  if (!rows.length) return <p className="py-20 text-center text-muted">No hay movimientos en este periodo.</p>

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi strong label="Saldo neto de caja" value={moneyShort(r.neto)} hint={`${periodo} · ingresos − egresos`} />
        <Kpi label="Ingresos" value={moneyShort(r.ingresos)} hint={`${r.ventas.toLocaleString('es-CO')} movimientos`} />
        <Kpi label="Egresos" value={moneyShort(r.egresos)} hint={r.ingresos ? `${pct(r.egresos / r.ingresos)} de los ingresos` : undefined} />
        <Kpi label="Ticket promedio" value={money(r.ticket)} hint={`${moneyShort(r.promedioDia)} por día · ${r.dias} días`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Ingresos por día" sub={r.mejorDia ? `Mejor día: ${dateLong(r.mejorDia.fecha)} con ${money(r.mejorDia.ingresos)}` : undefined}>
          <DailyBars data={r.porDia} />
        </Card>
        <Card title="Promedio por día de la semana" sub="Ingreso promedio en los días con ventas">
          <WeekdayColumns data={r.porDiaSemana} />
        </Card>
      </div>

      {lecturas.length > 0 && (
        <section className="rounded-2xl border border-line bg-linen-2/60 p-5 sm:p-6">
          <h2 className="font-display text-lg tracking-tight">Lectura financiera</h2>
          <p className="mt-0.5 mb-5 text-xs text-muted">Se recalcula con los datos del periodo elegido</p>
          <div className="grid gap-3 md:grid-cols-2">
            {lecturas.map((l) => (
              <article key={l.titulo} className="rounded-xl bg-paper p-4">
                <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase">
                  <span className={`size-1.5 rounded-full ${l.tono === 'alerta' ? 'bg-bad' : l.tono === 'ok' ? 'bg-good' : 'bg-indigo'}`} />
                  <span className={l.tono === 'alerta' ? 'text-bad' : l.tono === 'ok' ? 'text-good' : 'text-indigo'}>
                    {l.tono === 'alerta' ? 'Atención' : l.tono === 'ok' ? 'Fortaleza' : 'Oportunidad'}
                  </span>
                </p>
                <h3 className="font-semibold leading-snug">{l.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-2">{l.texto}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Ventas por familia de tela" sub="Agrupa los nombres escritos a mano">
          <BarList data={[...r.porFamilia.filter((f) => !SIN.includes(f.label)), ...r.porFamilia.filter((f) => SIN.includes(f.label))]} total={r.porFamilia.reduce((s, f) => s + f.value, 0)} />
        </Card>
        <Card title="Ingresos por forma de pago">
          <BarList data={r.porForma} total={r.ingresos} tone="ink" />
        </Card>
        <Card title="Egresos por categoría" sub={r.egresos ? undefined : 'Sin egresos en este periodo'}>
          {r.egresos > 0 ? <BarList data={r.porCategoriaEgreso} total={r.egresos} tone="ink" /> : <p className="text-sm text-muted">Registra compras, nómina y arriendo para ver aquí la estructura de gastos.</p>}
        </Card>
      </div>
    </div>
  )
}
