import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

export function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#f8f7fb] text-zinc-950">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
