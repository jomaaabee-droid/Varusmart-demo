import { Link } from 'react-router'
import type { Product } from '../data/types'
import { categoryTitle, formatKr, inStock, priceLabel, referenceCompare, salePercent } from '../lib/products'
import { ShopImage } from './ShopImage'

export function ProductCard({ product }: { product: Product }) {
  const compare = referenceCompare(product)
  const discount = compare ? salePercent(minOf(product), compare) : null
  const image = product.images[0]

  return (
    <article className="glass group flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-copper/40 hover:shadow-[0_0_40px_rgba(230,161,92,0.14)]">
      <Link to={`/produkt/${encodeURIComponent(product.handle)}`} className="relative block">
        <div className="aspect-[4/5] overflow-hidden bg-ink-2">
          {image ? (
            <ShopImage
              src={image.src}
              alt={image.alt || product.title}
              width={800}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-mist">Bild saknas</div>
          )}
        </div>
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {discount ? (
            <span className="rounded-full bg-copper px-2.5 py-1 text-xs font-semibold text-ink">−{discount}%</span>
          ) : null}
          {!inStock(product) ? (
            <span className="rounded-full bg-ink/80 px-2.5 py-1 text-xs text-paper">Slut i lager</span>
          ) : null}
          {product.restock ? (
            <span className="rounded-full bg-ink/75 px-2.5 py-1 text-xs text-cyan">Åter {product.restock}</span>
          ) : null}
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-[11px] font-medium tracking-[0.18em] text-copper uppercase">
          {categoryTitle(product.primaryCategoryId)}
        </p>
        <Link to={`/produkt/${encodeURIComponent(product.handle)}`} className="font-display text-lg leading-snug font-semibold">
          {product.title}
        </Link>
        <div className="mt-auto">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-lg font-medium">{priceLabel(product)}</p>
            {compare ? <p className="text-sm text-mist line-through">{formatKr(compare)}</p> : null}
          </div>
          {product.priceNote ? <p className="mt-1 text-sm text-cyan">{product.priceNote}</p> : null}
        </div>
        <a
          href={product.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-mist underline decoration-white/20 underline-offset-4 transition hover:text-paper"
        >
          Öppna på varusmart.se
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  )
}

function minOf(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price))
}
