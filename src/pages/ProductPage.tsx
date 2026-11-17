import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { ProductCard } from '../components/ProductCard'
import { ShopImage } from '../components/ShopImage'
import { catalog } from '../data/catalog'
import {
  categoryTitle,
  formatKr,
  matchingVariant,
  productByHandle,
  relatedProducts,
  salePercent,
} from '../lib/products'

export function ProductPage() {
  const { handle } = useParams()
  const product = productByHandle(handle)
  const [handleKey, setHandleKey] = useState(handle)
  const [selected, setSelected] = useState<string[]>(product?.variants[0]?.options ?? [])
  const [imageIndex, setImageIndex] = useState(0)

  if (handle !== handleKey) {
    setHandleKey(handle)
    setSelected(product?.variants[0]?.options ?? [])
    setImageIndex(0)
  }

  useEffect(() => {
    const current = productByHandle(handle)
    document.title = current ? `${current.title} — VaruSmart Demo` : 'Hittades inte — VaruSmart Demo'
    window.scrollTo(0, 0)
  }, [handle])

  const variant = product ? matchingVariant(product, selected) : undefined
  const gallery = useMemo(() => {
    if (!product) return []
    const images = product.images.map((image) => image.src)
    if (variant?.image && !images.includes(variant.image)) images.unshift(variant.image)
    if (variant?.image) {
      const rest = images.filter((src) => src !== variant.image)
      return [variant.image, ...rest]
    }
    return images
  }, [product, variant])

  if (!product || !variant) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-xs tracking-[0.18em] text-copper uppercase">Produkt</p>
        <h1 className="mt-3 font-display text-4xl font-bold">Den här produkten finns inte i demon.</h1>
        <p className="mt-3 text-mist">Den kan ha bytt adress i butiken, eller så är länken ofullständig.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/produkter" className="rounded-full bg-paper px-4 py-2.5 text-sm font-semibold text-ink">
            Till sortimentet
          </Link>
          <a href={catalog.shop.site} className="rounded-full border border-white/15 px-4 py-2.5 text-sm">
            varusmart.se
          </a>
        </div>
      </div>
    )
  }

  const discount = salePercent(variant.price, variant.compareAt)
  const activeImage = gallery[imageIndex] ?? gallery[0]
  const related = relatedProducts(product)

  function chooseOption(index: number, value: string) {
    const next = [...selected]
    next[index] = value
    const match = product!.variants.find((item) => next.every((option, optionIndex) => item.options[optionIndex] === option))
    if (match) {
      setSelected(match.options)
      return
    }
    const fallback = product!.variants.find((item) => item.options[index] === value)
    setSelected(fallback?.options ?? next)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:py-10">
      <p className="text-sm text-mist">
        <Link to="/produkter" className="hover:text-paper">
          Sortiment
        </Link>
        <span className="px-2">/</span>
        <Link to={`/produkter?kategori=${product.primaryCategoryId}`} className="hover:text-paper">
          {categoryTitle(product.primaryCategoryId)}
        </Link>
      </p>
      <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-ink-2">
            {activeImage ? (
              <ShopImage src={activeImage} alt={product.title} width={1400} eager className="aspect-square w-full object-cover sm:aspect-[5/4]" />
            ) : (
              <div className="grid aspect-square place-items-center text-mist">Bild saknas</div>
            )}
          </div>
          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {gallery.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border ${index === imageIndex ? 'border-copper' : 'border-white/10'}`}
                  aria-label={`Bild ${index + 1}`}
                >
                  <ShopImage src={src} alt="" width={160} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div>
          <p className="text-xs tracking-[0.18em] text-copper uppercase">{categoryTitle(product.primaryCategoryId)}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{product.title}</h1>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <p className="font-display text-4xl font-bold">{formatKr(variant.price)}</p>
            {variant.compareAt && variant.compareAt > variant.price ? (
              <p className="text-lg text-mist line-through">{formatKr(variant.compareAt)}</p>
            ) : null}
            {discount ? <span className="rounded-full bg-copper px-2.5 py-1 text-sm font-semibold text-ink">−{discount}%</span> : null}
          </div>
          {product.priceNote ? <p className="mt-2 text-cyan">{product.priceNote}</p> : null}
          <p className="mt-2 text-sm text-mist">{variant.available ? 'I lager enligt varusmart.se' : 'Slut i lager hos varusmart.se'}</p>

          {product.notice ? (
            <aside className="mt-5 rounded-3xl border border-copper/40 bg-copper/10 p-4">
              <p className="text-xs tracking-[0.16em] text-copper-2 uppercase">CFW-innerdörr</p>
              <p className="mt-2 leading-relaxed">{product.notice}</p>
            </aside>
          ) : null}

          {product.options.length > 0 ? (
            <div className="mt-6 grid gap-4">
              {product.options.map((option, index) => (
                <div key={option.name}>
                  <p className="text-sm text-mist">{option.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const active = selected[index] === value
                      return (
                        <button
                          key={value}
                          type="button"
                          aria-pressed={active}
                          onClick={() => chooseOption(index, value)}
                          className={`rounded-full border px-3 py-2 text-sm ${active ? 'border-copper bg-copper text-ink' : 'border-white/15'}`}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {product.shippingNote ? <p className="mt-5 text-sm leading-relaxed text-mist">{product.shippingNote}.</p> : null}
          {product.restock ? <p className="mt-2 text-sm text-cyan">Åter i lager {product.restock}, enligt produktsidan.</p> : null}
          {variant.sku ? <p className="mt-2 text-xs tracking-wide text-mist uppercase">Art.nr {variant.sku}</p> : null}

          <div className="mt-6 hidden gap-3 sm:flex">
            <a href={product.url} target="_blank" rel="noreferrer" className="rounded-full bg-paper px-5 py-3 text-sm font-semibold text-ink">
              Köp på varusmart.se
            </a>
            <Link to="/produkter" className="rounded-full border border-white/15 px-5 py-3 text-sm">
              Fler produkter
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl font-bold">Produkttext</h2>
        <p className="mt-1 text-sm text-mist">Hämtad från varusmart.se. Priserna är inklusive moms.</p>
        <div className="shop-copy mt-4" dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
      </section>

      {related.length ? (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">I samma kategori</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-white/10 bg-ink/95 p-3 backdrop-blur md:hidden">
        <a href={product.url} target="_blank" rel="noreferrer" className="flex items-center justify-between rounded-full bg-paper px-4 py-3 text-sm font-semibold text-ink">
          <span>Köp på varusmart.se</span>
          <span>{formatKr(variant.price)}</span>
        </a>
      </div>
    </div>
  )
}
