import type { Prisma } from '@prisma/client'
import { HttpError } from '../../lib/http-error.js'
import type { ProductInput } from './product.schemas.js'
import { productInclude, toProductDto } from './product.dto.js'

export async function writeProductRelations(
  transaction: Prisma.TransactionClient,
  productId: string,
  input: ProductInput,
) {
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

  for (const [variantIndex, variant] of input.variants.entries()) {
    const createdVariant = await transaction.productVariant.create({
      data: {
        productId,
        sku: variant.sku,
        price: variant.price,
        previousPrice: variant.previousPrice,
        stock: variant.stock,
        isDefault: variant.isDefault || (input.variants.length === 1 && variantIndex === 0),
        isActive: variant.isActive,
      },
    })
    const ids = Object.entries(variant.values).map(([name, value]) => optionValueIds.get(`${name}\u0000${value}`))
    if (ids.some((id) => !id)) throw new HttpError(400, 'Una variante contiene opciones inválidas.', 'INVALID_VARIANT')
    if (ids.length) {
      await transaction.variantOptionValue.createMany({
        data: ids.map((optionValueId) => ({ variantId: createdVariant.id, optionValueId: optionValueId! })),
      })
    }
  }

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
