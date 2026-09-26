import { Prisma } from '@prisma/client'

export const productInclude = {
  category: true,
  images: { orderBy: { sortOrder: 'asc' as const } },
  options: { include: { values: { orderBy: { sortOrder: 'asc' as const } } }, orderBy: { sortOrder: 'asc' as const } },
  variants: {
    where: { isActive: true },
    include: { values: { include: { optionValue: { include: { option: true } } } } },
    orderBy: [{ isDefault: 'desc' as const }, { createdAt: 'asc' as const }],
  },
} satisfies Prisma.ProductInclude

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>

export function toProductDto(product: ProductWithRelations) {
  const primaryVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0]
  const primaryImage = product.images[0]?.url ?? ''

  return {
    id: product.id,
    categoryId: product.categoryId,
    categorySlug: product.category.slug,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription,
    description: product.description,
    badge: product.badge,
    featured: product.featured,
    isActive: product.isActive,
    image: primaryImage,
    images: product.images.map((image) => image.url),
    price: Number(primaryVariant?.price ?? 0),
    previousPrice: primaryVariant?.previousPrice ? Number(primaryVariant.previousPrice) : undefined,
    stock: product.variants.reduce((total, variant) => total + variant.stock, 0),
    options: product.options.map((option) => ({
      name: option.name,
      values: option.values.map((value) => value.value),
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      price: Number(variant.price),
      previousPrice: variant.previousPrice ? Number(variant.previousPrice) : undefined,
      stock: variant.stock,
      isDefault: variant.isDefault,
      isActive: variant.isActive,
      values: Object.fromEntries(
        variant.values.map(({ optionValue }) => [optionValue.option.name, optionValue.value]),
      ),
    })),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  }
}
