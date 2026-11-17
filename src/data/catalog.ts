import raw from './catalog.json' with { type: 'json' }
import type { Catalog } from './types'

export const catalog = raw as unknown as Catalog
