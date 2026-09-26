import { ArrowRight, BellRing, Heart, PackageSearch, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

const futureFeatures = [
  { icon: PackageSearch, label: 'Historial de pedidos' },
  { icon: Heart, label: 'Productos favoritos' },
  { icon: BellRing, label: 'Novedades y promociones' },
]

export function AccountUnavailablePage() {
  return (
    <main className="min-h-[70vh] bg-[radial-gradient(circle_at_top_left,#ede9fe,transparent_35%)] px-4 py-16 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-violet-100 bg-white p-7 shadow-2xl shadow-violet-950/10 sm:p-12">
        <div className="grid gap-10 md:grid-cols-[1fr_260px] md:items-center">
          <div>
            <span className="grid size-14 place-items-center rounded-2xl bg-violet-700 text-white"><UserRound size={26} /></span>
            <p className="mt-7 text-xs font-extrabold tracking-[.12em] text-violet-700">PRÓXIMAMENTE</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Tu cuenta está en camino.</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-zinc-600">
              Estamos preparando una experiencia para consultar pedidos, guardar direcciones y recibir novedades. Mientras tanto, puedes comprar sin registrarte y confirmar todo por WhatsApp.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/#productos" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-violet-700 px-6 font-bold text-white hover:bg-violet-800">
                Explorar productos <ArrowRight size={18} />
              </Link>
              <Link to="/" className="inline-flex min-h-12 items-center justify-center rounded-full border border-zinc-200 px-6 font-bold hover:border-violet-300 hover:text-violet-700">Volver al inicio</Link>
            </div>
          </div>
          <div className="grid gap-3">
            {futureFeatures.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl bg-violet-50 p-4 text-sm font-bold text-violet-950">
                <Icon size={20} className="text-violet-700" /> {label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
