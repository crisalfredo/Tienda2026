import { Check, Plus, ShoppingBag } from 'lucide-react'
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

  const onSale = Boolean(product.previousPrice && product.previousPrice > product.price)
  const discountPct = onSale
    ? Math.round((1 - product.price / (product.previousPrice as number)) * 100)
    : 0
  const lowStock = availableStock > 0 && availableStock <= 5

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
        className="relative block aspect-square overflow-hidden rounded-2xl border border-zinc-100 bg-gradient-to-b from-zinc-50 to-white transition duration-300 group-hover:border-zinc-200 group-hover:shadow-lg group-hover:shadow-zinc-900/5"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.06] sm:p-6"
        />

        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {onSale && (
            <span className="rounded-full bg-violet-700 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">
              -{discountPct}%
            </span>
          )}
          {product.badge && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-zinc-800 shadow-sm backdrop-blur">
              {product.badge}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-0.5 pt-4">
        <Link to={`/producto/${product.slug}`} className="min-w-0">
          <h3 className="line-clamp-2 min-h-11 text-[0.95rem] font-semibold leading-snug tracking-tight text-zinc-900 transition group-hover:text-violet-700 sm:min-h-12 sm:text-base">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-sm text-zinc-500 sm:line-clamp-2 sm:min-h-10">
          {product.shortDescription}
        </p>

        {lowStock && (
          <p className="mt-2 text-xs font-semibold text-amber-600">
            Últimas {availableStock} unidades
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-extrabold tracking-tight text-zinc-950 sm:text-xl">
                {formatCurrency(product.price)}
              </span>
              {onSale && (
                <span className="text-sm text-zinc-400 line-through">
                  {formatCurrency(product.previousPrice as number)}
                </span>
              )}
            </div>
          </div>

          {hasOptions ? (
            <Link
              to={`/producto/${product.slug}`}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-4 text-xs font-bold text-white transition hover:bg-violet-700"
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
              className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-zinc-950 px-4 text-xs font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              aria-label={`Agregar ${product.name} al carrito`}
            >
              {added ? <Check size={16} /> : <Plus size={16} />}
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
