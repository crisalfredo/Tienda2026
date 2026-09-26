import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useCatalog } from '../../context/CatalogContext'

const baseLink =
  'text-sm font-semibold text-zinc-600 transition hover:text-violet-700'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { totalItems } = useCart()
  const { categories } = useCatalog()

  return (
    <>
      <div className="bg-zinc-950 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Envíos disponibles en El Salvador · Atención por WhatsApp
      </div>

      <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-17 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-19 lg:px-8">
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-zinc-200 text-zinc-800 lg:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 font-display text-xl font-extrabold tracking-tight"
            onClick={() => setMenuOpen(false)}
          >
            <span className="grid size-9 place-items-center rounded-xl bg-violet-700 text-sm text-white shadow-lg shadow-violet-700/20">
              U
            </span>
            <span>
              URBANO<span className="text-violet-700">SV</span>
            </span>
          </Link>

          <nav className="ml-8 hidden items-center gap-7 lg:flex" aria-label="Navegación principal">
            <NavLink to="/" className={baseLink}>
              Inicio
            </NavLink>
            {categories.map((category) => (
              <NavLink
                key={category.id}
                to={`/categoria/${category.slug}`}
                className={baseLink}
              >
                {category.name}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/cuenta"
              className="hidden h-11 items-center gap-2 rounded-full border border-zinc-200 px-3.5 font-semibold text-zinc-800 transition hover:border-violet-300 hover:text-violet-700 sm:flex"
            >
              <UserRound size={19} />
              <span className="hidden text-sm md:inline">Mi cuenta</span>
            </Link>
            <Link
              to="/#productos"
              className="hidden size-11 place-items-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-violet-300 hover:text-violet-700 sm:grid"
              aria-label="Buscar productos"
            >
              <Search size={20} />
            </Link>
            <Link
              to="/carrito"
              className="relative flex h-11 items-center gap-2 rounded-full border border-zinc-200 px-3.5 font-semibold text-zinc-800 transition hover:border-violet-300 hover:text-violet-700"
              aria-label={`Carrito con ${totalItems} productos`}
            >
              <ShoppingBag size={20} />
              <span className="hidden text-sm sm:inline">Carrito</span>
              <span className="grid min-w-5 place-items-center rounded-full bg-violet-700 px-1.5 py-0.5 text-[11px] text-white">
                {totalItems}
              </span>
            </Link>
          </div>
        </div>

        {menuOpen && (
          <nav
            className="border-t border-zinc-200 bg-white px-4 py-4 lg:hidden"
            aria-label="Navegación móvil"
          >
            <div className="mx-auto grid max-w-7xl gap-1">
              <NavLink
                to="/"
                className="rounded-xl px-4 py-3 font-semibold hover:bg-violet-50 hover:text-violet-700"
                onClick={() => setMenuOpen(false)}
              >
                Inicio
              </NavLink>
              <NavLink
                to="/cuenta"
                className="rounded-xl px-4 py-3 font-semibold hover:bg-violet-50 hover:text-violet-700"
                onClick={() => setMenuOpen(false)}
              >
                Mi cuenta
              </NavLink>
              {categories.map((category) => (
                <NavLink
                  key={category.id}
                  to={`/categoria/${category.slug}`}
                  className="rounded-xl px-4 py-3 font-semibold hover:bg-violet-50 hover:text-violet-700"
                  onClick={() => setMenuOpen(false)}
                >
                  {category.name}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>
    </>
  )
}
