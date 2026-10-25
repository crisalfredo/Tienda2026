import { Archive, Edit3, Plus, Search, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageHeader, inputClass, primaryButton } from '../../components/admin/AdminUi'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { adminApi } from '../../services/api'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/currency'

export function AdminProductsPage() {
  const { user } = useAdminAuth()
  const isSuperadmin = user?.role === 'SUPERADMIN'
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = () =>
    adminApi
      .get<{ data: { products: Product[] } }>('/admin/products')
      .then((result) => setProducts(result.data.products))
      .catch((err) => setError(err.message))

  useEffect(() => {
    void load()
  }, [])

  const archive = async (product: Product) => {
    if (!window.confirm(`¿Archivar “${product.name}”? Dejará de aparecer en la tienda, pero conservas su historial.`)) return
    try {
      await adminApi.mutate(`/admin/products/${product.id}`, { method: 'DELETE' })
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo archivar.')
    }
  }

  const remove = async (product: Product) => {
    if (
      !window.confirm(
        `Vas a ELIMINAR definitivamente “${product.name}”.\n\nEsta acción no se puede deshacer y borra sus variantes, opciones e imágenes. Si tiene pedidos asociados, mejor archívalo.\n\n¿Continuar?`,
      )
    )
      return
    try {
      await adminApi.mutate(`/admin/products/${product.id}/permanent`, { method: 'DELETE' })
      setError(null)
      load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar el producto.')
    }
  }

  const visible = products.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <AdminPageHeader
        eyebrow="CATÁLOGO"
        title="Productos"
        description="Administra información, precios, variantes, imágenes y visibilidad."
        action={
          <Link to="/admin/productos/nuevo" className={primaryButton}>
            <Plus size={18} /> Nuevo producto
          </Link>
        }
      />
      <div className="relative mb-5 max-w-md">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} className={`${inputClass} pl-11`} placeholder="Buscar productos" />
      </div>
      {error && <p className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="bg-zinc-950 text-xs uppercase tracking-wide text-zinc-300">
              <tr>
                <th className="px-5 py-4">Producto</th>
                <th className="px-5 py-4">Categoría</th>
                <th className="px-5 py-4">Precio</th>
                <th className="px-5 py-4">Ganancia</th>
                <th className="px-5 py-4">Margen</th>
                <th className="px-5 py-4">Stock</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((product) => {
                const hasProfit = product.profit != null
                const negative = hasProfit && (product.profit ?? 0) < 0
                return (
                  <tr key={product.id} className="border-b border-zinc-100">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="size-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-bold">{product.name}</p>
                          <p className="text-xs text-zinc-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 capitalize">{product.categorySlug}</td>
                    <td className="px-5 py-4 font-bold">{formatCurrency(product.price)}</td>
                    <td className={`px-5 py-4 font-bold ${!hasProfit ? 'text-zinc-400' : negative ? 'text-red-600' : 'text-emerald-700'}`}>
                      {hasProfit ? formatCurrency(product.profit as number) : 'Sin costo'}
                    </td>
                    <td className={`px-5 py-4 font-bold ${product.margin == null ? 'text-zinc-400' : negative ? 'text-red-600' : 'text-emerald-700'}`}>
                      {product.margin != null ? `${(product.margin * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className={`px-5 py-4 font-bold ${product.stock <= 5 ? 'text-red-600' : ''}`}>{product.stock}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-100 text-zinc-600'}`}>
                        {product.isActive ? 'Activo' : 'Archivado'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/admin/productos/${product.id}/editar`}
                          className="grid size-10 place-items-center rounded-xl border border-zinc-200 hover:border-violet-300 hover:text-violet-700"
                          aria-label={`Editar ${product.name}`}
                        >
                          <Edit3 size={17} />
                        </Link>
                        {product.isActive && (
                          <button
                            type="button"
                            onClick={() => void archive(product)}
                            className="grid size-10 place-items-center rounded-xl border border-zinc-200 hover:border-amber-300 hover:text-amber-600"
                            aria-label={`Archivar ${product.name}`}
                            title="Archivar"
                          >
                            <Archive size={17} />
                          </button>
                        )}
                        {isSuperadmin && (
                          <button
                            type="button"
                            onClick={() => void remove(product)}
                            className="grid size-10 place-items-center rounded-xl border border-zinc-200 hover:border-red-300 hover:text-red-600"
                            aria-label={`Eliminar ${product.name}`}
                            title="Eliminar definitivamente"
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {visible.length === 0 && <p className="p-10 text-center text-zinc-500">No encontramos productos.</p>}
      </div>
    </>
  )
}
