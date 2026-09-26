import { ArrowLeft, CheckCircle2, MessageCircle } from 'lucide-react'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { publicApi } from '../services/api'
import type { DeliveryForm } from '../types'
import { formatCurrency } from '../utils/currency'

const departments = [
  'Ahuachapán',
  'Cabañas',
  'Chalatenango',
  'Cuscatlán',
  'La Libertad',
  'La Paz',
  'La Unión',
  'Morazán',
  'San Miguel',
  'San Salvador',
  'San Vicente',
  'Santa Ana',
  'Sonsonate',
  'Usulután',
]

const initialForm: DeliveryForm = {
  name: '',
  phone: '',
  department: '',
  municipality: '',
  address: '',
  reference: '',
  paymentMethod: 'Efectivo al recibir',
  notes: '',
}

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const [form, setForm] = useState<DeliveryForm>(initialForm)
  const [accepted, setAccepted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (items.length === 0) return <Navigate to="/carrito" replace />

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!accepted || submitting) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await publicApi.createOrder(
        form,
        items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      )
      clearCart()
      window.location.assign(result.whatsappUrl)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No pudimos preparar la orden.')
      setSubmitting(false)
    }
  }

  const fieldClass =
    'mt-2 min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100'

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <Link to="/carrito" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-violet-700"><ArrowLeft size={17} /> Volver al carrito</Link>
      <div className="mt-7">
        <p className="text-xs font-extrabold tracking-[.12em] text-violet-700">ÚLTIMO PASO</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Datos de entrega</h1>
        <p className="mt-4 max-w-2xl text-zinc-500">Completa la información. Prepararemos el mensaje con tu pedido para enviarlo por WhatsApp.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_390px]">
        <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="font-bold text-zinc-800 sm:col-span-2">
              Nombre completo
              <input className={fieldClass} name="name" value={form.name} onChange={handleChange} autoComplete="name" placeholder="Tu nombre y apellido" required />
            </label>
            <label className="font-bold text-zinc-800 sm:col-span-2">
              Teléfono
              <input className={fieldClass} name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" inputMode="tel" placeholder="Ejemplo: 7000-0000" required />
            </label>
            <label className="font-bold text-zinc-800">
              Departamento
              <select className={fieldClass} name="department" value={form.department} onChange={handleChange} required>
                <option value="">Selecciona</option>
                {departments.map((department) => <option key={department} value={department}>{department}</option>)}
              </select>
            </label>
            <label className="font-bold text-zinc-800">
              Municipio o distrito
              <input className={fieldClass} name="municipality" value={form.municipality} onChange={handleChange} placeholder="Tu municipio" required />
            </label>
            <label className="font-bold text-zinc-800 sm:col-span-2">
              Dirección de entrega
              <textarea className={`${fieldClass} min-h-28 py-3`} name="address" value={form.address} onChange={handleChange} placeholder="Colonia, calle, número de casa..." required />
            </label>
            <label className="font-bold text-zinc-800 sm:col-span-2">
              Punto de referencia <span className="font-normal text-zinc-400">(opcional)</span>
              <input className={fieldClass} name="reference" value={form.reference} onChange={handleChange} placeholder="Frente a, cerca de..." />
            </label>
            <label className="font-bold text-zinc-800 sm:col-span-2">
              Forma de pago
              <select className={fieldClass} name="paymentMethod" value={form.paymentMethod} onChange={handleChange} required>
                <option>Efectivo al recibir</option>
                <option>Transferencia bancaria</option>
                <option>Coordinar por WhatsApp</option>
              </select>
            </label>
            <label className="font-bold text-zinc-800 sm:col-span-2">
              Notas del pedido <span className="font-normal text-zinc-400">(opcional)</span>
              <textarea className={`${fieldClass} min-h-24 py-3`} name="notes" value={form.notes} onChange={handleChange} placeholder="Horario preferido u otra indicación" />
            </label>
          </div>

          <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl bg-violet-50 p-4 text-sm leading-6 text-zinc-700">
            <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} className="mt-1 size-5 accent-violet-700" required />
            <span>Confirmo que los datos ingresados son correctos. El pedido quedará pendiente hasta recibir la confirmación por WhatsApp.</span>
          </label>
        </div>

        <aside className="rounded-3xl bg-zinc-950 p-6 text-white lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-extrabold">Tu pedido</h2>
          <div className="mt-6 grid gap-4">
            {items.map((item) => (
              <div key={item.cartId} className="flex gap-3 border-b border-zinc-800 pb-4">
                <img
                  src={item.image || item.product.image}
                  alt=""
                  className="size-16 rounded-xl border border-zinc-800 bg-white object-contain p-1"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{item.product.name}</p>
                  {Object.keys(item.selectedOptions).length > 0 && (
                    <p className="mt-1 truncate text-xs text-zinc-400">
                      {Object.entries(item.selectedOptions)
                        .map(([name, value]) => `${name}: ${value}`)
                        .join(' · ')}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-zinc-400">Cantidad: {item.quantity}</p>
                </div>
                <span className="font-bold">{formatCurrency(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between"><span>Subtotal</span><strong className="font-display text-2xl">{formatCurrency(subtotal)}</strong></div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">El envío se calcula y confirma según la dirección indicada.</p>
          {submitError && <p role="alert" className="mt-5 rounded-2xl bg-red-950/60 p-4 text-sm text-red-100">{submitError}</p>}
          <button type="submit" className="mt-7 flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#1fa855] px-5 font-bold text-white transition hover:bg-[#187f42] disabled:cursor-not-allowed disabled:opacity-50" disabled={!accepted || submitting}>
            <MessageCircle size={20} /> {submitting ? 'Preparando orden...' : 'Enviar orden por WhatsApp'}
          </button>
          <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-zinc-400"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-400" /> Revisarás el mensaje antes de enviarlo.</div>
        </aside>
      </form>
    </section>
  )
}

