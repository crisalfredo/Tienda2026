import type {
  Product,
  ProductMedia,
  ProductVariant,
  SelectedOptions,
} from '../types'

export function getDefaultVariant(
  product: Product,
): ProductVariant | undefined {
  const activeVariants = (product.variants ?? []).filter(
    (variant) => variant.isActive,
  )

  return (
    activeVariants.find(
      (variant) => variant.isDefault && variant.stock > 0,
    ) ??
    activeVariants.find((variant) => variant.stock > 0) ??
    activeVariants.find((variant) => variant.isDefault) ??
    activeVariants[0]
  )
}

export function getInitialOptions(
  product: Product,
): SelectedOptions {
  const defaultVariant = getDefaultVariant(product)

  if (defaultVariant) {
    return { ...defaultVariant.values }
  }

  return (product.options ?? []).reduce<SelectedOptions>(
    (values, option) => {
      if (option.values[0]) {
        values[option.name] = option.values[0]
      }

      return values
    },
    {},
  )
}

export function findExactVariant(
  product: Product,
  selectedOptions: SelectedOptions,
): ProductVariant | undefined {
  const optionNames = (product.options ?? []).map(
    (option) => option.name,
  )

  return (product.variants ?? []).find(
    (variant) =>
      variant.isActive &&
      optionNames.every(
        (name) =>
          Boolean(selectedOptions[name]) &&
          variant.values[name] === selectedOptions[name],
      ),
  )
}

export function isOptionValueAvailable(
  product: Product,
  selectedOptions: SelectedOptions,
  optionName: string,
  optionValue: string,
) {
  const variants = product.variants ?? []

  if (!variants.length) {
    return true
  }

  return variants.some((variant) => {
    if (
      !variant.isActive ||
      variant.stock < 1 ||
      variant.values[optionName] !== optionValue
    ) {
      return false
    }

    return Object.entries(selectedOptions).every(
      ([name, value]) =>
        name === optionName ||
        !value ||
        variant.values[name] === value,
    )
  })
}

export function getProductMedia(
  product: Product,
): ProductMedia[] {
  if (product.media?.length) {
    return [...product.media].sort(
      (left, right) => left.sortOrder - right.sortOrder,
    )
  }

  const uniqueUrls = [
    ...new Set(
      [...(product.images ?? []), product.image].filter(Boolean),
    ),
  ]

  return uniqueUrls.map((url, index) => ({
    id: `legacy-${product.id}-${index}`,
    url,
    altText: product.name,
    sortOrder: index,
    option: null,
  }))
}

export function getMediaForOptions(
  product: Product,
  selectedOptions: SelectedOptions,
): ProductMedia[] {
  const media = getProductMedia(product)

  const generalMedia = media.filter(
    (item) => !item.option,
  )

  const matchingMedia = media.filter(
    (item) =>
      item.option &&
      selectedOptions[item.option.name] === item.option.value,
  )

  /*
   * Las imágenes relacionadas con la variante aparecen primero.
   * Las imágenes generales permanecen disponibles después.
   */
  if (matchingMedia.length > 0) {
    const seen = new Set<string>()

    return [...matchingMedia, ...generalMedia].filter((item) => {
      if (seen.has(item.url)) {
        return false
      }

      seen.add(item.url)
      return true
    })
  }

  /*
   * Si todavía no existen asociaciones, mostramos las generales.
   * No inferimos colores por posición porque puede producir pedidos
   * con imágenes incorrectas.
   */
  if (generalMedia.length > 0) {
    return generalMedia
  }

  return media
}

export function getPrimaryImage(
  product: Product,
  selectedOptions: SelectedOptions = {},
) {
  return (
    getMediaForOptions(product, selectedOptions)[0]?.url ??
    product.image
  )
}

export function mediaMatchesOptions(
  media: ProductMedia | undefined,
  selectedOptions: SelectedOptions,
) {
  if (!media?.option) {
    return false
  }

  return (
    selectedOptions[media.option.name] === media.option.value
  )
}

/**
 * Seleccionar una miniatura también selecciona su opción relacionada.
 *
 * Si existen varias opciones y la combinación actual no existe,
 * buscamos una variante válida que contenga el valor relacionado
 * con la imagen.
 */
export function getOptionsForMedia(
  product: Product,
  currentOptions: SelectedOptions,
  media: ProductMedia,
): SelectedOptions {
  if (!media.option) {
    return { ...currentOptions }
  }

  const nextOptions: SelectedOptions = {
    ...currentOptions,
    [media.option.name]: media.option.value,
  }

  const exactVariant = findExactVariant(product, nextOptions)

  if (exactVariant) {
    return { ...exactVariant.values }
  }

  const matchingVariants = (product.variants ?? []).filter(
    (variant) =>
      variant.isActive &&
      variant.values[media.option!.name] ===
        media.option!.value,
  )

  const availableVariant =
    matchingVariants.find((variant) => variant.stock > 0) ??
    matchingVariants[0]

  return availableVariant
    ? { ...availableVariant.values }
    : nextOptions
}