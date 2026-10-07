import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'

export function CartPage() {
  const {
    items,
    subtotal,
    removeItem,
    updateQuantity,
  } = useCart()

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="rounded-[2rem] border border-zinc-200 bg-white px-6 py-14 shadow-sm sm:px-12 sm:py-16">
          <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-violet-100 text-violet-700">
            <ShoppingBag
              size={34}
              aria-hidden="true"
            />
          </span>

          <h1 className="mt-7 font-display text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            Tu carrito está vacío
          </h1>

          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-zinc-500">
            Explora nuestras categorías y agrega los productos que quieres pedir.
          </p>

          <Link
            to="/"
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-violet-700 px-6 font-bold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-200"
          >
            Explorar productos
            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-20">
      <header>
        <p className="text-xs font-extrabold tracking-[.12em] text-violet-700">
          RESUMEN DE COMPRA
        </p>

        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-zinc-950 sm:text-5xl">
              Tu carrito
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Revisa tus productos antes de continuar con la información de entrega.
            </p>
          </div>

          <Link
            to="/"
            className="hidden min-h-11 items-center gap-2 rounded-full border border-zinc-200 bg-white px-5 text-sm font-bold text-zinc-700 transition hover:border-violet-300 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:inline-flex"
          >
            Seguir comprando
            <ArrowRight
              size={17}
              aria-hidden="true"
            />
          </Link>
        </div>
      </header>

      <div className="mt-8 grid items-start gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1fr)_110px_144px_110px] gap-5 border-b border-zinc-200 bg-zinc-50 px-6 py-4 text-xs font-extrabold uppercase tracking-[.08em] text-zinc-500 xl:grid">
            <span>Producto</span>
            <span>Precio</span>
            <span className="text-center">
              Cantidad
            </span>
            <span className="text-right">
              Total
            </span>
          </div>

          <div className="divide-y divide-zinc-200">
            {items.map((item) => {
              const lineTotal =
                item.unitPrice * item.quantity

              return (
                <article
                  key={item.cartId}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-5 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_110px_144px_110px] xl:gap-x-5 xl:px-6 xl:py-5"
                >
                  <div className="col-span-2 flex min-w-0 items-start gap-4 xl:col-span-1 xl:items-center">
                    <Link
                      to={`/producto/${item.product.slug}`}
                      className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-zinc-200 bg-white p-2 transition hover:border-violet-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:size-28 xl:size-24"
                      aria-label={`Ver ${item.product.name}`}
                    >
                      <img
                        src={
                          item.image ||
                          item.product.image
                        }
                        alt={item.product.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </Link>

                    <div className="min-w-0 flex-1 py-0.5">
                      <Link
                        to={`/producto/${item.product.slug}`}
                        className="text-base font-extrabold leading-6 text-zinc-950 transition hover:text-violet-700 focus-visible:rounded focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 sm:text-lg"
                      >
                        {item.product.name}
                      </Link>

                      {Object.entries(
                        item.selectedOptions,
                      ).length > 0 && (
                        <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                          {Object.entries(
                            item.selectedOptions,
                          )
                            .map(
                              ([name, value]) =>
                                `${name}: ${value}`,
                            )
                            .join(' · ')}
                        </p>
                      )}

                      <p className="mt-2 font-bold text-violet-700 xl:hidden">
                        {formatCurrency(
                          item.unitPrice,
                        )}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeItem(item.cartId)
                        }
                        className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-lg pr-2 text-sm font-bold text-zinc-500 transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                        aria-label={`Quitar ${item.product.name} del carrito`}
                      >
                        <Trash2
                          size={15}
                          aria-hidden="true"
                        />
                        Quitar
                      </button>
                    </div>
                  </div>

                  <p className="hidden font-bold text-zinc-700 xl:block">
                    {formatCurrency(
                      item.unitPrice,
                    )}
                  </p>

                  <div className="flex flex-col items-start gap-1.5 xl:items-center">
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-400 xl:hidden">
                      Cantidad
                    </span>

                    <div className="flex h-11 w-fit items-center rounded-full border border-zinc-200 bg-white shadow-sm">
                      <button
                        type="button"
                        className="grid size-10 place-items-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
                        onClick={() =>
                          updateQuantity(
                            item.cartId,
                            item.quantity - 1,
                          )
                        }
                        aria-label={`Reducir cantidad de ${item.product.name}`}
                      >
                        <Minus
                          size={16}
                          aria-hidden="true"
                        />
                      </button>

                      <span
                        className="min-w-8 text-center font-extrabold text-zinc-950"
                        aria-live="polite"
                      >
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        className="grid size-10 place-items-center rounded-full text-zinc-600 transition hover:bg-zinc-100 hover:text-violet-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
                        onClick={() =>
                          updateQuantity(
                            item.cartId,
                            item.quantity + 1,
                          )
                        }
                        aria-label={`Aumentar cantidad de ${item.product.name}`}
                      >
                        <Plus
                          size={16}
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold uppercase tracking-wide text-zinc-400 xl:hidden">
                      Total
                    </span>

                    <p className="mt-1 font-display text-lg font-extrabold text-zinc-950 xl:mt-0 xl:text-base">
                      {formatCurrency(lineTotal)}
                    </p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <aside className="rounded-3xl bg-zinc-950 p-6 text-white shadow-xl shadow-zinc-950/10 sm:p-7 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl font-extrabold">
            Resumen del pedido
          </h2>

          <dl className="mt-6 space-y-4">
            <div className="flex items-center justify-between gap-4 text-sm text-zinc-300">
              <dt>Productos</dt>
              <dd className="font-semibold text-white">
                {formatCurrency(subtotal)}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-zinc-300">
              <dt>Entrega</dt>
              <dd className="text-right font-semibold text-white">
                Por confirmar
              </dd>
            </div>

            <div className="flex items-end justify-between gap-4 border-t border-zinc-700 pt-5">
              <dt className="font-bold">
                Subtotal
              </dt>
              <dd className="font-display text-2xl font-extrabold">
                {formatCurrency(subtotal)}
              </dd>
            </div>
          </dl>

          <div className="mt-5 rounded-2xl bg-zinc-900 p-4 text-sm leading-6 text-zinc-400">
            El costo de entrega se confirmará por WhatsApp según tu ubicación.
          </div>

          <Link
            to="/checkout"
            className="mt-6 flex min-h-13 items-center justify-center gap-2 rounded-full bg-violet-600 px-6 text-center font-bold text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-400/40"
          >
            Continuar pedido
            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>

          <Link
            to="/"
            className="mt-3 flex min-h-11 items-center justify-center rounded-full text-sm font-bold text-zinc-300 transition hover:bg-zinc-900 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-zinc-700 sm:hidden"
          >
            Seguir comprando
          </Link>
        </aside>
      </div>
    </section>
  )
}



    
  
// import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
// import { Link } from 'react-router-dom'
// import { useCart } from '../context/CartContext'
// import { formatCurrency } from '../utils/currency'

// export function CartPage() {
//   const { items, subtotal, removeItem, updateQuantity } = useCart()

//   if (items.length === 0) {
//     return (
//       <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
//         <span className="mx-auto grid size-20 place-items-center rounded-3xl bg-violet-100 text-violet-700"><ShoppingBag size={34} /></span>
//         <h1 className="mt-7 font-display text-4xl font-extrabold tracking-tight">Tu carrito está vacío</h1>
//         <p className="mx-auto mt-4 max-w-md text-zinc-500">Explora las categorías y agrega los productos que quieres pedir.</p>
//         <Link to="/" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-violet-700 px-6 font-bold text-white">Explorar productos <ArrowRight size={18} /></Link>
//       </section>
//     )
//   }

//   return (
//     <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
//       <p className="text-xs font-extrabold tracking-[.12em] text-violet-700">RESUMEN DE COMPRA</p>
//       <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Tu carrito</h1>

//       <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_380px]">
//         <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
//           {items.map((item) => (
//             <article key={item.cartId} className="grid gap-4 border-b border-zinc-200 p-4 last:border-0 sm:grid-cols-[110px_1fr_auto] sm:items-center sm:p-6">
//               <img
//                 src={item.image || item.product.image}
//                 alt={item.product.name}
//                 className="aspect-square size-28 rounded-2xl border border-zinc-100 bg-white object-contain p-2"
//               />
//               <div>
//                 <Link to={`/producto/${item.product.slug}`} className="text-lg font-bold hover:text-violet-700">{item.product.name}</Link>
//                 {Object.entries(item.selectedOptions).length > 0 && (
//                   <p className="mt-1 text-sm text-zinc-500">{Object.entries(item.selectedOptions).map(([name, value]) => `${name}: ${value}`).join(' · ')}</p>
//                 )}
//                 <p className="mt-2 font-bold text-violet-700">{formatCurrency(item.unitPrice)}</p>
//                 <button type="button" onClick={() => removeItem(item.cartId)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-red-700 hover:text-red-800"><Trash2 size={16} /> Quitar</button>
//               </div>
//               <div className="flex h-11 w-fit items-center rounded-full border border-zinc-200">
//                 <button type="button" className="grid size-10 place-items-center" onClick={() => updateQuantity(item.cartId, item.quantity - 1)} aria-label="Reducir cantidad"><Minus size={16} /></button>
//                 <span className="min-w-8 text-center font-bold">{item.quantity}</span>
//                 <button type="button" className="grid size-10 place-items-center" onClick={() => updateQuantity(item.cartId, item.quantity + 1)} aria-label="Aumentar cantidad"><Plus size={16} /></button>
//               </div>
//             </article>
//           ))}
//         </div>

//         <aside className="rounded-3xl bg-zinc-950 p-7 text-white lg:sticky lg:top-28">
//           <h2 className="font-display text-2xl font-extrabold">Resumen</h2>
//           <div className="mt-6 flex justify-between border-b border-zinc-700 pb-5 text-zinc-300"><span>Productos</span><span>{formatCurrency(subtotal)}</span></div>
//           <div className="mt-5 flex justify-between"><span className="font-bold">Subtotal</span><strong className="font-display text-2xl">{formatCurrency(subtotal)}</strong></div>
//           <p className="mt-3 text-sm leading-6 text-zinc-400">El costo de entrega se confirmará por WhatsApp según tu ubicación.</p>
//           <Link to="/checkout" className="mt-7 flex min-h-13 items-center justify-center gap-2 rounded-full bg-violet-600 px-6 font-bold transition hover:bg-violet-500">Continuar pedido <ArrowRight size={18} /></Link>
//           <Link to="/" className="mt-3 flex min-h-11 items-center justify-center text-sm font-bold text-zinc-300 hover:text-white">Seguir comprando</Link>
//         </aside>
//       </div>
//     </section>
//   )
// }
