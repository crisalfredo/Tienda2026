import { ArrowRight, MessageCircle, ShieldCheck, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductGrid } from '../components/product/ProductGrid'
import { ProductGridSkeleton } from '../components/product/ProductGridSkeleton'
import { useCatalog } from '../context/CatalogContext'

const benefits = [
  {
    icon: Truck,
    title: 'Entrega nacional',
    description: 'Coordinamos tu pedido en El Salvador.',
  },
  {
    icon: MessageCircle,
    title: 'Pedido sencillo',
    description: 'Confirma todos los detalles por WhatsApp.',
  },
  {
    icon: ShieldCheck,
    title: 'Atención cercana',
    description: 'Resolvemos tus dudas antes de comprar.',
  },
]

export function HomePage() {
  const { categories, products, loading, error, reload } = useCatalog()
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4)

  return (
    <>
      <section className="px-4 pb-8 pt-5 sm:px-6 sm:pt-10 lg:px-8">
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_18%_15%,#fff_0%,transparent_30%),linear-gradient(135deg,#f3edff_0%,#dfceff_58%,#c2a2f5_100%)] px-6 py-10 sm:px-10 lg:min-h-[35rem] lg:grid-cols-[1.03fr_.97fr] lg:px-16 lg:py-14">
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/70 px-4 py-2 text-sm font-semibold text-violet-800">
              <span className="size-2 rounded-full bg-violet-600" aria-hidden="true" />
              Envíos a todo El Salvador
            </span>
            <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.7rem,7vw,5.4rem)] font-extrabold leading-[.96] tracking-[-.065em]">
              Tu estilo y tecnología, <span className="text-violet-700">en un solo lugar.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
              Descubre productos seleccionados para tu día a día y confirma tu pedido directamente por WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#productos"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-violet-700 px-6 font-bold text-white shadow-xl shadow-violet-700/20 transition hover:-translate-y-0.5 hover:bg-violet-800"
              >
                Explorar productos <ArrowRight size={18} />
              </a>
              <a
                href="#categorias"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/80 bg-white/75 px-6 font-bold transition hover:bg-white"
              >
                Ver categorías
              </a>
            </div>
            <p className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600">
              <ShieldCheck size={16} className="text-violet-700" aria-hidden="true" />
              Paga al recibir según tu zona de entrega
            </p>
          </div>

          <div className="relative z-10 min-h-[22rem] lg:min-h-[28rem]">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1100&q=90"
              alt="Audífonos modernos"
              className="ml-auto h-[22rem] w-[78%] rounded-[6rem_1.5rem_6rem_1.5rem] border-[7px] border-white/70 object-cover shadow-2xl lg:h-[28rem]"
            />
            <img
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=85"
              alt="Perfume elegante"
              className="absolute bottom-0 left-0 aspect-square w-[42%] rounded-3xl border-[6px] border-white object-cover shadow-2xl"
            />
            <div className="absolute left-1 top-3 grid size-24 -rotate-[8deg] place-items-center rounded-full bg-zinc-950 text-center text-[0.7rem] font-bold uppercase leading-tight tracking-wide text-white shadow-xl ring-4 ring-white/40 sm:size-28">
              <span className="flex flex-col">
                <span>Hasta</span>
                <strong className="font-display text-2xl tracking-tight">20%</strong>
                <span>menos</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-6 sm:px-6 lg:px-8" aria-label="Beneficios">
        <div className="mx-auto grid max-w-7xl rounded-3xl border border-zinc-200 bg-white p-3 shadow-sm md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, description }, index) => (
            <article
              key={title}
              className={`flex items-center gap-4 px-5 py-4 ${index > 0 ? 'border-t border-zinc-200 md:border-l md:border-t-0' : ''}`}
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
                <Icon size={22} />
              </span>
              <div>
                <h2 className="font-bold">{title}</h2>
                <p className="mt-1 text-sm text-zinc-500">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Compra por categoría</h2>
            <p className="mt-3 text-base leading-7 text-zinc-500">
              {categories.length > 0
                ? `Explora nuestras ${categories.length} categorías y encuentra justo lo que buscas.`
                : 'Explora nuestras categorías y encuentra justo lo que buscas.'}
            </p>
          </div>
          <a href="#productos" className="flex items-center gap-2 font-bold text-violet-700 hover:text-violet-800">
            Ver destacados <ArrowRight size={18} />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categoria/${category.slug}`}
              className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-[1.5rem] bg-zinc-900 shadow-lg ring-1 ring-zinc-900/5 transition duration-300 hover:shadow-xl hover:ring-violet-300 sm:aspect-[4/5]"
            >
              <img
                src={category.image ?? category.imageUrl}
                alt=""
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/35 to-transparent" />

              <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition duration-300 group-hover:bg-white group-hover:text-zinc-950 sm:right-4 sm:top-4">
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:-rotate-45" />
              </span>

              <div className="relative p-4 text-white sm:p-6">
                {category._count?.products != null && (
                  <span className="mb-2 inline-flex rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
                    {category._count.products} productos
                  </span>
                )}
                <h3 className="text-lg font-bold leading-tight sm:text-2xl">{category.name}</h3>
                <p className="mt-1 hidden text-sm leading-6 text-white/75 sm:block">{category.description}</p>
                <span className="mt-3 hidden translate-y-1 items-center gap-1.5 text-sm font-bold text-white opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:inline-flex">
                  Ver productos
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="productos" className="bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-9 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-5xl">Productos destacados</h2>
              <p className="mt-3 text-base leading-7 text-zinc-500">
                Una selección de lo más buscado, lista para pedir por WhatsApp.
              </p>
            </div>
            <Link to="/categoria/tecnologia" className="flex items-center gap-2 font-bold text-violet-700 hover:text-violet-800">
              Explorar catálogo <ArrowRight size={18} />
            </Link>
          </div>
          {error && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              <span>{error}</span>
              <button type="button" onClick={() => void reload()} className="font-bold underline">Reintentar</button>
            </div>
          )}
          {loading ? <ProductGridSkeleton /> : <ProductGrid products={featuredProducts} />}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col items-start justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-zinc-950 via-[#35194f] to-violet-700 px-7 py-10 text-white shadow-2xl sm:px-12 lg:flex-row lg:items-center lg:px-16 lg:py-14">
          <div>
            <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Elige tus productos y confirma todo por WhatsApp.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-violet-100/80">
              Arma tu carrito, envíanos el pedido y coordinamos la entrega al instante.
            </p>
          </div>
          <Link
            to="/carrito"
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-white px-6 font-bold text-violet-800 transition hover:-translate-y-0.5"
          >
            Ver mi carrito <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  )
}
