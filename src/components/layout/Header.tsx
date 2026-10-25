import { Menu, Search, ShoppingBag, Truck, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useCatalog } from '../../context/CatalogContext'

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-sm text-white shadow-lg shadow-violet-700/25">
        U
      </span>
      <span>
        URBANO<span className="text-violet-700">SV</span>
      </span>
    </Link>
  )
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `relative py-1 text-sm font-semibold transition-colors ${
    isActive ? 'text-violet-700' : 'text-zinc-600 hover:text-zinc-950'
  }`
}

function ActiveUnderline({ isActive }: { isActive: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-violet-700 transition-transform duration-300 ${
        isActive ? 'scale-x-100' : 'scale-x-0'
      }`}
    />
  )
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { totalItems } = useCart()
  const { categories } = useCatalog()
  const { pathname } = useLocation()

  // Condensar el header al hacer scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Cerrar el drawer al navegar.
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Bloquear scroll del body y cerrar con Escape mientras el drawer está abierto.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  const cartBadge =
    totalItems > 0 ? (
      <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-violet-700 px-1 py-0.5 text-[11px] font-bold leading-none text-white ring-2 ring-white">
        {totalItems > 99 ? '99+' : totalItems}
      </span>
    ) : null

  return (
    <>
      <div className="flex items-center justify-center gap-2 bg-zinc-950 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        <Truck size={15} className="shrink-0 text-violet-300" aria-hidden="true" />
        <span>Envíos a todo El Salvador · atención por WhatsApp</span>
      </div>

      <header
        className={`sticky top-0 z-40 border-b bg-white/90 backdrop-blur-xl transition-all ${
          scrolled ? 'border-zinc-200/80 shadow-sm' : 'border-transparent'
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center gap-4 px-4 transition-all sm:px-6 lg:px-8 ${
            scrolled ? 'h-14 lg:h-16' : 'h-17 lg:h-20'
          }`}
        >
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-zinc-800 transition hover:bg-zinc-100 lg:hidden"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={22} />
          </button>

          <Logo />

          <nav className="ml-6 hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
            <NavLink to="/" end className={navLinkClass}>
              {({ isActive }) => (
                <>
                  Inicio
                  <ActiveUnderline isActive={isActive} />
                </>
              )}
            </NavLink>
            {categories.map((category) => (
              <NavLink key={category.id} to={`/categoria/${category.slug}`} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {category.name}
                    <ActiveUnderline isActive={isActive} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              to="/#productos"
              className="grid size-11 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-violet-700"
              aria-label="Buscar productos"
            >
              <Search size={20} />
            </Link>
            <Link
              to="/cuenta"
              className="hidden size-11 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-violet-700 sm:grid"
              aria-label="Mi cuenta"
            >
              <UserRound size={20} />
            </Link>
            <Link
              to="/carrito"
              className="relative flex h-11 items-center gap-2 rounded-full bg-zinc-950 pl-4 pr-4 font-semibold text-white transition hover:bg-violet-700"
              aria-label={`Carrito con ${totalItems} productos`}
            >
              <span className="relative">
                <ShoppingBag size={20} />
                {cartBadge}
              </span>
              <span className="hidden text-sm sm:inline">Carrito</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Drawer móvil */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${menuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-zinc-950/50 backdrop-blur-sm transition-opacity duration-300 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <nav
          className={`absolute inset-y-0 left-0 flex w-[84%] max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          aria-label="Navegación móvil"
        >
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <Logo onClick={() => setMenuOpen(false)} />
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full text-zinc-700 transition hover:bg-zinc-100"
              aria-label="Cerrar menú"
              onClick={() => setMenuOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-zinc-400">Explorar</p>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `block rounded-xl px-3 py-3 text-base font-semibold transition ${
                  isActive ? 'bg-violet-50 text-violet-700' : 'text-zinc-800 hover:bg-zinc-100'
                }`
              }
            >
              Inicio
            </NavLink>
            {categories.map((category) => (
              <NavLink
                key={category.id}
                to={`/categoria/${category.slug}`}
                className={({ isActive }) =>
                  `block rounded-xl px-3 py-3 text-base font-semibold transition ${
                    isActive ? 'bg-violet-50 text-violet-700' : 'text-zinc-800 hover:bg-zinc-100'
                  }`
                }
              >
                {category.name}
              </NavLink>
            ))}
          </div>

          <div className="border-t border-zinc-200 px-3 py-4">
            <Link
              to="/cuenta"
              className="flex items-center gap-3 rounded-xl px-3 py-3 font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              <UserRound size={20} /> Mi cuenta
            </Link>
            <Link
              to="/carrito"
              className="mt-1 flex items-center justify-between rounded-xl bg-zinc-950 px-4 py-3 font-semibold text-white transition hover:bg-violet-700"
            >
              <span className="flex items-center gap-3">
                <ShoppingBag size={20} /> Mi carrito
              </span>
              {totalItems > 0 && (
                <span className="grid min-w-6 place-items-center rounded-full bg-white/20 px-2 py-0.5 text-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </nav>
      </div>
    </>
  )
}
