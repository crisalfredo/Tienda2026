import { ArrowLeft, ImagePlus, Plus, Save, Trash2 } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CloudinaryImageUploader } from '../../components/admin/CloudinaryImageUploader'
import { AdminPageHeader, Panel, inputClass, primaryButton, secondaryButton } from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'
import type { Category, Product } from '../../types'

interface VariantDraft { sku: string; price: string; previousPrice: string; stock: string; isDefault: boolean; isActive: boolean; valuesText: string }
const emptyVariant: VariantDraft = { sku: '', price: '', previousPrice: '', stock: '0', isDefault: true, isActive: true, valuesText: '' }

export function AdminProductFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState({ categoryId: '', name: '', slug: '', shortDescription: '', description: '', badge: '', featured: false, isActive: true, imagesText: '', optionsText: '' })
  const [variants, setVariants] = useState<VariantDraft[]>([{ ...emptyVariant }])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi.get<{ data: { categories: Category[] } }>('/categories/admin').then((result) => {
      setCategories(result.data.categories)
      setForm((current) => ({ ...current, categoryId: current.categoryId || result.data.categories[0]?.id || '' }))
    }).catch((err) => setError(err.message))
    if (id) adminApi.get<{ data: { product: Product } }>(`/admin/products/${id}`).then(({ data }) => {
      const product = data.product
      setForm({
        categoryId: product.categoryId ?? '', name: product.name, slug: product.slug,
        shortDescription: product.shortDescription, description: product.description,
        badge: product.badge ?? '', featured: product.featured, isActive: product.isActive ?? true,
        imagesText: product.images.join('\n'),
        optionsText: (product.options ?? []).map((option) => `${option.name}: ${option.values.join(', ')}`).join('\n'),
      })
      setVariants((product.variants ?? []).map((variant) => ({
        sku: variant.sku, price: String(variant.price), previousPrice: variant.previousPrice ? String(variant.previousPrice) : '', stock: String(variant.stock), isDefault: variant.isDefault, isActive: variant.isActive,
        valuesText: Object.entries(variant.values).map(([name, value]) => `${name}=${value}`).join(', '),
      })))
    }).catch((err) => setError(err.message))
  }, [id])

  const update = (name: string, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }))
  const updateVariant = (index: number, field: keyof VariantDraft, value: string | boolean) => setVariants((current) => current.map((variant, position) => position === index ? { ...variant, [field]: value } : variant))
  const imageUrls = form.imagesText.split('\n').map((url) => url.trim()).filter(Boolean)
  const addImage = (url: string) => {
    if (imageUrls.includes(url)) return
    update('imagesText', [...imageUrls, url].join('\n'))
  }
  const removeImage = (url: string) => update('imagesText', imageUrls.filter((item) => item !== url).join('\n'))

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const options = form.optionsText.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
        const [name, values = ''] = line.split(':')
        return { name: name.trim(), values: values.split(',').map((value) => value.trim()).filter(Boolean) }
      })
      const payload = {
        categoryId: form.categoryId, name: form.name, slug: form.slug, shortDescription: form.shortDescription,
        description: form.description, badge: form.badge || null, featured: form.featured, isActive: form.isActive,
        images: form.imagesText.split('\n').map((url) => url.trim()).filter(Boolean).map((url, index) => ({ url, altText: form.name, sortOrder: index })),
        options,
        variants: variants.map((variant) => ({
          sku: variant.sku, price: Number(variant.price), previousPrice: variant.previousPrice ? Number(variant.previousPrice) : null,
          stock: Number(variant.stock), isDefault: variant.isDefault, isActive: variant.isActive,
          values: Object.fromEntries(variant.valuesText.split(',').map((item) => item.trim()).filter(Boolean).map((item) => {
            const [name, value = ''] = item.split('='); return [name.trim(), value.trim()]
          })),
        })),
      }
      await adminApi.mutate(`/admin/products${editing ? `/${id}` : ''}`, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      navigate('/admin/productos')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar el producto.')
      setSaving(false)
    }
  }

  return <>
    <Link to="/admin/productos" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-violet-700"><ArrowLeft size={17} /> Volver a productos</Link>
    <AdminPageHeader eyebrow="CATÁLOGO" title={editing ? 'Editar producto' : 'Nuevo producto'} description="Los cambios activos se reflejarán en la tienda pública." />
    <form onSubmit={submit} className="grid items-start gap-6 xl:grid-cols-[1fr_380px]">
      <div className="grid gap-6">
        <Panel><h2 className="font-display text-xl font-extrabold">Información general</h2><div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="text-sm font-bold">Nombre<input className={`${inputClass} mt-2`} value={form.name} onChange={(event) => update('name', event.target.value)} required /></label><label className="text-sm font-bold">Slug<input className={`${inputClass} mt-2`} value={form.slug} onChange={(event) => update('slug', event.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))} required /></label><label className="text-sm font-bold">Categoría<select className={`${inputClass} mt-2`} value={form.categoryId} onChange={(event) => update('categoryId', event.target.value)} required>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-bold">Distintivo<input className={`${inputClass} mt-2`} value={form.badge} onChange={(event) => update('badge', event.target.value)} placeholder="Nuevo, Oferta..." /></label><label className="text-sm font-bold sm:col-span-2">Descripción corta<textarea className={`${inputClass} mt-2 min-h-24 py-3`} value={form.shortDescription} onChange={(event) => update('shortDescription', event.target.value)} required /></label><label className="text-sm font-bold sm:col-span-2">Descripción completa<textarea className={`${inputClass} mt-2 min-h-40 py-3`} value={form.description} onChange={(event) => update('description', event.target.value)} required /></label></div></Panel>
        <Panel>
          <h2 className="font-display text-xl font-extrabold">Imágenes</h2>
          <p className="mt-2 text-sm text-zinc-500">Súbelas a Cloudinary o pega una URL por línea. La primera será la imagen principal.</p>
          <div className="mt-5"><CloudinaryImageUploader folder="products" onUploaded={addImage} disabled={saving} /></div>
          {imageUrls.length > 0 && <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {imageUrls.map((url, index) => <div key={url} className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
              <img src={url} alt={`${form.name || 'Producto'} ${index + 1}`} className="aspect-square w-full object-cover" />
              {index === 0 && <span className="absolute left-2 top-2 rounded-full bg-violet-700 px-2 py-1 text-[10px] font-extrabold text-white">PRINCIPAL</span>}
              <button type="button" onClick={() => removeImage(url)} className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-lg bg-white/95 text-red-600 shadow-sm hover:bg-red-50" aria-label={`Eliminar imagen ${index + 1}`}><Trash2 size={16} /></button>
            </div>)}
          </div>}
          <label className="mt-5 block text-xs font-bold text-zinc-600">URLs de imágenes
            <textarea className={`${inputClass} mt-2 min-h-28 py-3 font-mono text-xs`} value={form.imagesText} onChange={(event) => update('imagesText', event.target.value)} placeholder="https://..." required />
          </label>
        </Panel>
        <Panel><h2 className="font-display text-xl font-extrabold">Opciones</h2><p className="mt-2 text-sm text-zinc-500">Una opción por línea. Ejemplo: <strong>Color: Negro, Blanco</strong></p><textarea className={`${inputClass} mt-5 min-h-28 py-3 font-mono text-xs`} value={form.optionsText} onChange={(event) => update('optionsText', event.target.value)} placeholder={'Color: Negro, Blanco\nTalla: S, M, L'} /></Panel>
        <Panel><div className="flex items-center justify-between gap-3"><div><h2 className="font-display text-xl font-extrabold">Variantes e inventario</h2><p className="mt-2 text-sm text-zinc-500">Relaciona opciones usando Color=Negro, Talla=M.</p></div><button type="button" onClick={() => setVariants((current) => [...current, { ...emptyVariant, isDefault: false }])} className={secondaryButton}><Plus size={17} /> Variante</button></div><div className="mt-5 grid gap-4">{variants.map((variant, index) => <div key={index} className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold">SKU<input className={`${inputClass} mt-1`} value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} required /></label><label className="text-xs font-bold">Precio<input type="number" min="0" step="0.01" className={`${inputClass} mt-1`} value={variant.price} onChange={(event) => updateVariant(index, 'price', event.target.value)} required /></label><label className="text-xs font-bold">Precio anterior<input type="number" min="0" step="0.01" className={`${inputClass} mt-1`} value={variant.previousPrice} onChange={(event) => updateVariant(index, 'previousPrice', event.target.value)} /></label><label className="text-xs font-bold">Stock<input type="number" min="0" step="1" className={`${inputClass} mt-1`} value={variant.stock} onChange={(event) => updateVariant(index, 'stock', event.target.value)} required /></label><label className="text-xs font-bold sm:col-span-2 lg:col-span-3">Valores de opciones<input className={`${inputClass} mt-1`} value={variant.valuesText} onChange={(event) => updateVariant(index, 'valuesText', event.target.value)} placeholder="Color=Negro, Talla=M" /></label><div className="flex items-end justify-between gap-3"><label className="flex min-h-11 items-center gap-2 text-xs font-bold"><input type="checkbox" checked={variant.isDefault} onChange={(event) => setVariants((current) => current.map((item, position) => ({ ...item, isDefault: position === index ? event.target.checked : false })))} /> Principal</label>{variants.length > 1 && <button type="button" onClick={() => setVariants((current) => current.filter((_, position) => position !== index))} className="grid size-10 place-items-center rounded-xl text-red-600 hover:bg-red-50"><Trash2 size={17} /></button>}</div></div></div>)}</div></Panel>
      </div>
      <div className="grid gap-6 xl:sticky xl:top-8"><Panel><h2 className="font-display text-xl font-extrabold">Publicación</h2><div className="mt-5 grid gap-4"><label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 font-bold"><span>Producto activo</span><input type="checkbox" checked={form.isActive} onChange={(event) => update('isActive', event.target.checked)} className="size-5 accent-violet-700" /></label><label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 font-bold"><span>Producto destacado</span><input type="checkbox" checked={form.featured} onChange={(event) => update('featured', event.target.checked)} className="size-5 accent-violet-700" /></label></div>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}<button type="submit" disabled={saving} className={`${primaryButton} mt-6 w-full`}><Save size={18} /> {saving ? 'Guardando...' : 'Guardar producto'}</button></Panel><Panel><div className="flex items-start gap-3 text-sm leading-6 text-zinc-500"><ImagePlus size={20} className="mt-0.5 shrink-0 text-violet-700" /> Las cargas se realizan mediante el backend autenticado. La clave secreta de Cloudinary nunca se envía al navegador.</div></Panel></div>
    </form>
  </>
}


