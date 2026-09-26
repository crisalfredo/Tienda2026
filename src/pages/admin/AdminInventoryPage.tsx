import { Save, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { AdminPageHeader, inputClass } from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'

interface InventoryVariant { id: string; productName: string; sku: string; stock: number; isActive: boolean; values: Record<string, string> }

export function AdminInventoryPage() {
  const [variants, setVariants] = useState<InventoryVariant[]>([])
  const [drafts, setDrafts] = useState<Record<string, number>>({})
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const load = () => adminApi.get<{ data: { variants: InventoryVariant[] } }>('/admin/inventory').then(({ data }) => { setVariants(data.variants); setDrafts(Object.fromEntries(data.variants.map((item) => [item.id, item.stock]))) }).catch((err) => setMessage(err.message))
  useEffect(() => { void load() }, [])
  const save = async (variant: InventoryVariant) => { try { await adminApi.mutate(`/admin/inventory/${variant.id}`, { method: 'PATCH', body: JSON.stringify({ stock: drafts[variant.id] }) }); setMessage(`Inventario actualizado para ${variant.productName}.`); load() } catch (err) { setMessage(err instanceof Error ? err.message : 'No se pudo actualizar.') } }
  const visible = variants.filter((item) => `${item.productName} ${item.sku}`.toLowerCase().includes(search.toLowerCase()))
  return <><AdminPageHeader eyebrow="OPERACIONES" title="Inventario" description="Actualiza existencias por SKU y combinación de producto." /><div className="relative mb-5 max-w-md"><Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /><input className={`${inputClass} pl-11`} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar producto o SKU" /></div>{message && <p className="mb-5 rounded-xl bg-violet-50 p-4 text-sm text-violet-800">{message}</p>}<div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-zinc-950 text-zinc-300"><tr><th className="px-5 py-4">Producto</th><th className="px-5 py-4">SKU</th><th className="px-5 py-4">Variante</th><th className="px-5 py-4">Stock</th><th className="px-5 py-4 text-right">Guardar</th></tr></thead><tbody>{visible.map((variant) => <tr key={variant.id} className="border-b border-zinc-100"><td className="px-5 py-4 font-bold">{variant.productName}</td><td className="px-5 py-4 font-mono text-xs">{variant.sku}</td><td className="px-5 py-4 text-zinc-500">{Object.entries(variant.values).map(([name, value]) => `${name}: ${value}`).join(' · ') || 'Estándar'}</td><td className="px-5 py-4"><input type="number" min="0" className="h-10 w-24 rounded-lg border border-zinc-200 px-3" value={drafts[variant.id] ?? 0} onChange={(event) => setDrafts({ ...drafts, [variant.id]: Number(event.target.value) })} /></td><td className="px-5 py-4 text-right"><button type="button" onClick={() => void save(variant)} className="inline-grid size-10 place-items-center rounded-xl bg-violet-700 text-white hover:bg-violet-800"><Save size={17} /></button></td></tr>)}</tbody></table></div></div></>
}
