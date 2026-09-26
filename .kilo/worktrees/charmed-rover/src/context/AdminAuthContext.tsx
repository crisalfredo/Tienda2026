import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { adminApi } from '../services/api'
import type { AdminUser } from '../types'

interface AdminAuthValue {
  user: AdminUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthValue | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      try {
        setUser(await adminApi.me())
      } catch {
        try { setUser(await adminApi.refresh()) } catch { setUser(null) }
      } finally { setLoading(false) }
    }
    void restore()
  }, [])

  const value = useMemo<AdminAuthValue>(() => ({
    user,
    loading,
    async login(email, password) { setUser(await adminApi.login(email, password)) },
    async logout() { try { await adminApi.logout() } finally { setUser(null) } },
  }), [user, loading])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const value = useContext(AdminAuthContext)
  if (!value) throw new Error('useAdminAuth debe utilizarse dentro de AdminAuthProvider')
  return value
}
