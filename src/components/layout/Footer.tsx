import { MapPin, MessageCircle, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { buildGeneralHelpMessage, createWhatsAppUrl } from '../../utils/whatsapp'

export function Footer() {
  const { categories } = useCatalog()
  const whatsappUrl = createWhatsAppUrl(buildGeneralHelpMessage())

  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link
            to="/"
            className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight text-white"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-600 to-violet-800 text-sm text-white shadow-lg shadow-violet-700/25">
              U
            </span>
            URBANO<span className="-ml-2 text-violet-400">SV</span>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
            Tecnología, moda, perfumes y accesorios con una compra sencilla que confirmas por WhatsApp.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#1fa855] px-5 text-sm font-bold text-white transition hover:bg-[#187f42] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/40"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Escríbenos por WhatsApp
          </a>
        </div>

        <nav aria-label="Categorías">
          <h2 className="font-bold text-white">Categorías</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categoria/${category.slug}`}
                className="w-fit text-zinc-400 transition hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </nav>

        <nav aria-label="Tu compra">
          <h2 className="font-bold text-white">Tu compra</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Link to="/carrito" className="w-fit text-zinc-400 transition hover:text-white">
              Carrito
            </Link>
            <Link to="/checkout" className="w-fit text-zinc-400 transition hover:text-white">
              Datos de entrega
            </Link>
            <Link to="/cuenta" className="w-fit text-zinc-400 transition hover:text-white">
              Mi cuenta
            </Link>
          </div>
        </nav>

        <div>
          <h2 className="font-bold text-white">Atención</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-400">
            <span className="flex items-center gap-2">
              <Truck size={16} className="shrink-0 text-violet-400" aria-hidden="true" />
              Envíos a todo El Salvador
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={16} className="shrink-0 text-violet-400" aria-hidden="true" />
              Lunes a sábado
            </span>
            <span className="flex items-center gap-2">
              <MessageCircle size={16} className="shrink-0 text-violet-400" aria-hidden="true" />
              Respuesta por WhatsApp
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-xs text-zinc-500 sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 UrbanoSV. Todos los derechos reservados.</span>
          <span>Hecho en El Salvador 🇸🇻</span>
        </div>
      </div>
    </footer>
  )
}
