import {
  Boxes, ClipboardList, FolderTree, Gauge, History, LogOut, Menu, PackageSearch,
  Settings, ShieldCheck, ShoppingBag, Store, Users, X,
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

const nav = [
  { to: '/admin', label: 'Resumen', icon: Gauge, end: true },
  { to: '/admin/productos', label: 'Productos', icon: ShoppingBag },
  { to: '/admin/categorias', label: 'Categorías', icon: FolderTree },
  { to: '/admin/inventario', label: 'Inventario', icon: Boxes },
  { to: '/admin/pedidos', label: 'Pedidos', icon: ClipboardList },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
]

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAdminAuth()
  const navigate = useNavigate()
  const links = user?.role === 'SUPERADMIN'
    ? [...nav, { to: '/admin/administradores', label: 'Administradores', icon: Users }, { to: '/admin/auditoria', label: 'Auditoría', icon: History }]
    : nav

  const signOut = async () => {
    await logout()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-zinc-950">
      <button type="button" onClick={() => setOpen(true)} className="fixed left-4 top-4 z-30 grid size-11 place-items-center rounded-xl bg-zinc-950 text-white shadow-lg lg:hidden" aria-label="Abrir menú"><Menu size={20} /></button>
      {open && <button type="button" className="fixed inset-0 z-40 bg-zinc-950/55 lg:hidden" onClick={() => setOpen(false)} aria-label="Cerrar menú" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-zinc-950 p-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <NavLink to="/admin" className="flex items-center gap-3 font-display text-lg font-extrabold" onClick={() => setOpen(false)}>
            <span className="grid size-10 place-items-center rounded-xl bg-violet-600"><Store size={20} /></span>
            UrbanoSV Admin
          </NavLink>
          <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center lg:hidden" aria-label="Cerrar menú"><X size={20} /></button>
        </div>
        <nav className="mt-9 grid gap-1" aria-label="Administración">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-bold transition ${isActive ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={19} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-zinc-800 pt-5">
          <div className="flex items-center gap-3 px-2">
            <span className="grid size-10 place-items-center rounded-full bg-violet-100 font-bold text-violet-800">{user?.name.charAt(0).toUpperCase()}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold">{user?.name}</p><p className="text-xs text-zinc-500">{user?.role}</p></div>
          </div>
          <button type="button" onClick={() => void signOut()} className="mt-4 flex min-h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-300"><LogOut size={18} /> Cerrar sesión</button>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="flex min-h-20 items-center justify-end border-b border-zinc-200 bg-white px-5 sm:px-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-500"><ShieldCheck size={18} className="text-emerald-600" /> Sesión administrativa protegida</div>
        </header>
        <main className="p-4 pt-8 sm:p-8 lg:p-10"><Outlet /></main>
      </div>
    </div>
  )
}
