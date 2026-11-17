import { useState } from 'react'
import { shopifyWidth } from '../lib/products'

type ShopImageProps = {
  src: string
  alt: string
  width?: number
  className?: string
  eager?: boolean
}

export function ShopImage({ src, alt, width = 900, className, eager = false }: ShopImageProps) {
  const [useOriginal, setUseOriginal] = useState(false)
  return (
    <img
      src={useOriginal ? src : shopifyWidth(src, width)}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setUseOriginal(true)}
    />
  )
}
