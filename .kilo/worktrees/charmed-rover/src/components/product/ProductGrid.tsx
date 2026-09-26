import type { Product } from '../../types'
import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-3xl border border-zinc-200 bg-white px-6 py-16 text-center text-zinc-500">
        No encontramos productos en esta categoría.
      </div>
    )
  }

  return (
    <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
