import type {
  Product,
  ProductMedia,
  ProductVariant,
  SelectedOptions,
} from '../types'

export function getDefaultVariant(product: Product): ProductVariant | undefined {
  const activeVariants = (product.variants ?? []).filter((variant) => variant.isActive)

  return activeVariants.find((variant) => variant.isDefault && variant.stock > 0)
    ?? activeVariants.find((variant) => variant.stock > 0)
    ?? activeVariants.find((variant) => variant.isDefault)
    ?? activeVariants[0]
}

export function getInitialOptions(product: Product): SelectedOptions {
  const defaultVariant = getDefaultVariant(product)
  if (defaultVariant) return { ...defaultVariant.values }

  return (product.options ?? []).reduce<SelectedOptions>((values, option) => {
    if (option.values[0]) values[option.name] = option.values[0]
    return values
  }, {})
}

export function findExactVariant(
  product: Product,
  selectedOptions: SelectedOptions,
): ProductVariant | undefined {
  const optionNames = (product.options ?? []).map((option) => option.name)

  return (product.variants ?? []).find((variant) =>
    variant.isActive
    && optionNames.every((name) => selectedOptions[name] && variant.values[name] === selectedOptions[name]),
  )
}

export function isOptionValueAvailable(
  product: Product,
  selectedOptions: SelectedOptions,
  optionName: string,
  optionValue: string,
) {
  const variants = product.variants ?? []
  if (!variants.length) return true

  return variants.some((variant) => {
    if (!variant.isActive || variant.stock < 1 || variant.values[optionName] !== optionValue) return false

    return Object.entries(selectedOptions).every(([name, value]) =>
      name === optionName || !value || variant.values[name] === value,
    )
  })
}

export function getProductMedia(product: Product): ProductMedia[] {
  if (product.media?.length) {
    return [...product.media].sort((left, right) => left.sortOrder - right.sortOrder)
  }

  const uniqueUrls = [...new Set([...(product.images ?? []), product.image].filter(Boolean))]
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
  const general = media.filter((item) => !item.option)
  const matching = media.filter((item) =>
    item.option && selectedOptions[item.option.name] === item.option.value,
  )

  if (!matching.length) return general.length ? general : media

  const seen = new Set<string>()
  return [...matching, ...general].filter((item) => {
    if (seen.has(item.url)) return false
    seen.add(item.url)
    return true
  })
}

export function getPrimaryImage(
  product: Product,
  selectedOptions: SelectedOptions = {},
) {
  return getMediaForOptions(product, selectedOptions)[0]?.url ?? product.image
}