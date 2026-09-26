import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { useCatalog } from '../context/CatalogContext'

export function CategoryPage() {
  const { slug } = useParams()
  const { getCategoryBySlug, getProductsByCategory, loading } = useCatalog()
  const category = getCategoryBySlug(slug)

  if (loading) return <section className="mx-auto max-w-4xl px-4 py-24 text-center text-zinc-500">Cargando categoría...</section>

  if (!category) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">Categoría no encontrada</h1>
        <Link to="/" className="mt-6 inline-flex font-bold text-violet-700">Volver al inicio</Link>
      </section>
    )
  }

  const categoryProducts = getProductsByCategory(category.slug)

  return (
    <>
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <img src={category.image ?? category.imageUrl} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-violet-950/50" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-violet-200 hover:text-white">
            <ArrowLeft size={17} /> Inicio
          </Link>
          <p className="mt-8 text-xs font-extrabold tracking-[.12em] text-violet-300">CATEGORÍA</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">{category.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300">{category.description}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-violet-700">{categoryProducts.length} productos disponibles</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Explora {category.name.toLowerCase()}</h2>
          </div>
        </div>
        <ProductGrid products={categoryProducts} />
      </section>
    </>
  )
}
