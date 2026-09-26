import { Eye, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader, OrderStatusBadge, inputClass } from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'
import type { Order, OrderStatus } from '../../types'
import { formatCurrency } from '../../utils/currency'

const filters: Array<{ value: '' | OrderStatus; label: string }> = [{ value: '', label: 'Todos' }, { value: 'AWAITING_CONFIRMATION', label: 'Por confirmar' }, { value: 'CONFIRMED', label: 'Confirmados' }, { value: 'PREPARING', label: 'Preparando' }, { value: 'SHIPPED', label: 'Enviados' }, { value: 'DELIVERED', label: 'Entregados' }, { value: 'CANCELLED', label: 'Cancelados' }]

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [status, setStatus] = useState<'' | OrderStatus>('')
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { adminApi.get<{ data: { orders: Order[] } }>(`/orders/admin${status ? `?status=${status}` : ''}`).then(({ data }) => setOrders(data.orders)).catch((err) => setError(err.message)) }, [status])
  const visible = orders.filter((order) => `${order.orderNumber} ${order.customerName} ${order.customerPhone}`.toLowerCase().includes(search.toLowerCase()))
  return <><AdminPageHeader eyebrow="VENTAS" title="Pedidos" description="Confirma pedidos, actualiza su progreso y consulta la información de entrega." /><div className="mb-5 flex flex-col gap-3 lg:flex-row"><div className="relative max-w-md flex-1"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /><input className={`${inputClass} pl-11`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar pedido o cliente" /></div><select className={`${inputClass} lg:w-52`} value={status} onChange={(event) => setStatus(event.target.value as '' | OrderStatus)}>{filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select></div>{error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}<div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-zinc-950 text-zinc-300"><tr><th className="px-5 py-4">Pedido</th><th className="px-5 py-4">Cliente</th><th className="px-5 py-4">Fecha</th><th className="px-5 py-4">Estado</th><th className="px-5 py-4 text-right">Total</th><th className="px-5 py-4 text-right">Ver</th></tr></thead><tbody>{visible.map((order) => <tr key={order.id} className="border-b border-zinc-100"><td className="px-5 py-4 font-bold">{order.orderNumber}</td><td className="px-5 py-4"><p className="font-semibold">{order.customerName}</p><p className="text-xs text-zinc-400">{order.customerPhone}</p></td><td className="px-5 py-4 text-zinc-500">{new Date(order.createdAt).toLocaleString('es-SV')}</td><td className="px-5 py-4"><OrderStatusBadge status={order.status} /></td><td className="px-5 py-4 text-right font-bold">{formatCurrency(order.total)}</td><td className="px-5 py-4 text-right"><Link to={`/admin/pedidos/${order.id}`} className="inline-grid size-10 place-items-center rounded-xl border border-zinc-200 hover:text-violet-700"><Eye size={17} /></Link></td></tr>)}</tbody></table></div>{visible.length === 0 && <p className="p-10 text-center text-zinc-500">No hay pedidos con este filtro.</p>}</div></>
}
