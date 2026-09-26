import type { Prisma } from '@prisma/client'
import { HttpError } from '../../lib/http-error.js'
import type { ProductInput } from './product.schemas.js'
import { productInclude, toProductDto } from './product.dto.js'
import { buildVariantSku } from './sku.service.js'

export async function writeProductRelations(
  transaction: Prisma.TransactionClient,
  productId: string,
  skuBase: string,
  input: ProductInput,
) {
  const existingVariants = await transaction.productVariant.findMany({ where: { productId } })
  const existingById = new Map(existingVariants.map((variant) => [variant.id, variant]))

  // Rebuild selectable options while keeping variant and order identities stable.
  await transaction.variantOptionValue.deleteMany({ where: { variant: { productId } } })
  await transaction.optionValue.deleteMany({ where: { option: { productId } } })
  await transaction.productOption.deleteMany({ where: { productId } })

  const optionValueIds = new Map<string, string>()
  for (const [optionIndex, option] of input.options.entries()) {
    const createdOption = await transaction.productOption.create({
      data: { productId, name: option.name, sortOrder: optionIndex },
    })
    for (const [valueIndex, value] of option.values.entries()) {
      const createdValue = await transaction.optionValue.create({
        data: { optionId: createdOption.id, value, sortOrder: valueIndex },
      })
      optionValueIds.set(`${option.name}\u0000${value}`, createdValue.id)
    }
  }

  const optionNames = input.options.map((option) => option.name)
  const hasDefault = input.variants.some((variant) => variant.isDefault)
  const retainedVariantIds = new Set<string>()

  for (const [variantIndex, variant] of input.variants.entries()) {
    const isDefault = variant.isDefault || (!hasDefault && variantIndex === 0)
    let savedVariant

    if (variant.id) {
      const existing = existingById.get(variant.id)
      if (!existing) {
        throw new HttpError(400, 'Una variante no pertenece a este producto.', 'INVALID_VARIANT_ID')
      }
      savedVariant = await transaction.productVariant.update({
        where: { id: existing.id },
        data: {
          price: variant.price,
          previousPrice: variant.previousPrice,
          stock: variant.stock,
          isDefault,
          isActive: variant.isActive,
        },
      })
    } else {
      const generatedSku = buildVariantSku(skuBase, variant.values, optionNames)
      const reusable = existingVariants.find((existing) => existing.sku === generatedSku)
      savedVariant = reusable
        ? await transaction.productVariant.update({
          where: { id: reusable.id },
          data: {
            price: variant.price,
            previousPrice: variant.previousPrice,
            stock: variant.stock,
            isDefault,
            isActive: variant.isActive,
          },
        })
        : await transaction.productVariant.create({
          data: {
            productId,
            sku: generatedSku,
            price: variant.price,
            previousPrice: variant.previousPrice,
            stock: variant.stock,
            isDefault,
            isActive: variant.isActive,
          },
        })
    }

    retainedVariantIds.add(savedVariant.id)
    const ids = Object.entries(variant.values).map(([name, value]) => optionValueIds.get(`${name}\u0000${value}`))
    if (ids.some((id) => !id)) {
      throw new HttpError(400, 'Una variante contiene opciones inválidas.', 'INVALID_VARIANT')
    }
    if (ids.length) {
      await transaction.variantOptionValue.createMany({
        data: ids.map((optionValueId) => ({ variantId: savedVariant.id, optionValueId: optionValueId! })),
      })
    }
  }

  const removedVariantIds = existingVariants
    .filter((variant) => !retainedVariantIds.has(variant.id))
    .map((variant) => variant.id)
  if (removedVariantIds.length) {
    await transaction.productVariant.updateMany({
      where: { id: { in: removedVariantIds } },
      data: { isActive: false, isDefault: false },
    })
  }

  await transaction.productImage.deleteMany({ where: { productId } })
  await transaction.productImage.createMany({
    data: input.images.map((image, index) => ({
      productId,
      url: image.url,
      altText: image.altText || input.name,
      sortOrder: image.sortOrder ?? index,
    })),
  })
}

export async function readProduct(transaction: Prisma.TransactionClient, productId: string) {
  const product = await transaction.product.findUnique({ where: { id: productId }, include: productInclude })
  if (!product) throw new HttpError(404, 'Producto no encontrado.', 'PRODUCT_NOT_FOUND')
  return toProductDto(product)
}

