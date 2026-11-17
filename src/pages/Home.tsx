import { useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import { About } from '../components/About'
import { Calculator } from '../components/Calculator'
import { DemoBadge } from '../components/Chrome'
import { ProductCard } from '../components/ProductCard'
import { ShopImage } from '../components/ShopImage'
import { catalog } from '../data/catalog'
import { categoryCover, FEATURED_HANDLES, priceLabel, productByHandle } from '../lib/products'

const spans = [
  'col-span-2 min-h-[240px] sm:row-span-2 sm:min-h-[420px]',
  'col-span-2 min-h-[190px]',
  'min-h-[170px]',
  'min-h-[170px]',
  'min-h-[170px]',
  'min-h-[170px]',
  'col-span-2 min-h-[190px]',
  'min-h-[170px]',
]

export function Home() {
  const location = useLocation()
  const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo
  useEffect(() => {
    document.title = 'VaruSmart Demo — Hem, bygg och energi'
    if (!scrollTo) return
    const node = document.getElementById(scrollTo)
    if (!node) return
    const timer = window.setTimeout(() => node.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40)
    return () => window.clearTimeout(timer)
  }, [scrollTo])

  const hero = productByHandle('akustikpanel-premium-240-60-cm-ljus-ek')
  const velvet = productByHandle('akustikpanel-i-sammet-gron-240-60-cm')
  const door = productByHandle('massiv-innerdorr-med-dold-karm-vit')
  const featured = FEATURED_HANDLES.map((handle) => productByHandle(handle)).filter((item) => item != null)
  const homeCategories = catalog.categories.filter((category) => category.home)

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] lg:pt-16">
        <div className="rise">
          <DemoBadge />
          <p className="mt-5 text-xs tracking-[0.14em] text-cyan uppercase sm:tracking-[0.22em]">{catalog.shop.legalName} · {catalog.shop.warehouse}</p>
          <h1 className="mt-3 font-display text-[2.15rem] leading-[0.92] font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block">Marknadens</span>
            <span className="text-gradient block">smartaste</span>
            <span className="text-gradient block">priser.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-mist">{catalog.shop.pitch}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/produkter" className="rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink">
              Se sortimentet
            </Link>
            <Link to="/kalkylator" className="rounded-full border border-white/15 px-5 py-3 text-sm">
              Räkna akustikvägg
            </Link>
          </div>
          <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Artiklar" value={String(catalog.products.length)} />
            <Metric label="Lager" value="Värnamo" />
            <Metric label="Priser" value="Inkl. moms" />
            <Metric label="Kundtjänst" value="Mån–fre" />
          </dl>
        </div>
        <div className="rise grid gap-3" style={{ animationDelay: '120ms' }}>
          {hero ? (
            <Link to={`/produkt/${encodeURIComponent(hero.handle)}`} className="group relative overflow-hidden rounded-[28px] border border-white/10">
              <div className="absolute -inset-8 -z-10 bg-copper/20 blur-3xl" />
              <ShopImage
                src={hero.images[0]?.src ?? ''}
                alt={hero.title}
                width={1400}
                eager
                className="aspect-[4/5] max-h-[68svh] w-full object-cover transition duration-700 group-hover:scale-[1.03] sm:aspect-[5/4] sm:max-h-none"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent p-5">
                <p className="text-xs tracking-[0.16em] text-copper-2 uppercase">Utvald</p>
                <p className="mt-1 font-display text-2xl font-bold">{hero.title}</p>
                <p className="text-mist">{priceLabel(hero)}</p>
              </div>
            </Link>
          ) : null}
          <div className="grid grid-cols-2 gap-3">
            {velvet ? <MiniProduct handle={velvet.handle} title="Sammet" price={priceLabel(velvet)} src={velvet.images[0]?.src} /> : null}
            {door ? <MiniProduct handle={door.handle} title="Innerdörr" price={priceLabel(door)} src={door.images[0]?.src} /> : null}
          </div>
        </div>
      </section>

      <section id="kategorier" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs tracking-[0.18em] text-copper uppercase">Kategorier</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Välj yta</h2>
          </div>
          <Link to="/produkter" className="text-sm text-mist underline decoration-white/20 underline-offset-4">
            Alla produkter
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {homeCategories.map((category, index) => {
            const src = categoryCover(category)
            return (
              <Link
                key={category.id}
                to={`/produkter?kategori=${category.id}`}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 ${spans[index] ?? 'min-h-[170px]'}`}
              >
                {src ? (
                  <ShopImage
                    src={src}
                    alt=""
                    width={1000}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/5" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <h3 className="font-display text-xl font-bold sm:text-2xl">{category.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-paper/80">{category.blurb}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-5">
          <p className="text-xs tracking-[0.18em] text-copper uppercase">Utvalt</p>
          <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Dörrar, paneler, golv och skivor</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <Calculator />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        <About compact />
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3">
      <dt className="text-[11px] tracking-[0.14em] text-mist uppercase">{label}</dt>
      <dd className="mt-1 font-display text-lg font-bold">{value}</dd>
    </div>
  )
}

function MiniProduct({ handle, title, price, src }: { handle: string; title: string; price: string; src?: string }) {
  return (
    <Link to={`/produkt/${encodeURIComponent(handle)}`} className="glass flex items-center gap-3 rounded-2xl p-2 pr-3">
      {src ? <ShopImage src={src} alt="" width={200} className="h-16 w-16 rounded-xl object-cover" /> : null}
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-sm text-mist">{price}</span>
      </span>
    </Link>
  )
}
