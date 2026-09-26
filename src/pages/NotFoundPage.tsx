import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-28 text-center">
      <p className="font-display text-7xl font-extrabold text-violet-200">404</p>
      <h1 className="mt-4 font-display text-4xl font-extrabold">Página no encontrada</h1>
      <p className="mt-4 text-zinc-500">La dirección que visitaste no existe o fue modificada.</p>
      <Link to="/" className="mt-8 inline-flex min-h-12 items-center rounded-full bg-violet-700 px-6 font-bold text-white">Volver al inicio</Link>
    </section>
  )
}
