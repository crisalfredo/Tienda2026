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

    const saved = positions.current[key]
    if (navigationType === 'POP' && saved != null) {
      window.scrollTo({ top: saved, behavior: 'auto' })
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [pathname, hash, key, navigationType])

  return null
}
