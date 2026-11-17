export type Variant = {
  id: number
  title: string
  price: number
  compareAt: number | null
  available: boolean
  sku: string | null
  image: string | null
  options: string[]
}

export type ProductImage = {
  src: string
  alt: string
  width: number
  height: number
}

export type ProductOption = {
  name: string
  values: string[]
}

export type Product = {
  id: number
  title: string
  handle: string
  vendor: string
  productType: string
  tags: string[]
  excerpt: string
  descriptionHtml: string
  images: ProductImage[]
  options: ProductOption[]
  variants: Variant[]
  categoryIds: string[]
  primaryCategoryId: string
  url: string
  priceNote: string | null
  shippingNote: string | null
  notice: string | null
  restock: string | null
}

export type Category = {
  id: string
  title: string
  blurb: string
  home: boolean
  coverHandle: string | null
  collectionUrl: string
}

export type Shop = {
  name: string
  legalName: string
  tagline: string
  pitch: string
  email: string
  phone: string
  phoneHref: string
  hours: string
  companyAddress: string
  warehouse: string
  shipsFrom: string
  site: string
}

export type Catalog = {
  fetchedAt: string
  source: string
  shop: Shop
  categories: Category[]
  products: Product[]
}
