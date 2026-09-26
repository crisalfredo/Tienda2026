


    
  
import { Check, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/currency'
import {
  getDefaultVariant,
  getInitialOptions,
  getPrimaryImage,
} from '../../utils/ProductSelection'

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false)
  const { addItem } = useCart()
  const hasOptions = Boolean(product.options?.length)
  const defaultOptions = getInitialOptions(product)
  const defaultVariant = getDefaultVariant(product)
  const availableStock = defaultVariant?.stock ?? product.stock

  const addToCart = () => {
    addItem(product, {
      quantity: 1,
      selectedOptions: defaultOptions,
      variantId: defaultVariant?.id,
      image: getPrimaryImage(product, defaultOptions),
    })
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1600)
  }

  return (
    <article className="group flex h-full min-w-0 flex-col">
      <Link
        to={`/producto/${product.slug}`}
        className="relative block aspect-square overflow-hidden rounded-[1.4rem] border border-zinc-100 bg-white"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.03] sm:p-5"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-1 pt-4">
        <p className="text-xs font-bold uppercase tracking-[.12em] text-violet-700">
          {product.categorySlug}
        </p>
        <Link to={`/producto/${product.slug}`}>
          <h3 className="mt-1 line-clamp-2 min-h-14 text-lg font-bold leading-7 tracking-tight transition hover:text-violet-700">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 min-h-12 text-sm leading-6 text-zinc-500">
          {product.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
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
          {hasOptions ? (
            <Link
              to={`/producto/${product.slug}`}
              className="flex h-10 items-center gap-2 rounded-full bg-zinc-950 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
              aria-label={`Ver opciones de ${product.name}`}
            >
              <ShoppingBag size={16} />
              <span className="hidden sm:inline">Ver opciones</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={addToCart}
              disabled={availableStock < 1}
              className="flex h-10 items-center gap-2 rounded-full bg-zinc-950 px-4 text-xs font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              {added ? <Check size={16} /> : <ShoppingBag size={16} />}
              <span className="hidden sm:inline">
                {availableStock < 1 ? 'Agotado' : added ? 'Agregado' : 'Agregar'}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
