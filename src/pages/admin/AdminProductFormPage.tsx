import {
  ArrowLeft,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'
import {
  useEffect,
  useState,
  type FormEvent,
} from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'

import { CloudinaryImageUploader } from '../../components/admin/CloudinaryImageUploader'
import {
  AdminPageHeader,
  Panel,
  inputClass,
  primaryButton,
  secondaryButton,
} from '../../components/admin/AdminUi'
import { adminApi } from '../../services/api'
import type { Category, Product } from '../../types'

interface VariantDraft {
  id?: string
  sku?: string
  price: string
  previousPrice: string
  stock: string
  isDefault: boolean
  isActive: boolean
  valuesText: string
}

interface ImageOptionDraft {
  name: string
  value: string
}

interface ProductFormState {
  categoryId: string
  name: string
  slug: string
  shortDescription: string
  description: string
  badge: string
  featured: boolean
  isActive: boolean
  imagesText: string
  optionsText: string
}

function createEmptyVariant(isDefault = true): VariantDraft {
  return {
    price: '',
    previousPrice: '',
    stock: '0',
    isDefault,
    isActive: true,
    valuesText: '',
  }
}

function parseOptions(optionsText: string) {
  return optionsText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(':')

      if (separatorIndex === -1) {
        return {
          name: line.trim(),
          values: [],
        }
      }

      const name = line.slice(0, separatorIndex).trim()
      const valuesText = line.slice(separatorIndex + 1)

      return {
        name,
        values: valuesText
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean),
      }
    })
}

function parseVariantValues(valuesText: string) {
  return Object.fromEntries(
    valuesText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => {
        const separatorIndex = item.indexOf('=')

        if (separatorIndex === -1) {
          return [item.trim(), '']
        }

        const name = item.slice(0, separatorIndex).trim()
        const value = item.slice(separatorIndex + 1).trim()

        return [name, value]
      }),
  )
}

export function AdminProductFormPage() {
  const { id } = useParams()
  const editing = Boolean(id)
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductFormState>({
    categoryId: '',
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    badge: '',
    featured: false,
    isActive: true,
    imagesText: '',
    optionsText: '',
  })

  const [variants, setVariants] = useState<VariantDraft[]>([
    createEmptyVariant(),
  ])

  const [imageOptions, setImageOptions] = useState<
    Record<string, ImageOptionDraft | null>
  >({})

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const loadData = async () => {
      try {
        const categoryResult = await adminApi.get<{
          data: {
            categories: Category[]
          }
        }>('/categories/admin')

        if (!active) {
          return
        }

        const loadedCategories = categoryResult.data.categories

        setCategories(loadedCategories)

        setForm((current) => ({
          ...current,
          categoryId:
            current.categoryId ||
            loadedCategories[0]?.id ||
            '',
        }))

        if (!id) {
          return
        }

        const productResult = await adminApi.get<{
          data: {
            product: Product
          }
        }>(`/admin/products/${id}`)

        if (!active) {
          return
        }

        const product = productResult.data.product

        const loadedMedia = product.media?.length
          ? [...product.media].sort(
              (left, right) => left.sortOrder - right.sortOrder,
            )
          : product.images.map((url, index) => ({
              id: `legacy-${index}`,
              url,
              altText: product.name,
              sortOrder: index,
              option: null,
            }))

        const loadedImageUrls = [
          ...new Set(loadedMedia.map((media) => media.url)),
        ]

        setImageOptions(
          Object.fromEntries(
            loadedMedia.map((media) => [
              media.url,
              media.option
                ? {
                    name: media.option.name,
                    value: media.option.value,
                  }
                : null,
            ]),
          ),
        )

        setForm({
          categoryId: product.categoryId ?? '',
          name: product.name,
          slug: product.slug,
          shortDescription: product.shortDescription,
          description: product.description,
          badge: product.badge ?? '',
          featured: product.featured,
          isActive: product.isActive ?? true,
          imagesText: loadedImageUrls.join('\n'),
          optionsText: (product.options ?? [])
            .map(
              (option) =>
                `${option.name}: ${option.values.join(', ')}`,
            )
            .join('\n'),
        })

        const loadedVariants = (product.variants ?? []).map(
          (variant): VariantDraft => ({
            id: variant.id,
            sku: variant.sku,
            price: String(variant.price),
            previousPrice:
              variant.previousPrice !== undefined &&
              variant.previousPrice !== null
                ? String(variant.previousPrice)
                : '',
            stock: String(variant.stock),
            isDefault: variant.isDefault,
            isActive: variant.isActive,
            valuesText: Object.entries(variant.values)
              .map(([name, value]) => `${name}=${value}`)
              .join(', '),
          }),
        )

        setVariants(
          loadedVariants.length > 0
            ? loadedVariants
            : [createEmptyVariant()],
        )
      } catch (loadError) {
        if (!active) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No se pudo cargar la información del producto.',
        )
      }
    }

    void loadData()

    return () => {
      active = false
    }
  }, [id])

  const update = (
    name: keyof ProductFormState,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const updateVariant = (
    index: number,
    field: keyof VariantDraft,
    value: string | boolean,
  ) => {
    setVariants((current) =>
      current.map((variant, position) =>
        position === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant,
      ),
    )
  }

  const selectDefaultVariant = (selectedIndex: number) => {
    setVariants((current) =>
      current.map((variant, index) => ({
        ...variant,
        isDefault: index === selectedIndex,
      })),
    )
  }

  const addVariant = () => {
    setVariants((current) => [
      ...current,
      createEmptyVariant(current.length === 0),
    ])
  }

  const removeVariant = (selectedIndex: number) => {
    setVariants((current) => {
      const removedVariant = current[selectedIndex]
      const remaining = current.filter(
        (_, index) => index !== selectedIndex,
      )

      if (
        removedVariant?.isDefault &&
        remaining.length > 0 &&
        !remaining.some((variant) => variant.isDefault)
      ) {
        return remaining.map((variant, index) => ({
          ...variant,
          isDefault: index === 0,
        }))
      }

      return remaining
    })
  }

  const imageUrls = form.imagesText
    .split('\n')
    .map((url) => url.trim())
    .filter(Boolean)

  const parsedOptions = parseOptions(form.optionsText)

  const imageOptionChoices = parsedOptions.flatMap((option) =>
    option.values.map((value) => ({
      key: JSON.stringify([option.name, value]),
      name: option.name,
      value,
    })),
  )

  const getImageOptionKey = (url: string) => {
    const association = imageOptions[url]

    return association
      ? JSON.stringify([association.name, association.value])
      : ''
  }

  const assignImageOption = (
    url: string,
    selectedKey: string,
  ) => {
    const selectedOption = imageOptionChoices.find(
      (choice) => choice.key === selectedKey,
    )

    setImageOptions((current) => ({
      ...current,
      [url]: selectedOption
        ? {
            name: selectedOption.name,
            value: selectedOption.value,
          }
        : null,
    }))
  }

  const addImage = (url: string) => {
    const normalizedUrl = url.trim()

    if (!normalizedUrl || imageUrls.includes(normalizedUrl)) {
      return
    }

    if (imageUrls.length >= 10) {
      setError('Puedes agregar un máximo de 10 imágenes por producto.')
      return
    }

    setError(null)

    setImageOptions((current) => ({
      ...current,
      [normalizedUrl]: current[normalizedUrl] ?? null,
    }))

    update(
      'imagesText',
      [...imageUrls, normalizedUrl].join('\n'),
    )
  }

  const removeImage = (url: string) => {
    setImageOptions((current) => {
      const next = { ...current }
      delete next[url]
      return next
    })

    update(
      'imagesText',
      imageUrls
        .filter((item) => item !== url)
        .join('\n'),
    )
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (variants.length === 0) {
      setError('El producto debe tener al menos una variante.')
      return
    }

    const options = parseOptions(form.optionsText)
    const validImageOptions = new Set(
      options.flatMap((option) =>
        option.values.map((value) =>
          JSON.stringify([option.name, value]),
        ),
      ),
    )

    const invalidImageAssociation = imageUrls.find((url) => {
      const association = imageOptions[url]

      return (
        association !== null &&
        association !== undefined &&
        !validImageOptions.has(
          JSON.stringify([
            association.name,
            association.value,
          ]),
        )
      )
    })

    if (invalidImageAssociation) {
      setError(
        'Una imagen está asociada a una opción que ya no existe. Revisa la selección de las imágenes.',
      )
      return
    }

    setSaving(true)
    setError(null)

    try {
      const images = form.imagesText
        .split('\n')
        .map((url) => url.trim())
        .filter(Boolean)
        .map((url, index) => ({
          url,
          altText: form.name,
          sortOrder: index,
          option: imageOptions[url] ?? null,
        }))

      const payload = {
        categoryId: form.categoryId,
        name: form.name.trim(),
        slug: form.slug.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        badge: form.badge.trim() || null,
        featured: form.featured,
        isActive: form.isActive,
        images,
        options,

        /*
         * No se envía el SKU.
         *
         * Si la variante tiene ID, el backend conserva su SKU actual.
         * Si no tiene ID, el backend genera automáticamente uno nuevo.
         */
        variants: variants.map((variant) => ({
          ...(variant.id
            ? {
                id: variant.id,
              }
            : {}),
          price: Number(variant.price),
          previousPrice:
            variant.previousPrice.trim() !== ''
              ? Number(variant.previousPrice)
              : null,
          stock: Number(variant.stock),
          isDefault: variant.isDefault,
          isActive: variant.isActive,
          values: parseVariantValues(variant.valuesText),
        })),
      }

      await adminApi.mutate(
        `/admin/products${editing ? `/${id}` : ''}`,
        {
          method: editing ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
      )

      navigate('/admin/productos')
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo guardar el producto.',
      )

      setSaving(false)
    }
  }

  return (
    <>
      <Link
        to="/admin/productos"
        className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-violet-700"
      >
        <ArrowLeft size={17} />
        Volver a productos
      </Link>

      <AdminPageHeader
        eyebrow="CATÁLOGO"
        title={editing ? 'Editar producto' : 'Nuevo producto'}
        description="Los cambios activos se reflejarán en la tienda pública."
      />

      <form
        onSubmit={submit}
        className="grid items-start gap-6 xl:grid-cols-[1fr_380px]"
      >
        <div className="grid gap-6">
          <Panel>
            <h2 className="font-display text-xl font-extrabold">
              Información general
            </h2>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-bold">
                Nombre

                <input
                  className={`${inputClass} mt-2`}
                  value={form.name}
                  onChange={(event) =>
                    update('name', event.target.value)
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
                    update(
                      'slug',
                      event.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                    )
                  }
                  required
                />
              </label>

              <label className="text-sm font-bold">
                Categoría

                <select
                  className={`${inputClass} mt-2`}
                  value={form.categoryId}
                  onChange={(event) =>
                    update('categoryId', event.target.value)
                  }
                  required
                >
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-bold">
                Distintivo

                <input
                  className={`${inputClass} mt-2`}
                  value={form.badge}
                  onChange={(event) =>
                    update('badge', event.target.value)
                  }
                  placeholder="Nuevo, Oferta..."
                />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Descripción corta

                <textarea
                  className={`${inputClass} mt-2 min-h-24 py-3`}
                  value={form.shortDescription}
                  onChange={(event) =>
                    update(
                      'shortDescription',
                      event.target.value,
                    )
                  }
                  required
                />
              </label>

              <label className="text-sm font-bold sm:col-span-2">
                Descripción completa

                <textarea
                  className={`${inputClass} mt-2 min-h-40 py-3`}
                  value={form.description}
                  onChange={(event) =>
                    update('description', event.target.value)
                  }
                  required
                />
              </label>
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-xl font-extrabold">
              Imágenes
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Súbelas a Cloudinary o pega una URL por línea.
              La primera será la imagen principal.
            </p>

            <div className="mt-5">
              <CloudinaryImageUploader
                folder="products"
                onUploaded={addImage}
                disabled={saving}
              />
            </div>

            {imageUrls.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="overflow-hidden rounded-xl border border-zinc-200 bg-white"
                  >
                    <div className="group relative bg-zinc-100">
                      <img
                        src={url}
                        alt={`${form.name || 'Producto'} ${index + 1}`}
                        className="aspect-square w-full object-cover"
                      />

                      {index === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-violet-700 px-2 py-1 text-[10px] font-extrabold text-white">
                          PRINCIPAL
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute bottom-2 right-2 grid size-9 place-items-center rounded-lg bg-white/95 text-red-600 shadow-sm hover:bg-red-50"
                        aria-label={`Eliminar imagen ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <label className="block p-2 text-[11px] font-bold text-zinc-600">
                      Asociar imagen

                      <select
                        className={`${inputClass} mt-1 min-h-9 px-2 py-1 text-xs`}
                        value={getImageOptionKey(url)}
                        onChange={(event) =>
                          assignImageOption(
                            url,
                            event.target.value,
                          )
                        }
                        disabled={saving}
                      >
                        <option value="">Imagen general</option>

                        {imageOptionChoices.map((choice) => (
                          <option
                            key={choice.key}
                            value={choice.key}
                          >
                            {choice.name}: {choice.value}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-5 block text-xs font-bold text-zinc-600">
              URLs de imágenes

              <textarea
                className={`${inputClass} mt-2 min-h-28 py-3 font-mono text-xs`}
                value={form.imagesText}
                onChange={(event) =>
                  update('imagesText', event.target.value)
                }
                placeholder="https://..."
                required
              />
            </label>
          </Panel>

          <Panel>
            <h2 className="font-display text-xl font-extrabold">
              Opciones
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Una opción por línea. Ejemplo:{' '}
              <strong>Color: Negro, Blanco</strong>
            </p>

            <textarea
              className={`${inputClass} mt-5 min-h-28 py-3 font-mono text-xs`}
              value={form.optionsText}
              onChange={(event) =>
                update('optionsText', event.target.value)
              }
              placeholder={
                'Color: Negro, Blanco\nTalla: S, M, L'
              }
            />
          </Panel>

          <Panel>
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-extrabold">
                  Variantes e inventario
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Relaciona opciones usando Color=Negro,
                  Talla=M. Los SKU se generan automáticamente.
                </p>
              </div>

              <button
                type="button"
                onClick={addVariant}
                className={secondaryButton}
              >
                <Plus size={17} />
                Variante
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              {variants.map((variant, index) => (
                <div
                  key={variant.id ?? `new-variant-${index}`}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs font-bold">
                      SKU

                      <div
                        className={`${inputClass} mt-1 flex items-center bg-zinc-100 text-zinc-500`}
                      >
                        {variant.sku ||
                          'Automático al guardar'}
                      </div>
                    </label>

                    <label className="text-xs font-bold">
                      Precio

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputClass} mt-1`}
                        value={variant.price}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            'price',
                            event.target.value,
                          )
                        }
                        required
                      />
                    </label>

                    <label className="text-xs font-bold">
                      Precio anterior

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={`${inputClass} mt-1`}
                        value={variant.previousPrice}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            'previousPrice',
                            event.target.value,
                          )
                        }
                      />
                    </label>

                    <label className="text-xs font-bold">
                      Stock

                      <input
                        type="number"
                        min="0"
                        step="1"
                        className={`${inputClass} mt-1`}
                        value={variant.stock}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            'stock',
                            event.target.value,
                          )
                        }
                        required
                      />
                    </label>

                    <label className="text-xs font-bold sm:col-span-2 lg:col-span-3">
                      Valores de opciones

                      <input
                        className={`${inputClass} mt-1`}
                        value={variant.valuesText}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            'valuesText',
                            event.target.value,
                          )
                        }
                        placeholder="Color=Negro, Talla=M"
                      />
                    </label>

                    <div className="flex items-end justify-between gap-3">
                      <label className="flex min-h-11 items-center gap-2 text-xs font-bold">
                        <input
                          type="radio"
                          name="default-variant"
                          checked={variant.isDefault}
                          onChange={() =>
                            selectDefaultVariant(index)
                          }
                        />

                        Principal
                      </label>

                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="grid size-10 place-items-center rounded-xl text-red-600 hover:bg-red-50"
                          aria-label={`Eliminar variante ${index + 1}`}
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 xl:sticky xl:top-8">
          <Panel>
            <h2 className="font-display text-xl font-extrabold">
              Publicación
            </h2>

            <div className="mt-5 grid gap-4">
              <label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 font-bold">
                <span>Producto activo</span>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    update('isActive', event.target.checked)
                  }
                  className="size-5 accent-violet-700"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4 font-bold">
                <span>Producto destacado</span>

                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(event) =>
                    update('featured', event.target.checked)
                  }
                  className="size-5 accent-violet-700"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className={`${primaryButton} mt-6 w-full`}
            >
              <Save size={18} />

              {saving
                ? 'Guardando...'
                : 'Guardar producto'}
            </button>
          </Panel>

          <Panel>
            <div className="flex items-start gap-3 text-sm leading-6 text-zinc-500">
              <ImagePlus
                size={20}
                className="mt-0.5 shrink-0 text-violet-700"
              />

              Las cargas se realizan mediante el backend
              autenticado. La clave secreta de Cloudinary nunca
              se envía al navegador.
            </div>
          </Panel>
        </div>
      </form>
    </>
  )
}




