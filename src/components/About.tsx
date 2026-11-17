import { catalog } from '../data/catalog'

const facts = [
  { label: 'Lager', value: catalog.shop.warehouse, detail: 'Kostnadsfri avhämtning nämns på produktsidorna. Välj avhämtning i kassan.' },
  { label: 'Företagsadress', value: catalog.shop.companyAddress, detail: catalog.shop.legalName },
  { label: 'Kundtjänst', value: catalog.shop.hours, detail: `${catalog.shop.phone} · ${catalog.shop.email}` },
  { label: 'Leverans', value: catalog.shop.shipsFrom, detail: 'Fraktavgiften står på respektive produktsida.' },
]

export function About({ compact = false }: { compact?: boolean }) {
  return (
    <section id="om-oss" className="scroll-mt-24">
      <div className="grid items-end gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <p className="text-xs tracking-[0.18em] text-copper uppercase">Om oss</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Lager i <span className="text-gradient">Värnamo.</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-mist">{catalog.shop.pitch}</p>
          {!compact ? (
            <p className="mt-3 max-w-xl text-mist">
              {catalog.shop.name} är ett varumärke under {catalog.shop.legalName}. Sortimentet spänner över innerdörrar,
              akustikpaneler i trä och sammet, SPC-väggpaneler, golv, skivmaterial och el — med priser som hämtas direkt
              från butiken.
            </p>
          ) : null}
        </div>
        <p className="max-w-full overflow-hidden font-display text-5xl leading-none font-extrabold tracking-tight text-white/10 sm:text-6xl lg:text-right">
          VÄRNAMO
        </p>
      </div>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <article key={fact.label} className="glass rounded-3xl p-5">
            <p className="text-xs tracking-[0.16em] text-cyan uppercase">{fact.label}</p>
            <h3 className="mt-2 font-display text-2xl font-bold">{fact.value}</h3>
            <p className="mt-2 text-sm leading-relaxed text-mist">{fact.detail}</p>
          </article>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <a href={`mailto:${catalog.shop.email}`} className="rounded-full bg-paper px-4 py-2.5 font-semibold text-ink">
          {catalog.shop.email}
        </a>
        <a href={catalog.shop.phoneHref} className="rounded-full border border-white/15 px-4 py-2.5">
          {catalog.shop.phone}
        </a>
      </div>
    </section>
  )
}
