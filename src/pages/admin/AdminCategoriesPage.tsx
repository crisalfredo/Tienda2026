import {
  Archive,
  Edit3,
  Plus,
  Save,
  X,
} from 'lucide-react'
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'

import { CloudinaryImageUploader } from '../../components/admin/CloudinaryImageUploader'
import {
  AdminPageHeader,
  Panel,
  inputClass,
  primaryButton,
  secondaryButton,
} from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'
import type { Category } from '../../types'

interface CategoryFormState {
  name: string
  slug: string
  skuPrefix: string
  description: string
  imageUrl: string
  isActive: boolean
  sortOrder: number
}

const emptyForm: CategoryFormState = {
  name: '',
  slug: '',
  skuPrefix: '',
  description: '',
  imageUrl: '',
  isActive: true,
  sortOrder: 0,
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeSkuPrefix(value: string) {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 5)
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<CategoryFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const editingCategory = categories.find(
    (category) => category.id === editingId,
  )

  const skuPrefixLocked = Boolean(
    editingCategory &&
      (editingCategory._count?.products ?? 0) > 0,
  )

  const loadCategories = async () => {
    setLoading(true)

    try {
      const result = await adminApi.get<{
        data: {
          categories: Category[]
        }
      }>('/categories/admin')

      setCategories(result.data.categories)
      setError(null)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No se pudieron cargar las categorías.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadCategories()
  }, [])

  const edit = (category: Category) => {
    setEditingId(category.id)
    setError(null)
    setForm({
      name: category.name,
      slug: category.slug,
      skuPrefix: category.skuPrefix,
      description: category.description,
      imageUrl: category.imageUrl ?? category.image ?? '',
      isActive: category.isActive ?? true,
      sortOrder: category.sortOrder ?? 0,
    })
  }

  const reset = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const skuPrefix = normalizeSkuPrefix(form.skuPrefix)

    if (skuPrefix.length < 2) {
      setError('El prefijo SKU debe contener entre 2 y 5 letras o números.')
      return
    }

    setSaving(true)

    try {
      await adminApi.mutate(
        `/categories/admin${editingId ? `/${editingId}` : ''}`,
        {
          method: editingId ? 'PUT' : 'POST',
          body: JSON.stringify({
            ...form,
            name: form.name.trim(),
            slug: form.slug.trim(),
            skuPrefix,
            description: form.description.trim(),
            imageUrl: form.imageUrl.trim(),
          }),
        },
      )

      reset()
      await loadCategories()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo guardar la categoría.',
      )
    } finally {
      setSaving(false)
    }
  }

  const archive = async (category: Category) => {
    const confirmed = window.confirm(
      `¿Archivar la categoría “${category.name}”?`,
    )

    if (!confirmed) {
      return
    }

    setError(null)

    try {
      await adminApi.mutate(
        `/categories/admin/${category.id}`,
        {
          method: 'DELETE',
        },
      )

      await loadCategories()
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : 'No se pudo archivar la categoría.',
      )
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="CATÁLOGO"
        title="Categorías"
        description="Organiza el catálogo y controla qué grupos aparecen en la tienda."
      />

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_390px]">
        <Panel>
          <div className="grid gap-3">
            {categories.map((category) => (
              <article
                key={category.id}
                className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center"
              >
                <img
                  src={category.imageUrl ?? category.image}
                  alt={category.name}
                  className="h-20 w-full rounded-xl object-cover sm:size-16"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-bold">
                      {category.name}
                    </h2>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                        category.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {category.isActive
                        ? 'Activa'
                        : 'Archivada'}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">
                    {category.description}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    {category._count?.products ?? 0} productos
                    {' · '}SKU {category.skuPrefix}
                    {' · '}orden {category.sortOrder ?? 0}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => edit(category)}
                    className="grid size-10 place-items-center rounded-xl border border-zinc-200 hover:text-violet-700"
                    aria-label={`Editar categoría ${category.name}`}
                  >
                    <Edit3 size={17} />
                  </button>

                  {category.isActive && (
                    <button
                      type="button"
                      onClick={() => void archive(category)}
                      className="grid size-10 place-items-center rounded-xl border border-zinc-200 hover:text-red-600"
                      aria-label={`Archivar categoría ${category.name}`}
                    >
                      <Archive size={17} />
                    </button>
                  )}
                </div>
              </article>
            ))}

            {loading && categories.length === 0 && (
              <p className="py-10 text-center text-zinc-500">
                Cargando categorías...
              </p>
            )}

            {!loading && categories.length === 0 && (
              <p className="py-10 text-center text-zinc-500">
                No hay categorías registradas.
              </p>
            )}
          </div>
        </Panel>

        <Panel className="xl:sticky xl:top-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold">
              {editingId
                ? 'Editar categoría'
                : 'Nueva categoría'}
            </h2>

            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="grid size-9 place-items-center rounded-lg hover:bg-zinc-100"
                aria-label="Cancelar edición"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <form
            onSubmit={submit}
            className="mt-5 grid gap-4"
          >
            <label className="text-sm font-bold">
              Nombre

              <input
                className={`${inputClass} mt-2`}
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                    slug: editingId
                      ? current.slug
                      : createSlug(event.target.value),
                  }))
                }
                required
              />
            </label>

            <label className="text-sm font-bold">
              Slug

              <input
                className={`${inputClass} mt-2`}
                value={form.slug}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    slug: createSlug(event.target.value),
                  }))
                }
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                required
              />
            </label>

            <label className="text-sm font-bold">
              Prefijo SKU

              <input
                className={`${inputClass} mt-2 uppercase disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-500`}
                value={form.skuPrefix}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    skuPrefix: normalizeSkuPrefix(
                      event.target.value,
                    ),
                  }))
                }
                minLength={2}
                maxLength={5}
                pattern="[A-Z0-9]{2,5}"
                placeholder="HOG"
                disabled={skuPrefixLocked}
                required
              />

              <span className="mt-1 block text-xs font-normal leading-5 text-zinc-500">
                {skuPrefixLocked
                  ? 'No puede cambiarse porque la categoría ya tiene productos.'
                  : 'Entre 2 y 5 letras o números. Se utilizará para generar los SKU.'}
              </span>
            </label>

            <label className="text-sm font-bold">
              Descripción

              <textarea
                className={`${inputClass} mt-2 min-h-24 py-3`}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                minLength={10}
                maxLength={300}
                required
              />
            </label>

            <div>
              <span className="text-sm font-bold">
                Imagen
              </span>

              <div className="mt-2">
                <CloudinaryImageUploader
                  folder="categories"
                  onUploaded={(url) =>
                    setForm((current) => ({
                      ...current,
                      imageUrl: url,
                    }))
                  }
                  disabled={saving}
                />
              </div>

              {form.imageUrl && (
                <img
                  src={form.imageUrl}
                  alt="Vista previa de la categoría"
                  className="mt-3 aspect-[16/9] w-full rounded-xl border border-zinc-200 object-cover"
                />
              )}

              <label className="mt-3 block text-xs font-bold text-zinc-600">
                URL de imagen

                <input
                  className={`${inputClass} mt-2`}
                  type="url"
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      imageUrl: event.target.value,
                    }))
                  }
                  required
                />
              </label>
            </div>

            <label className="text-sm font-bold">
              Orden

              <input
                className={`${inputClass} mt-2`}
                type="number"
                min="0"
                max="9999"
                step="1"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sortOrder: Number(event.target.value),
                  }))
                }
              />
            </label>

            <label className="flex items-center gap-3 text-sm font-bold">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="size-5 accent-violet-700"
              />

              Categoría activa
            </label>

            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className={primaryButton}
            >
              {editingId
                ? <Save size={17} />
                : <Plus size={17} />}

              {saving
                ? 'Guardando...'
                : editingId
                  ? 'Guardar cambios'
                  : 'Crear categoría'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={reset}
                disabled={saving}
                className={secondaryButton}
              >
                Cancelar
              </button>
            )}
          </form>
        </Panel>
      </div>
    </>
  )
}
