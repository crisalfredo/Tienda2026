import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'

export function CartPage() {
  const { items, subtotal, removeItem, updateQuantity } = useCart()

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-violet-100 text-violet-700"><ShoppingBag size={34} /></span>
        <h1 className="mt-7 font-display text-4xl font-extrabold tracking-tight">Tu carrito está vacío</h1>
        <p className="mx-auto mt-4 max-w-md text-zinc-500">Explora las categorías y agrega los productos que quieres pedir.</p>
        <Link to="/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-violet-700 px-6 font-bold text-white">Explorar productos <ArrowRight size={18} /></Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
      <p className="text-xs font-extrabold tracking-[.12em] text-violet-700">RESUMEN DE COMPRA</p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Tu carrito</h1>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
          {items.map((item) => (
            <article key={item.cartId} className="grid gap-4 border-b border-zinc-200 p-4 last:border-0 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:p-6">
              <img src={item.product.image} alt={item.product.name} className="aspect-square size-28 rounded-2xl object-cover" />
              <div>
                <Link to={`/producto/${item.product.slug}`} className="text-lg font-bold hover:text-violet-700">{item.product.name}</Link>
                {Object.entries(item.selectedOptions).length > 0 && (
                  <p className="mt-1 text-sm text-zinc-500">{Object.entries(item.selectedOptions).map(([name, value]) => `${name}: ${value}`).join(' · ')}</p>
                )}
                <p className="mt-2 font-bold text-violet-700">{formatCurrency(item.unitPrice)}</p>
                <button type="button" onClick={() => removeItem(item.cartId)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-800"><Trash2 size={16} /> Quitar</button>
              </div>
              <div className="flex h-11 w-fit items-center rounded-full border border-zinc-200">
                <button type="button" className="grid size-10 place-items-center" onClick={() => updateQuantity(item.cartId, item.quantity - 1)} aria-label="Reducir cantidad"><Minus size={16} /></button>
                <span className="min-w-8 text-center font-bold">{item.quantity}</span>
                <button type="button" className="grid size-10 place-items-center" onClick={() => updateQuantity(item.cartId, item.quantity + 1)} aria-label="Aumentar cantidad"><Plus size={16} /></button>
              </div>
            </article>
          ))}
        </div>

        <aside className="rounded-3xl bg-zinc-950 p-7 text-white lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-extrabold">Resumen</h2>
          <div className="mt-6 flex justify-between border-b border-zinc-700 pb-5 text-zinc-300"><span>Productos</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="mt-5 flex justify-between"><span className="font-bold">Subtotal</span><strong className="font-display text-2xl">{formatCurrency(subtotal)}</strong></div>
          <p className="mt-3 text-sm leading-6 text-zinc-400">El costo de entrega se confirmará por WhatsApp según tu ubicación.</p>
          <Link to="/checkout" className="mt-7 flex min-h-13 items-center justify-center gap-2 rounded-full bg-violet-600 px-6 font-bold transition hover:bg-violet-500">Continuar pedido <ArrowRight size={18} /></Link>
          <Link to="/" className="mt-3 flex min-h-11 items-center justify-center text-sm font-bold text-zinc-300 hover:text-white">Seguir comprando</Link>
        </aside>
      </div>
    </section>
  )
}
