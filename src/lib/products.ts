import { catalog } from '../data/catalog'
import type { Category, Product, Variant } from '../data/types'

export const FEATURED_HANDLES = [
  'massiv-innerdorr-med-dold-karm-vit',
  'akustikpanel-premium-240-60-cm-ljus-ek',
  'akustikpanel-i-sammet-gron-240-60-cm',
  'spc-vaggpaneler-badrum-kok-hus',
  'vinylgolv-ljus-ek-1-7568-m-per-kartong',
  'nya-osb-skivor-1200x2600x12mm',
]

export function formatKr(value: number): string {
  const decimals = Math.round(value * 100) % 100 !== 0
  const formatted = new Intl.NumberFormat('sv-SE', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value)
  return `${formatted} kr`
}

export function salePercent(price: number, compareAt: number | null): number | null {
  if (compareAt == null || compareAt <= price) return null
  return Math.round((1 - price / compareAt) * 100)
}

export function minPrice(product: Product): number {
  return Math.min(...product.variants.map((variant) => variant.price))
}

export function priceLabel(product: Product): string {
  const prices = product.variants.map((variant) => variant.price)
  const low = Math.min(...prices)
  const high = Math.max(...prices)
  return low === high ? formatKr(low) : `från ${formatKr(low)}`
}

export function referenceCompare(product: Product): number | null {
  const low = minPrice(product)
  const compares = product.variants
    .filter((variant) => variant.price === low && variant.compareAt != null && variant.compareAt > variant.price)
    .map((variant) => variant.compareAt as number)
  return compares.length ? Math.max(...compares) : null
}

export function productByHandle(handle: string | undefined): Product | undefined {
  if (!handle) return undefined
  const decoded = decodeURIComponent(handle)
  return catalog.products.find((product) => product.handle === decoded)
}

export function categoryById(id: string | undefined): Category | undefined {
  return catalog.categories.find((category) => category.id === id)
}

export function categoryTitle(id: string): string {
  return categoryById(id)?.title ?? 'Sortiment'
}

export function productsInCategory(id: string): Product[] {
  return catalog.products.filter((product) => product.categoryIds.includes(id))
}

export function categoryCover(category: Category): string | undefined {
  const chosen = category.coverHandle ? productByHandle(category.coverHandle) : undefined
  const product = chosen ?? catalog.products.find((item) => item.categoryIds.includes(category.id))
  return product?.images[0]?.src
}

export function relatedProducts(product: Product, limit = 4): Product[] {
  return catalog.products
    .filter((item) => item.id !== product.id && item.primaryCategoryId === product.primaryCategoryId)
    .slice(0, limit)
}

export function shopifyWidth(src: string, width: number): string {
  try {
    const url = new URL(src)
    url.searchParams.set('width', String(width))
    return url.toString()
  } catch {
    return src
  }
}

export function inStock(product: Product): boolean {
  return product.variants.some((variant) => variant.available)
}

export function matchingVariant(product: Product, selected: string[]): Variant {
  const found = product.variants.find((variant) =>
    selected.every((value, index) => variant.options[index] === value),
  )
  return found ?? product.variants[0]
}

export function acousticProducts(): Product[] {
  return productsInCategory('akustik-paneler')
}
