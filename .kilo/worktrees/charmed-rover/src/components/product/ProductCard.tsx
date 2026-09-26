import { Check, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { Product, SelectedOptions } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()

  const addToCart = () => {
    const defaultOptions = (product.options ?? []).reduce<SelectedOptions>(
      (options, option) => {
        options[option.name] = option.values[0]
        return options
      },
      {},
    )
    addItem(product, 1, defaultOptions)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article className="group min-w-0">
      <Link
        to={`/producto/${product.slug}`}
        className="relative block aspect-[4/4.7] overflow-hidden rounded-[1.4rem] bg-zinc-100"
      >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="px-1 pt-4">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-violet-700">
          {product.categorySlug}
        </p>
        <Link to={`/producto/${product.slug}`}>
          <h3 className="mt-1 text-lg font-bold tracking-tight transition hover:text-violet-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-500">
          {product.shortDescription}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl font-extrabold">
              {formatCurrency(product.price)}
            </span>
            {product.previousPrice && (
              <span className="text-sm text-zinc-400 line-through">
                {formatCurrency(product.previousPrice)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={addToCart}
            className="flex h-10 items-center gap-2 rounded-full bg-zinc-950 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            {added ? <Check size={16} /> : <ShoppingBag size={16} />}
            <span className="hidden sm:inline">{added ? 'Agregado' : 'Agregar'}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
