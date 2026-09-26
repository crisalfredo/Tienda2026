import { ArrowLeft, Check, Minus, Plus, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import type { SelectedOptions } from '../types'
import { formatCurrency } from '../utils/currency'

export function ProductDetailsPage() {
  const { slug } = useParams()
  const { getProductBySlug, products, loading } = useCatalog()
  const product = getProductBySlug(slug)
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({})
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!product) return
    setQuantity(1)
    setSelectedOptions(
      (product.options ?? []).reduce<SelectedOptions>((values, option) => {
        values[option.name] = option.values[0]
        return values
      }, {}),
    )
  }, [product])

  const selectedVariant = product
    ? (product.variants ?? []).find((variant) =>
        Object.entries(selectedOptions).every(([name, value]) => variant.values[name] === value),
      ) ?? (product.variants ?? []).find((variant) => variant.isDefault) ?? product.variants?.[0]
    : undefined

  useEffect(() => {
    if (selectedVariant) setQuantity((current) => Math.min(Math.max(1, current), Math.max(1, selectedVariant.stock)))
  }, [selectedVariant])

  if (loading) return <section className="mx-auto max-w-4xl px-4 py-24 text-center text-zinc-500">Cargando producto...</section>

  if (!product) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">Producto no encontrado</h1>
        <Link to="/" className="mt-6 inline-flex font-bold text-violet-700">Volver al inicio</Link>
      </section>
    )
  }

  const relatedProducts = products
    .filter((item) => item.categorySlug === product.categorySlug && item.id !== product.id)
    .slice(0, 4)

  const handleAdd = () => {
    addItem(product, quantity, selectedOptions)
    setAdded(true)
    window.setTimeout(() => setAdded(false), 1800)
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <Link
          to={`/categoria/${product.categorySlug}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-violet-700"
        >
          <ArrowLeft size={17} /> Volver a la categoría
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-[2rem] bg-zinc-100">
            <img src={product.images[0]} alt={product.name} className="aspect-square h-full w-full object-cover" />
          </div>

          <div className="flex flex-col justify-center">
            <p className="text-xs font-extrabold uppercase tracking-[.12em] text-violet-700">{product.categorySlug}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{product.name}</h1>
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold">{formatCurrency(selectedVariant?.price ?? product.price)}</span>
              {(selectedVariant?.previousPrice ?? product.previousPrice) && <span className="text-lg text-zinc-400 line-through">{formatCurrency((selectedVariant?.previousPrice ?? product.previousPrice)!)}</span>}
            </div>
            <p className="mt-6 text-base leading-7 text-zinc-600">{product.description}</p>

            {(product.options ?? []).map((option) => (
              <fieldset key={option.name} className="mt-7">
                <legend className="font-bold">{option.name}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {option.values.map((value) => {
                    const selected = selectedOptions[option.name] === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSelectedOptions((current) => ({ ...current, [option.name]: value }))}
                        className={`min-h-11 rounded-full border px-4 text-sm font-bold transition ${selected ? 'border-violet-700 bg-violet-700 text-white' : 'border-zinc-200 bg-white hover:border-violet-300'}`}
                        aria-pressed={selected}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </fieldset>
            ))}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-13 items-center justify-between rounded-full border border-zinc-200 bg-white px-2">
                <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-zinc-100" onClick={() => setQuantity((current) => Math.max(1, current - 1))} aria-label="Reducir cantidad"><Minus size={18} /></button>
                <span className="min-w-10 text-center font-bold">{quantity}</span>
                <button type="button" className="grid size-10 place-items-center rounded-full hover:bg-zinc-100" onClick={() => setQuantity((current) => Math.min(selectedVariant?.stock ?? product.stock, current + 1))} aria-label="Aumentar cantidad"><Plus size={18} /></button>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                disabled={(selectedVariant?.stock ?? product.stock) < 1}
                className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full bg-violet-700 px-6 font-bold text-white shadow-xl shadow-violet-700/20 transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                {added ? <Check size={20} /> : <ShoppingBag size={20} />}
                {(selectedVariant?.stock ?? product.stock) < 1 ? 'Agotado' : added ? 'Agregado al carrito' : 'Agregar al carrito'}
              </button>
            </div>

            <div className="mt-8 grid gap-3 border-t border-zinc-200 pt-7 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm text-zinc-600"><Truck size={20} className="text-violet-700" /> Entrega coordinada</div>
              <div className="flex items-center gap-3 text-sm text-zinc-600"><ShieldCheck size={20} className="text-violet-700" /> Atención personalizada</div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-9 font-display text-3xl font-extrabold tracking-tight">También puede interesarte</h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </section>
      )}
    </>
  )
}
