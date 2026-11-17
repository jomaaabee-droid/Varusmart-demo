import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { catalog } from '../data/catalog'

const links = [
  { href: '/produkter', label: 'Sortiment', kind: 'route' as const },
  { href: '/#kategorier', label: 'Kategorier', kind: 'hash' as const, id: 'kategorier' },
  { href: '/kalkylator', label: 'Kalkylator', kind: 'route' as const },
  { href: '/om', label: 'Om oss', kind: 'route' as const },
]

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-copper/40 bg-copper/15 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-copper-2 uppercase ${className}`}
    >
      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-copper" />
      Demo
    </span>
  )
}

export function Nav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-copper/40 bg-copper/10 font-display text-sm font-bold text-copper-2">
            VS
          </span>
          <span className="leading-tight">
            <span className="block font-display text-sm font-bold tracking-wide">VARUSMART</span>
            <span className="block text-[11px] tracking-wide text-mist">CFW Trading AB</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-mist md:flex">
          {links.map((link) =>
            link.kind === 'route' ? (
              <NavLink
                key={link.href}
                to={link.href}
                className={({ isActive }) => (isActive ? 'text-paper' : 'transition hover:text-paper')}
              >
                {link.label}
              </NavLink>
            ) : (
              <HashLink key={link.href} id={link.id ?? ''} className="transition hover:text-paper">
                {link.label}
              </HashLink>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <DemoBadge className="hidden sm:inline-flex" />
          <a
            href={catalog.shop.site}
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full border border-white/15 px-3 py-1.5 text-sm text-paper transition hover:border-copper/50 sm:inline-flex"
          >
            varusmart.se
          </a>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 md:hidden"
            aria-expanded={open}
            aria-label={open ? 'Stäng menyn' : 'Öppna menyn'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Meny</span>
            <span className="flex w-4 flex-col gap-1">
              <span className="h-px bg-paper" />
              <span className="h-px bg-paper" />
              <span className="h-px bg-paper" />
            </span>
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-white/10 bg-ink/95 px-4 py-4 md:hidden">
          <div className="mb-3">
            <DemoBadge />
          </div>
          <div className="flex flex-col gap-1 text-lg">
            {links.map((link) =>
              link.kind === 'route' ? (
                <NavLink
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-2xl px-3 py-3 ${isActive && location.pathname === link.href ? 'bg-white/5 text-paper' : 'text-mist'}`
                  }
                >
                  {link.label}
                </NavLink>
              ) : (
                <HashLink
                  key={link.href}
                  id={link.id ?? ''}
                  className="rounded-2xl px-3 py-3 text-mist"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </HashLink>
              ),
            )}
            <a href={catalog.shop.site} target="_blank" rel="noreferrer" className="rounded-2xl px-3 py-3 text-copper-2">
              Öppna varusmart.se ↗
            </a>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export function HashLink({
  id,
  className,
  children,
  onClick,
}: {
  id: string
  className?: string
  children: string
  onClick?: () => void
}) {
  const navigate = useNavigate()
  const location = useLocation()
  return (
    <a
      href="#/"
      className={className}
      onClick={(event) => {
        event.preventDefault()
        onClick?.()
        if (location.pathname !== '/') {
          navigate('/', { state: { scrollTo: id } })
          return
        }
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }}
    >
      {children}
    </a>
  )
}

export function Footer() {
  const homeCategories = catalog.categories.filter((category) => category.home)
  return (
    <footer className="border-t border-white/10 bg-black/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-bold">VaruSmart</p>
          <p className="mt-2 text-sm leading-relaxed text-mist">
            Ett varumärke under {catalog.shop.legalName}. {catalog.shop.pitch}
          </p>
          <div className="mt-4">
            <DemoBadge />
          </div>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] text-copper uppercase">Sortiment</p>
          <ul className="mt-3 space-y-2 text-sm text-mist">
            {homeCategories.map((category) => (
              <li key={category.id}>
                <Link to={`/produkter?kategori=${category.id}`} className="hover:text-paper">
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] text-copper uppercase">Kontakt</p>
          <ul className="mt-3 space-y-2 text-sm text-mist">
            <li>
              <a href={`mailto:${catalog.shop.email}`} className="hover:text-paper">
                {catalog.shop.email}
              </a>
            </li>
            <li>
              <a href={catalog.shop.phoneHref} className="hover:text-paper">
                {catalog.shop.phone}
              </a>
            </li>
            <li>{catalog.shop.hours}</li>
            <li>{catalog.shop.companyAddress}</li>
            <li>{catalog.shop.warehouse}</li>
          </ul>
        </div>
        <div>
          <p className="text-xs tracking-[0.16em] text-copper uppercase">Om demon</p>
          <p className="mt-3 text-sm leading-relaxed text-mist">
            Designprototyp. Produkter, bilder och priser är hämtade från varusmart.se {catalog.fetchedAt}. Köp görs i
            den riktiga butiken.
          </p>
          <a href={catalog.shop.site} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-copper-2">
            Till varusmart.se ↗
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 pb-24 text-center text-xs text-mist md:pb-4">
        © {catalog.fetchedAt.slice(0, 4)} {catalog.shop.legalName} · {catalog.shop.shipsFrom}
      </div>
    </footer>
  )
}

export function MobileNav() {
  const items = [
    { to: '/', label: 'Hem', icon: HomeIcon },
    { to: '/produkter', label: 'Sortiment', icon: GridIcon },
    { to: '/kalkylator', label: 'Kalkyl', icon: CalcIcon },
    { to: '/om', label: 'Om oss', icon: PinIcon },
  ]
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/90 backdrop-blur-xl md:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))]">
        {items.map((item) => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] ${isActive ? 'text-copper-2' : 'text-mist'}`
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function CalcIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}
