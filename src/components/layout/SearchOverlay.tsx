import { Search, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useCatalog } from '../../context/CatalogContext'
import { formatCurrency } from '../../utils/currency'

const MAX_RESULTS = 8

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useCatalog()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Enfocar el campo y limpiar la búsqueda cada vez que se abre.
  useEffect(() => {
    if (!open) return
    setQuery('')
    const id = window.setTimeout(() => inputRef.current?.focus(), 60)

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.clearTimeout(id)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  const results = useMemo(() => {
    const term = normalize(query.trim())
    if (term.length < 2) return []
    return products
      .filter((product) => {
        const haystack = normalize(
          `${product.name} ${product.shortDescription} ${product.categorySlug}`,
        )
        return haystack.includes(term)
      })
      .slice(0, MAX_RESULTS)
  }, [products, query])

  if (!open) return null

  const showEmpty = query.trim().length >= 2 && results.length === 0

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar productos"
        className="absolute inset-x-0 top-0 mx-auto flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-b-3xl bg-white shadow-2xl sm:top-6 sm:rounded-3xl"
      >
        <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3.5">
          <Search size={20} className="shrink-0 text-zinc-400" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar productos..."
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-zinc-400"
            aria-label="Buscar productos"
          />
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-500 transition hover:bg-zinc-100"
            aria-label="Cerrar búsqueda"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {query.trim().length < 2 && (
            <p className="px-5 py-8 text-center text-sm text-zinc-400">
              Escribe al menos 2 letras para buscar.
            </p>
          )}

          {showEmpty && (
            <p className="px-5 py-8 text-center text-sm text-zinc-500">
              No encontramos productos para "{query.trim()}".
            </p>
          )}

          {results.length > 0 && (
            <ul className="divide-y divide-zinc-100">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/producto/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 px-4 py-3 transition hover:bg-zinc-50"
                  >
                    <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                      <img
                        src={product.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-contain p-1.5"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-zinc-900">{product.name}</span>
                      <span className="block truncate text-sm capitalize text-zinc-400">
                        {product.categorySlug}
                      </span>
                    </span>
                    <span className="shrink-0 font-display font-extrabold text-zinc-950">
                      {formatCurrency(product.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
