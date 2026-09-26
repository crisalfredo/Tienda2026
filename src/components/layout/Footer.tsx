import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'

export function Footer() {
  const { categories } = useCatalog()
  return (
    <footer className="bg-zinc-950 text-zinc-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="font-display text-xl font-extrabold text-white">
            URBANO<span className="text-violet-400">SV</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
            Tecnología, moda, perfumes y accesorios con una experiencia de compra sencilla.
          </p>
        </div>

        <div>
          <h2 className="font-bold text-white">Categorías</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {categories.map((category) => (
              <Link key={category.id} to={`/categoria/${category.slug}`} className="hover:text-white">
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-bold text-white">Tu compra</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <Link to="/carrito" className="hover:text-white">Carrito</Link>
            <Link to="/checkout" className="hover:text-white">Datos de entrega</Link>
            <Link to="/cuenta" className="hover:text-white">Mi cuenta</Link>
            <span>Pedidos por WhatsApp</span>
          </div>
        </div>

        <div>
          <h2 className="font-bold text-white">Atención</h2>
          <div className="mt-4 grid gap-3 text-sm text-zinc-400">
            <span>Entregas en El Salvador</span>
            <span>Lunes a sábado</span>
            <span>Respuesta por WhatsApp</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 px-4 py-6 text-center text-xs text-zinc-500">
        © 2026 UrbanoSV. Todos los derechos reservados.
      </div>
    </footer>
  )
}
