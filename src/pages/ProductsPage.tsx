import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { catalog } from '../data/catalog'
import { minPrice } from '../lib/products'
import type { Product } from '../data/types'

type SortKey = 'shop' | 'price-asc' | 'price-desc' | 'name'

export function ProductsPage() {
  const [params, setParams] = useSearchParams()
  const category = params.get('kategori') ?? 'alla'
  const query = params.get('q') ?? ''
  const [sort, setSort] = useState<SortKey>('shop')

  useEffect(() => {
    const title = catalog.categories.find((item) => item.id === category)?.title
    document.title = title ? `${title} — VaruSmart Demo` : 'Sortiment — VaruSmart Demo'
  }, [category])

  const products = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('sv')
    let list = catalog.products.filter((product) => category === 'alla' || product.categoryIds.includes(category))
    if (needle) {
      list = list.filter((product) =>
        [product.title, product.productType, product.excerpt, product.tags.join(' ')]
          .join(' ')
          .toLocaleLowerCase('sv')
          .includes(needle),
      )
    }
    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => minPrice(a) - minPrice(b))
    if (sort === 'price-desc') sorted.sort((a, b) => minPrice(b) - minPrice(a))
    if (sort === 'name') sorted.sort((a, b) => a.title.localeCompare(b.title, 'sv'))
    return sorted
  }, [category, query, sort])

  function update(next: { kategori?: string; q?: string }) {
    const paramsNext = new URLSearchParams(params)
    if (next.kategori !== undefined) {
      if (next.kategori === 'alla') paramsNext.delete('kategori')
      else paramsNext.set('kategori', next.kategori)
    }
    if (next.q !== undefined) {
      if (!next.q) paramsNext.delete('q')
      else paramsNext.set('q', next.q)
    }
    setParams(paramsNext, { replace: true })
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p className="text-xs tracking-[0.18em] text-copper uppercase">Sortiment</p>
      <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Alla produkter</h1>
      <p className="mt-2 max-w-2xl text-mist">
        {catalog.products.length} artiklar från varusmart.se, hämtade {catalog.fetchedAt}. Filtrera på kategori eller sök
        på namn.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Sök produkt</span>
          <input
            value={query}
            onChange={(event) => update({ q: event.target.value })}
            placeholder="Sök dörr, sammet, OSB, uttag…"
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-paper placeholder:text-mist"
          />
        </label>
        <label className="sm:w-52">
          <span className="sr-only">Sortering</span>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortKey)}
            className="w-full rounded-full border border-white/10 bg-ink px-4 py-3"
          >
            <option value="shop">Butikens ordning</option>
            <option value="price-asc">Lägst pris</option>
            <option value="price-desc">Högst pris</option>
            <option value="name">A–Ö</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Chip active={category === 'alla'} onClick={() => update({ kategori: 'alla' })}>
          Alla {catalog.products.length}
        </Chip>
        {catalog.categories.map((item) => {
          const count = catalog.products.filter((product) => product.categoryIds.includes(item.id)).length
          if (!count) return null
          return (
            <Chip key={item.id} active={category === item.id} onClick={() => update({ kategori: item.id })}>
              {item.title} {count}
            </Chip>
          )
        })}
      </div>

      <p className="mt-4 text-sm text-mist">
        Visar {products.length} {products.length === 1 ? 'produkt' : 'produkter'}
      </p>

      {products.length === 0 ? (
        <Empty onReset={() => update({ kategori: 'alla', q: '' })} />
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`shrink-0 rounded-full border px-3 py-2 text-sm ${active ? 'border-copper bg-copper text-ink' : 'border-white/15 text-mist'}`}
    >
      {children}
    </button>
  )
}

function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className="glass mt-6 rounded-3xl p-8 text-center">
      <h2 className="font-display text-2xl font-bold">Inga träffar</h2>
      <p className="mt-2 text-mist">Prova ett annat ord, eller visa hela sortimentet.</p>
      <button type="button" onClick={onReset} className="mt-4 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink">
        Rensa filter
      </button>
    </div>
  )
}
