import type { ReactNode } from 'react'
import type { OrderStatus } from '../../types'

export const inputClass = 'min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100'
export const primaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 text-sm font-bold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-50'
export const secondaryButton = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-50'

export function AdminPageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-extrabold tracking-[.12em] text-violet-700">{eyebrow}</p><h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>}</div>{action}</div>
}

export function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm ${className}`}>{children}</section>
}

const statusStyles: Record<OrderStatus, string> = {
  AWAITING_CONFIRMATION: 'bg-amber-100 text-amber-800', CONFIRMED: 'bg-blue-100 text-blue-800', PREPARING: 'bg-violet-100 text-violet-800', SHIPPED: 'bg-cyan-100 text-cyan-800', DELIVERED: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-red-100 text-red-800',
}
const statusLabels: Record<OrderStatus, string> = {
  AWAITING_CONFIRMATION: 'Por confirmar', CONFIRMED: 'Confirmado', PREPARING: 'Preparando', SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[status]}`}>{statusLabels[status]}</span>
}
