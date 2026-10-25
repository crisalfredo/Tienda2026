import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

/** Lista de páginas con elipsis: 1 … 4 5 6 … 20 */
function buildPageList(page: number, pageCount: number): Array<number | 'gap'> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const shown = new Set<number>([1, pageCount, page, page - 1, page + 1])
  const ordered = [...shown].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b)

  const result: Array<number | 'gap'> = []
  let previous = 0
  for (const value of ordered) {
    if (value - previous > 1) result.push('gap')
    result.push(value)
    previous = value
  }
  return result
}

const cell = 'grid size-11 place-items-center rounded-full text-sm'

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) return null

  const pages = buildPageList(page, pageCount)
  const go = (next: number) => onPageChange(Math.min(Math.max(next, 1), pageCount))

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Paginación de productos">
      <button
        type="button"
        onClick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className={`${cell} border border-zinc-200 bg-white text-zinc-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-700`}
      >
        <ChevronLeft size={18} />
      </button>

      {pages.map((value, index) =>
        value === 'gap' ? (
          <span key={`gap-${index}`} className={`${cell} text-zinc-400`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={value}
            type="button"
            onClick={() => go(value)}
            aria-current={value === page ? 'page' : undefined}
            aria-label={`Página ${value}`}
            className={
              value === page
                ? `${cell} bg-violet-700 font-bold text-white shadow-lg shadow-violet-700/25`
                : `${cell} border border-zinc-200 bg-white font-semibold text-zinc-700 transition hover:border-violet-300 hover:text-violet-700`
            }
          >
            {value}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => go(page + 1)}
        disabled={page === pageCount}
        aria-label="Página siguiente"
        className={`${cell} border border-zinc-200 bg-white text-zinc-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200 disabled:hover:text-zinc-700`}
      >
        <ChevronRight size={18} />
      </button>
    </nav>
  )
}
