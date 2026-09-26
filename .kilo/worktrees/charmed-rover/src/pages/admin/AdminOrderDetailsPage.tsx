import { ArrowLeft, MessageCircle, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AdminPageHeader, OrderStatusBadge, Panel, inputClass, primaryButton } from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'
import type { Order, OrderStatus } from '../../types'
import { formatCurrency } from '../../utils/currency'

const statuses: OrderStatus[] = ['AWAITING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export function AdminOrderDetailsPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<OrderStatus>('AWAITING_CONFIRMATION')
  const [notes, setNotes] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const load = () => adminApi.get<{ data: { order: Order } }>(`/orders/admin/${id}`).then(({ data }) => { setOrder(data.order); setStatus(data.order.status); setNotes(data.order.adminNotes ?? '') }).catch((err) => setMessage(err.message))
  useEffect(() => { void load() }, [id])
  const save = async () => { try { await adminApi.mutate(`/orders/admin/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, adminNotes: notes }) }); setMessage('Pedido actualizado correctamente.'); load() } catch (err) { setMessage(err instanceof Error ? err.message : 'No se pudo actualizar.') } }
  if (!order) return <p className="py-20 text-center text-zinc-500">{message ?? 'Cargando pedido...'}</p>
  return <><Link to="/admin/pedidos" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-violet-700"><ArrowLeft size={17} /> Volver a pedidos</Link><AdminPageHeader eyebrow="PEDIDO" title={order.orderNumber} action={<OrderStatusBadge status={order.status} />} />
    {message && <p className="mb-5 rounded-xl bg-violet-50 p-4 text-sm text-violet-800">{message}</p>}
    <div className="grid items-start gap-6 xl:grid-cols-[1fr_380px]"><div className="grid gap-6"><Panel><h2 className="font-display text-xl font-extrabold">Productos</h2><div className="mt-5 grid gap-3">{order.items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4"><div><p className="font-bold">{item.productName}</p><p className="mt-1 text-sm text-zinc-500">{item.variantLabel || 'Estándar'} · SKU {item.sku}</p><p className="mt-1 text-sm">{item.quantity} x {formatCurrency(item.unitPrice)}</p></div><strong>{formatCurrency(item.lineTotal)}</strong></div>)}</div><div className="mt-5 flex justify-between text-lg"><span>Total</span><strong className="font-display text-2xl">{formatCurrency(order.total)}</strong></div></Panel><Panel><h2 className="font-display text-xl font-extrabold">Datos de entrega</h2><dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2"><div><dt className="text-zinc-400">Cliente</dt><dd className="mt-1 font-bold">{order.customerName}</dd></div><div><dt className="text-zinc-400">Teléfono</dt><dd className="mt-1 font-bold">{order.customerPhone}</dd></div><div><dt className="text-zinc-400">Departamento</dt><dd className="mt-1 font-bold">{order.department}</dd></div><div><dt className="text-zinc-400">Municipio</dt><dd className="mt-1 font-bold">{order.municipality}</dd></div><div className="sm:col-span-2"><dt className="text-zinc-400">Dirección</dt><dd className="mt-1 font-bold">{order.address}</dd></div><div className="sm:col-span-2"><dt className="text-zinc-400">Referencia</dt><dd className="mt-1">{order.reference || 'Sin referencia'}</dd></div><div><dt className="text-zinc-400">Forma de pago</dt><dd className="mt-1 font-bold">{order.paymentMethod}</dd></div><div><dt className="text-zinc-400">Notas</dt><dd className="mt-1">{order.notes || 'Sin notas'}</dd></div></dl></Panel></div>
    <Panel className="xl:sticky xl:top-8"><h2 className="font-display text-xl font-extrabold">Gestión</h2><label className="mt-5 block text-sm font-bold">Estado<select className={`${inputClass} mt-2`} value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>{statuses.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><label className="mt-5 block text-sm font-bold">Notas internas<textarea className={`${inputClass} mt-2 min-h-28 py-3`} value={notes} onChange={(event) => setNotes(event.target.value)} /></label><button type="button" onClick={() => void save()} className={`${primaryButton} mt-5 w-full`}><Save size={17} /> Guardar cambios</button><a href={`https://wa.me/${order.customerPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1fa855] px-4 text-sm font-bold text-white"><MessageCircle size={18} /> Abrir WhatsApp</a><p className="mt-4 text-xs leading-5 text-zinc-400">Al confirmar se descuenta inventario. Al cancelar antes de la entrega se repone automáticamente.</p></Panel></div>
  </>
}
