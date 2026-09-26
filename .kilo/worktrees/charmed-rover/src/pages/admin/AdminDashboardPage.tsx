import { AlertTriangle, Boxes, FolderTree, Plus, Receipt, ShoppingBag, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader, OrderStatusBadge, Panel, primaryButton } from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'
import type { Order } from '../../types'
import { formatCurrency } from '../../utils/currency'

interface DashboardData {
  metrics: { products: number; categories: number; pendingOrders: number; lowStock: number; confirmedSales: number }
  recentOrders: Order[]
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { adminApi.get<{ data: DashboardData }>('/admin/dashboard').then((result) => setData(result.data)).catch((err) => setError(err.message)) }, [])
  const cards = data ? [
    ['Productos activos', data.metrics.products, ShoppingBag, 'text-violet-700 bg-violet-100'],
    ['Categorías', data.metrics.categories, FolderTree, 'text-blue-700 bg-blue-100'],
    ['Pedidos pendientes', data.metrics.pendingOrders, Receipt, 'text-amber-700 bg-amber-100'],
    ['Stock bajo', data.metrics.lowStock, AlertTriangle, 'text-red-700 bg-red-100'],
  ] as const : []

  return <>
    <AdminPageHeader eyebrow="CENTRO DE CONTROL" title="Resumen de la tienda" description="Productos, inventario y pedidos que requieren tu atención." action={<Link to="/admin/productos/nuevo" className={primaryButton}><Plus size={18} /> Nuevo producto</Link>} />
    {error && <p className="mb-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, style]) => <Panel key={label}><div className="flex items-center justify-between"><span className={`grid size-11 place-items-center rounded-xl ${style}`}><Icon size={21} /></span><TrendingUp size={18} className="text-zinc-300" /></div><p className="mt-5 text-sm font-semibold text-zinc-500">{label}</p><p className="mt-1 font-display text-3xl font-extrabold">{value}</p></Panel>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
      <Panel><div className="flex items-center justify-between"><h2 className="font-display text-xl font-extrabold">Pedidos recientes</h2><Link to="/admin/pedidos" className="text-sm font-bold text-violet-700">Ver todos</Link></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-400"><tr><th className="pb-3">Pedido</th><th className="pb-3">Cliente</th><th className="pb-3">Estado</th><th className="pb-3 text-right">Total</th></tr></thead><tbody>{data?.recentOrders.map((order) => <tr key={order.id} className="border-b border-zinc-100"><td className="py-4 font-bold"><Link to={`/admin/pedidos/${order.id}`} className="hover:text-violet-700">{order.orderNumber}</Link></td><td className="py-4">{order.customerName}</td><td className="py-4"><OrderStatusBadge status={order.status} /></td><td className="py-4 text-right font-bold">{formatCurrency(order.total)}</td></tr>)}</tbody></table>{!data && !error && <p className="py-8 text-center text-zinc-400">Cargando...</p>}</div></Panel>
      <Panel><h2 className="font-display text-xl font-extrabold">Acciones rápidas</h2><div className="mt-5 grid gap-3"><Link to="/admin/inventario" className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 font-bold hover:bg-violet-50 hover:text-violet-700"><Boxes size={20} /> Revisar inventario</Link><Link to="/admin/categorias" className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4 font-bold hover:bg-violet-50 hover:text-violet-700"><FolderTree size={20} /> Administrar categorías</Link><div className="rounded-xl bg-zinc-950 p-5 text-white"><p className="text-sm text-zinc-400">Ventas confirmadas</p><p className="mt-2 font-display text-3xl font-extrabold">{formatCurrency(data?.metrics.confirmedSales ?? 0)}</p></div></div></Panel>
    </div>
  </>
}
