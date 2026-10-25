import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { prefersReducedMotion } from '../../utils/scroll'

/**
 * Centraliza el scroll al navegar:
 * - Página nueva (PUSH/REPLACE): aparece arriba, sin animación.
 * - Volver atrás (POP): restaura la posición donde estabas.
 * - Link con ancla (#seccion): scroll suave hasta la sección.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()
  const positions = useRef<Record<string, number>>({})
  const lastPathname = useRef<string | null>(null)

  // Dejamos que nosotros manejemos la restauración, no el navegador.
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
  }, [])

  // Guardamos continuamente la posición de la vista actual.
  useEffect(() => {
    const remember = () => {
      positions.current[key] = window.scrollY
    }
    window.addEventListener('scroll', remember, { passive: true })
    return () => window.removeEventListener('scroll', remember)
  }, [key])

  useEffect(() => {
    const previousPathname = lastPathname.current
    lastPathname.current = pathname

    if (hash) {
      let frame = 0
      let attempts = 0
      const jump = () => {
        const el = document.getElementById(decodeURIComponent(hash.slice(1)))
        if (el) {
          el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
          return
        }
        // La sección puede no existir todavía si el contenido carga async.
        if (attempts++ < 20) frame = window.requestAnimationFrame(jump)
      }
      jump()
      return () => window.cancelAnimationFrame(frame)
    }

    // Volver atrás/adelante: restauramos la posición guardada.
    if (navigationType === 'POP') {
      window.scrollTo({ top: positions.current[key] ?? 0, behavior: 'auto' })
      return
    }

    // Mismo pathname, solo cambió el query (p. ej. ?page=2 en paginación):
    // no saltamos al tope; la vista maneja su propio scroll.
    if (previousPathname === pathname) return

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash, key, navigationType])

  return null
}
