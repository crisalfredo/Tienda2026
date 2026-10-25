import { ArrowLeft } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { Pagination } from '../components/ui/Pagination'
import { useCatalog } from '../context/CatalogContext'

const PAGE_SIZE = 12

export function CategoryPage() {
  const { slug } = useParams()
  const { getCategoryBySlug, getProductsByCategory, loading } = useCatalog()
  const category = getCategoryBySlug(slug)

  // La página vive en la URL (?page=2) para que sobreviva al volver atrás.
  const [searchParams, setSearchParams] = useSearchParams()
  const gridTopRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const goBack = () => {
    // Si hay historial previo, volvemos ahí (conserva la posición de scroll);
    // si se entró directo con un link, caemos en las categorías.
    if (window.history.length > 1) navigate(-1)
    else navigate('/#categorias')
  }

  const categoryProducts = category ? getProductsByCategory(category.slug) : []
  const pageCount = Math.max(1, Math.ceil(categoryProducts.length / PAGE_SIZE))
  const requestedPage = Number(searchParams.get('page')) || 1
  const page = Math.min(Math.max(requestedPage, 1), pageCount)
  const visibleProducts = useMemo(
    () => categoryProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [categoryProducts, page],
  )

  const changePage = (next: number) => {
    setSearchParams(
      (params) => {
        if (next <= 1) params.delete('page')
        else params.set('page', String(next))
        return params
      },
      { replace: false },
    )
    // Salto instantáneo al inicio de la grilla, sin scroll visible.
    gridTopRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }

  if (loading) return <section className="mx-auto max-w-4xl px-4 py-24 text-center text-zinc-500">Cargando categoría...</section>

  if (!category) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">Categoría no encontrada</h1>
        <Link to="/#categorias" className="mt-6 inline-flex font-bold text-violet-700">Volver a categorías</Link>
      </section>
    )
  }

  const total = categoryProducts.length
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)
  const countLabel =
    pageCount > 1
      ? `Mostrando ${rangeStart}–${rangeEnd} de ${total} productos`
      : `${total} ${total === 1 ? 'producto disponible' : 'productos disponibles'}`

  return (
    <>
      <section className="relative isolate overflow-hidden bg-zinc-950 text-white">
        <img src={category.image ?? category.imageUrl} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-violet-950/50" />
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center gap-2 text-violet-200 transition hover:text-white"
            >
              <ArrowLeft size={17} /> Atrás
            </button>
            <span className="text-violet-300/40" aria-hidden="true">|</span>
            <Link to="/#categorias" className="inline-flex items-center gap-2 text-violet-200/80 transition hover:text-white">
              Todas las categorías
            </Link>
          </div>
          <p className="mt-8 text-xs font-extrabold tracking-[.12em] text-violet-300">CATEGORÍA</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">{category.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-300">{category.description}</p>
        </div>
      </section>

      <section ref={gridTopRef} className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-9 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-violet-700">{countLabel}</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight">Explora {category.name.toLowerCase()}</h2>
          </div>
        </div>
        <ProductGrid products={visibleProducts} />
        <Pagination page={page} pageCount={pageCount} onPageChange={changePage} />
      </section>
    </>
  )
}
