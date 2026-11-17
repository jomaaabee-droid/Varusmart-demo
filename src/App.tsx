import { useEffect } from 'react'
import { HashRouter, Link, Route, Routes, useLocation } from 'react-router'
import { About } from './components/About'
import { Calculator } from './components/Calculator'
import { Footer, MobileNav, Nav } from './components/Chrome'
import { Home } from './pages/Home'
import { ProductPage } from './pages/ProductPage'
import { ProductsPage } from './pages/ProductsPage'

export default function App() {
  return (
    <HashRouter>
      <ScrollReset />
      <div className="min-h-svh">
        <button
          type="button"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-full focus:bg-paper focus:px-3 focus:py-2 focus:text-ink"
          onClick={() => document.getElementById('innehall')?.focus()}
        >
          Hoppa till innehåll
        </button>
        <Nav />
        <main id="innehall" tabIndex={-1} className="pb-28 md:pb-0 outline-none">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/produkter" element={<ProductsPage />} />
            <Route path="/produkt/:handle" element={<ProductPage />} />
            <Route path="/kalkylator" element={<CalculatorPage />} />
            <Route path="/om" element={<AboutPage />} />
            <Route path="*" element={<Missing />} />
          </Routes>
        </main>
        <Footer />
        <MobileNav />
      </div>
    </HashRouter>
  )
}

function ScrollReset() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) return
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function CalculatorPage() {
  useEffect(() => {
    document.title = 'Akustikkalkylator — VaruSmart Demo'
  }, [])
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Calculator id="kalkylator-sida" />
    </div>
  )
}

function AboutPage() {
  useEffect(() => {
    document.title = 'Om oss — VaruSmart Demo'
  }, [])
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <About />
    </div>
  )
}

function Missing() {
  useEffect(() => {
    document.title = 'Sidan finns inte — VaruSmart Demo'
  }, [])
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Sidan finns inte</h1>
      <p className="mt-3 text-mist">Gå tillbaka till startsidan och fortsätt i sortimentet.</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-paper px-4 py-2.5 text-sm font-semibold text-ink">
        Till startsidan
      </Link>
    </div>
  )
}
