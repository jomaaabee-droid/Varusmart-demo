import { useState } from 'react'
import { Link } from 'react-router'
import { acousticProducts, formatKr, priceLabel, shopifyWidth } from '../lib/products'

const PANEL_WIDTH = 60
const PANEL_HEIGHT = 240
const PANEL_AREA = (PANEL_WIDTH * PANEL_HEIGHT) / 10_000

type Orientation = 'staende' | 'liggande'

const presets = [
  { label: 'TV-vägg', width: '320', height: '240' },
  { label: 'Sovrum', width: '400', height: '250' },
  { label: 'Kontor', width: '600', height: '270' },
]

export function Calculator({ id = 'kalkylator' }: { id?: string }) {
  const panels = acousticProducts()
  const [handle, setHandle] = useState(panels.find((item) => item.handle.includes('ljus-ek'))?.handle ?? panels[0]?.handle ?? '')
  const [width, setWidth] = useState('320')
  const [height, setHeight] = useState('240')
  const [orientation, setOrientation] = useState<Orientation>('staende')

  const product = panels.find((item) => item.handle === handle) ?? panels[0]
  const result = compute(width, height, orientation, product?.variants[0]?.price ?? 0)

  if (!product) return null

  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[0.18em] text-copper uppercase">Kalkylator</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Akustikvägg</h2>
          <p className="mt-2 max-w-xl text-mist">
            Räkna hur många paneler 240 × 60 cm som täcker väggen. Måttet står i produktnamnen, priset kommer från
            varusmart.se.
          </p>
        </div>
      </div>
      <div className="glass grid min-w-0 gap-6 rounded-[28px] p-4 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form className="grid min-w-0 gap-4" onSubmit={(event) => event.preventDefault()}>
          <label className="grid min-w-0 gap-2 text-sm">
            <span className="text-mist">Panel</span>
            <select
              value={product.handle}
              onChange={(event) => setHandle(event.target.value)}
              className="w-full min-w-0 rounded-2xl border border-white/10 bg-ink px-3 py-3 text-paper"
            >
              {panels.map((item) => (
                <option key={item.handle} value={item.handle}>
                  {item.title} · {priceLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <div className="grid min-w-0 grid-cols-2 gap-3">
            <NumberField label="Bredd (cm)" value={width} onChange={setWidth} />
            <NumberField label="Höjd (cm)" value={height} onChange={setHeight} />
          </div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setWidth(preset.width)
                  setHeight(preset.height)
                }}
                className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-mist transition hover:border-copper/50 hover:text-paper"
              >
                {preset.label} {preset.width}×{preset.height}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-2xl bg-black/30 p-1">
            <Toggle active={orientation === 'staende'} onClick={() => setOrientation('staende')} label="Stående" hint="60 × 240 cm" />
            <Toggle active={orientation === 'liggande'} onClick={() => setOrientation('liggande')} label="Liggande" hint="240 × 60 cm" />
          </div>
          <p className="text-sm leading-relaxed text-mist">
            Avrundas uppåt till hela paneler. Fönster, dörrar och kapspill i hörnen räknas inte bort.
          </p>
        </form>
        <div className="rounded-3xl border border-white/10 bg-black/30 p-4 sm:p-5">
          {result.ok === false ? (
            <p className="text-mist">{result.message}</p>
          ) : (
            <div className="grid gap-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs tracking-[0.16em] text-cyan uppercase">Paneler</p>
                  <p className="font-display text-5xl font-bold">{result.panels}</p>
                </div>
                <p className="text-right text-sm text-mist">
                  {result.cols} × {result.rows}
                  <span className="mt-1 block text-paper">{formatKr(result.cost)}</span>
                </p>
              </div>
              <WallPreview
                cols={result.cols}
                rows={result.rows}
                src={product.images[0]?.src}
                alt={product.title}
                ratio={Number(width) / Number(height)}
              />
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="Väggyta" value={`${formatM2(result.wallM2)} m²`} />
                <Stat label="Täckt yta" value={`${formatM2(result.coverM2)} m²`} />
                <Stat label="Spill" value={`${formatM2(result.wasteM2)} m²`} />
                <Stat label="Styckpris" value={formatKr(product.variants[0]?.price ?? 0)} />
              </dl>
              {product.shippingNote ? <p className="text-sm text-mist">{product.shippingNote}.</p> : null}
              <div className="flex flex-wrap gap-3">
                <Link
                  to={`/produkt/${encodeURIComponent(product.handle)}`}
                  className="rounded-full bg-paper px-4 py-2.5 text-sm font-semibold text-ink"
                >
                  Visa panelen
                </Link>
                <a href={product.url} target="_blank" rel="noreferrer" className="rounded-full border border-white/15 px-4 py-2.5 text-sm">
                  Öppna på varusmart.se
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function NumberField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid min-w-0 gap-2 text-sm">
      <span className="text-mist">{label}</span>
      <input
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full min-w-0 rounded-2xl border border-white/10 bg-ink px-3 py-3 text-paper"
      />
    </label>
  )
}

function Toggle({ active, onClick, label, hint }: { active: boolean; onClick: () => void; label: string; hint: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl px-3 py-2 text-left text-sm ${active ? 'bg-copper text-ink' : 'text-mist'}`}
    >
      <span className="block font-semibold">{label}</span>
      <span className={`block text-xs ${active ? 'text-ink/70' : 'text-mist'}`}>{hint}</span>
    </button>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 px-3 py-2">
      <dt className="text-xs tracking-wide text-mist uppercase">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}

function WallPreview({
  cols,
  rows,
  src,
  alt,
  ratio,
}: {
  cols: number
  rows: number
  src?: string
  alt: string
  ratio: number
}) {
  const tooMany = cols * rows > 80
  const safeRatio = Number.isFinite(ratio) && ratio > 0 ? Math.min(Math.max(ratio, 0.35), 2.8) : 1
  if (tooMany || !src) {
    return <p className="text-sm text-mist">Förhandsvisningen visas för väggar upp till 80 paneler.</p>
  }
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-ink" style={{ aspectRatio: safeRatio }}>
      <div
        className="grid h-full w-full"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
      >
        {Array.from({ length: cols * rows }, (_, index) => (
          <div
            key={index}
            role="img"
            aria-label={index === 0 ? alt : undefined}
            className="border border-black/40 bg-cover bg-center"
            style={{ backgroundImage: `url("${shopifyWidth(src, 480)}")` }}
          />
        ))}
      </div>
    </div>
  )
}

function formatM2(value: number): string {
  return new Intl.NumberFormat('sv-SE', { maximumFractionDigits: 2, minimumFractionDigits: 1 }).format(value)
}

type Result =
  | { ok: false; message: string }
  | { ok: true; panels: number; cols: number; rows: number; wallM2: number; coverM2: number; wasteM2: number; cost: number }

function compute(widthRaw: string, heightRaw: string, orientation: Orientation, unitPrice: number): Result {
  const width = parseSwedish(widthRaw)
  const height = parseSwedish(heightRaw)
  if (width == null || height == null) {
    return { ok: false, message: 'Ange bredd och höjd i centimeter, till exempel 320 och 240.' }
  }
  if (width <= 0 || height <= 0) {
    return { ok: false, message: 'Måtten behöver vara större än noll.' }
  }
  if (width > 3000 || height > 3000) {
    return { ok: false, message: 'Kalkylatorn räknar väggar upp till 30 meter. Dela upp större ytor.' }
  }
  const coverW = orientation === 'staende' ? PANEL_WIDTH : PANEL_HEIGHT
  const coverH = orientation === 'staende' ? PANEL_HEIGHT : PANEL_WIDTH
  const cols = Math.ceil(width / coverW)
  const rows = Math.ceil(height / coverH)
  const panels = cols * rows
  const wallM2 = (width * height) / 10_000
  const coverM2 = panels * PANEL_AREA
  return {
    ok: true,
    panels,
    cols,
    rows,
    wallM2,
    coverM2,
    wasteM2: Math.max(0, coverM2 - wallM2),
    cost: panels * unitPrice,
  }
}

function parseSwedish(value: string): number | null {
  const cleaned = value.trim().replace(/\s/g, '').replace(',', '.')
  if (!cleaned) return null
  const number = Number(cleaned)
  return Number.isFinite(number) ? number : null
}
