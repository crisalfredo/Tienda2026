import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { ScrollManager } from './ScrollManager'
import { WhatsAppFab } from './WhatsAppFab'

export function Layout() {
  return (
    <div className="min-h-screen bg-[#f8f7fb] text-zinc-950">
      <ScrollManager />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFab />
    </div>
  )
}
