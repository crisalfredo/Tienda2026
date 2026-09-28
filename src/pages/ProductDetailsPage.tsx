import {
  ArrowLeft,
  Check,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  useParams,
} from 'react-router-dom'

import { ProductGrid } from '../components/product/ProductGrid'
import { useCart } from '../context/CartContext'
import { useCatalog } from '../context/CatalogContext'
import type {
  ProductMedia,
  SelectedOptions,
} from '../types'
import { formatCurrency } from '../utils/currency'
import {
  findExactVariant,
  getInitialOptions,
  getMediaForOptions,
  getOptionsForMedia,
  getPrimaryImage,
  getProductMedia,
  isOptionValueAvailable,
  mediaMatchesOptions,
} from '../utils/ProductSelection'

export function ProductDetailsPage() {
  const { slug } = useParams()
  const {
    getProductBySlug,
    products,
    loading,
  } = useCatalog()

  const product = getProductBySlug(slug)
  const { addItem } = useCart()

  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] =
    useState<SelectedOptions>({})
  const [activeImage, setActiveImage] = useState('')
  const [added, setAdded] = useState(false)

  const allMedia = useMemo(
    () => (product ? getProductMedia(product) : []),
    [product],
  )

  const selectedVariant = useMemo(
    () =>
      product
        ? findExactVariant(product, selectedOptions)
        : undefined,
    [product, selectedOptions],
  )

  const selectedMedia = useMemo(
    () =>
      product
        ? getMediaForOptions(product, selectedOptions)
        : [],
    [product, selectedOptions],
  )

  /*
   * Al cambiar de producto inicializamos una combinación válida
   * y mostramos la imagen correspondiente a esa combinación.
   */
  useEffect(() => {
    if (!product) {
      return
    }

    const initialOptions = getInitialOptions(product)

    setQuantity(1)
    setSelectedOptions(initialOptions)
    setActiveImage(
      getPrimaryImage(product, initialOptions),
    )
    setAdded(false)
  }, [product])

  const currentStock =
    selectedVariant?.stock ??
    (product?.variants?.length
      ? 0
      : product?.stock ?? 0)

  useEffect(() => {
    setQuantity((current) =>
      currentStock > 0
        ? Math.min(
            Math.max(1, current),
            currentStock,
          )
        : 1,
    )
  }, [currentStock])

  if (loading) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center text-zinc-500">
        Cargando producto...
      </section>
    )
  }

  if (!product) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">
          Producto no encontrado
        </h1>

        <Link
          to="/"
          className="mt-6 inline-flex font-bold text-violet-700"
        >
          Volver al inicio
        </Link>
      </section>
    )
  }

  const relatedProducts = products
    .filter(
      (item) =>
        item.categorySlug === product.categorySlug &&
        item.id !== product.id,
    )
    .slice(0, 4)

  const hasConfiguredVariants = Boolean(
    product.variants?.length,
  )

  const validSelection =
    !hasConfiguredVariants ||
    Boolean(selectedVariant)

  const canAdd =
    validSelection &&
    currentStock > 0

  const activeMedia =
    allMedia.find(
      (item) => item.url === activeImage,
    ) ??
    selectedMedia[0] ??
    allMedia[0]

  const selectOption = (
    optionName: string,
    optionValue: string,
  ) => {
    if (
      !isOptionValueAvailable(
        product,
        selectedOptions,
        optionName,
        optionValue,
      )
    ) {
      return
    }

    const nextOptions = {
      ...selectedOptions,
      [optionName]: optionValue,
    }

    setSelectedOptions(nextOptions)
    setActiveImage(
      getPrimaryImage(product, nextOptions),
    )
    setAdded(false)
  }

  const selectMedia = (media: ProductMedia) => {
    const nextOptions = getOptionsForMedia(
      product,
      selectedOptions,
      media,
    )

    setSelectedOptions(nextOptions)
    setActiveImage(media.url)
    setAdded(false)
  }

  const handleAdd = () => {
    if (!canAdd || !selectedVariant) {
      return
    }

    /*
     * Solamente conservamos activeImage si está relacionada con
     * las opciones seleccionadas. Esto evita guardar una imagen
     * amarilla con la variante verde.
     */
    const cartImage = mediaMatchesOptions(
      activeMedia,
      selectedOptions,
    )
      ? activeMedia!.url
      : getPrimaryImage(
          product,
          selectedOptions,
        )

    addItem(product, {
      quantity,
      selectedOptions,
      variantId: selectedVariant.id,
      image: cartImage,
    })

    setAdded(true)

    window.setTimeout(() => {
      setAdded(false)
    }, 1800)
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <Link
          to={`/categoria/${product.categorySlug}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-zinc-500 transition hover:text-violet-700"
        >
          <ArrowLeft size={17} />
          Volver a la categoría
        </Link>

        <div className="mt-8 grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0 lg:sticky lg:top-28">
            <div className="grid gap-4 sm:grid-cols-[76px_minmax(0,1fr)]">
              {allMedia.length > 1 && (
                <div
                  className="order-2 flex gap-3 overflow-x-auto pb-1 sm:order-1 sm:max-h-[36rem] sm:flex-col sm:overflow-y-auto sm:overflow-x-hidden"
                  aria-label="Galería de imágenes"
                >
                  {allMedia.map((media, index) => {
                    const selected =
                      media.url ===
                      (
                        activeImage ||
                        allMedia[0]?.url
                      )

                    const optionLabel = media.option
                      ? `${media.option.name}: ${media.option.value}`
                      : `Imagen ${index + 1}`

                    return (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() =>
                          selectMedia(media)
                        }
                        className={`size-18 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1.5 transition ${
                          selected
                            ? 'border-violet-700 ring-2 ring-violet-100'
                            : 'border-zinc-200 hover:border-violet-300'
                        }`}
                        aria-label={`Seleccionar ${optionLabel} de ${product.name}`}
                        aria-pressed={selected}
                      >
                        <img
                          src={media.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-contain"
                        />
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="order-1 aspect-square min-w-0 overflow-hidden rounded-[2rem] border border-zinc-100 bg-white p-4 sm:order-2 sm:p-8">
                <img
                  src={
                    activeImage ||
                    selectedMedia[0]?.url ||
                    product.image
                  }
                  alt={
                    activeMedia?.altText ||
                    product.name
                  }
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[.12em] text-violet-700">
              {product.categorySlug}
            </p>

            <h1 className="mt-3 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              {product.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold">
                {formatCurrency(
                  selectedVariant?.price ??
                    product.price,
                )}
              </span>

              {(selectedVariant?.previousPrice ??
                product.previousPrice) && (
                <span className="text-lg text-zinc-400 line-through">
                  {formatCurrency(
                    (
                      selectedVariant?.previousPrice ??
                      product.previousPrice
                    )!,
                  )}
                </span>
              )}
            </div>

            <p className="mt-6 whitespace-pre-line text-base leading-7 text-zinc-600">
              {product.description}
            </p>

            {(product.options ?? []).map(
              (option) => (
                <fieldset
                  key={option.name}
                  className="mt-7"
                >
                  <legend className="font-bold">
                    {option.name}
                  </legend>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const selected =
                        selectedOptions[
                          option.name
                        ] === value

                      const available =
                        isOptionValueAvailable(
                          product,
                          selectedOptions,
                          option.name,
                          value,
                        )

                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            selectOption(
                              option.name,
                              value,
                            )
                          }
                          disabled={!available}
                          className={`min-h-11 rounded-full border px-4 text-sm font-bold transition ${
                            selected
                              ? 'border-violet-700 bg-violet-700 text-white'
                              : 'border-zinc-200 bg-white hover:border-violet-300'
                          } disabled:cursor-not-allowed disabled:border-zinc-100 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:line-through`}
                          aria-pressed={selected}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>
                </fieldset>
              ),
            )}

            {!validSelection && (
              <p
                role="alert"
                className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-medium text-amber-900"
              >
                Esta combinación no está
                disponible. Selecciona otra
                opción para continuar.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-13 items-center justify-between rounded-full border border-zinc-200 bg-white px-2">
                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full hover:bg-zinc-100"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1),
                    )
                  }
                  aria-label="Reducir cantidad"
                >
                  <Minus size={18} />
                </button>

                <span className="min-w-10 text-center font-bold">
                  {quantity}
                </span>

                <button
                  type="button"
                  className="grid size-10 place-items-center rounded-full hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.min(
                        currentStock,
                        current + 1,
                      ),
                    )
                  }
                  disabled={
                    !canAdd ||
                    quantity >= currentStock
                  }
                  aria-label="Aumentar cantidad"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!canAdd}
                className="inline-flex min-h-13 flex-1 items-center justify-center gap-2 rounded-full bg-violet-700 px-6 font-bold text-white shadow-xl shadow-violet-700/20 transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:shadow-none"
              >
                {added
                  ? <Check size={20} />
                  : <ShoppingBag size={20} />}

                {!validSelection
                  ? 'Selecciona una combinación disponible'
                  : currentStock < 1
                    ? 'Agotado'
                    : added
                      ? 'Agregado al carrito'
                      : 'Agregar al carrito'}
              </button>
            </div>

            <p className="mt-3 text-sm text-zinc-500">
              {currentStock > 0
                ? `${currentStock} unidades disponibles`
                : 'Sin existencias'}
            </p>

            <div className="mt-8 grid gap-3 border-t border-zinc-200 pt-7 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <Truck
                  size={20}
                  className="text-violet-700"
                />
                Entrega coordinada
              </div>

              <div className="flex items-center gap-3 text-sm text-zinc-600">
                <ShieldCheck
                  size={20}
                  className="text-violet-700"
                />
                Atención personalizada
              </div>
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-9 font-display text-3xl font-extrabold tracking-tight">
              También puede interesarte
            </h2>

            <ProductGrid
              products={relatedProducts}
            />
          </div>
        </section>
      )}
    </>
  )
}

