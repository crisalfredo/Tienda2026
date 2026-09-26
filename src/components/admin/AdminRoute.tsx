import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'

export function AdminRoute() {
  const { user, loading } = useAdminAuth()
  const location = useLocation()

  if (loading) return <main className="grid min-h-screen place-items-center bg-zinc-950 text-white">Verificando sesión...</main>
  if (!user) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
