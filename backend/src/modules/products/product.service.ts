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
  const existingVariants = await transaction.productVariant.findMany({
    where: { productId },
  })

  const existingById = new Map(
    existingVariants.map((variant) => [variant.id, variant]),
  )

  const existingBySku = new Map(
    existingVariants.map((variant) => [variant.sku, variant]),
  )

  /*
   * Las opciones se reconstruyen porque pueden haber cambiado.
   * Los productos, variantes y pedidos mantienen sus identificadores.
   */
  await transaction.variantOptionValue.deleteMany({
    where: {
      variant: {
        productId,
      },
    },
  })

  await transaction.optionValue.deleteMany({
    where: {
      option: {
        productId,
      },
    },
  })

  await transaction.productOption.deleteMany({
    where: {
      productId,
    },
  })

  const optionValueIds = new Map<string, string>()

  for (const [optionIndex, option] of input.options.entries()) {
    const createdOption = await transaction.productOption.create({
      data: {
        productId,
        name: option.name,
        sortOrder: optionIndex,
      },
    })

    for (const [valueIndex, value] of option.values.entries()) {
      const createdValue = await transaction.optionValue.create({
        data: {
          optionId: createdOption.id,
          value,
          sortOrder: valueIndex,
        },
      })

      optionValueIds.set(
        `${option.name}\u0000${value}`,
        createdValue.id,
      )
    }
  }

  const optionNames = input.options.map((option) => option.name)

  /*
   * Aunque el frontend falle y envíe varias variantes como principales,
   * el backend seleccionará exactamente una.
   */
  const requestedDefaultIndex = input.variants.findIndex(
    (variant) => variant.isDefault,
  )

  const defaultVariantIndex =
    requestedDefaultIndex >= 0 ? requestedDefaultIndex : 0

  const retainedVariantIds = new Set<string>()
  const generatedSkus = new Set<string>()

  for (const [variantIndex, variant] of input.variants.entries()) {
    const isDefault = variantIndex === defaultVariantIndex

    let savedVariant: {
      id: string
      sku: string
    }

    /*
     * Variante existente:
     * conserva su SKU y solamente actualiza inventario, precio y estado.
     */
    if (variant.id) {
      const existing = existingById.get(variant.id)

      if (!existing) {
        throw new HttpError(
          400,
          'Una variante no pertenece a este producto.',
          'INVALID_VARIANT_ID',
        )
      }

      if (retainedVariantIds.has(existing.id)) {
        throw new HttpError(
          400,
          'La misma variante fue enviada más de una vez.',
          'DUPLICATE_VARIANT',
        )
      }

      savedVariant = await transaction.productVariant.update({
        where: {
          id: existing.id,
        },
        data: {
          price: variant.price,
          previousPrice: variant.previousPrice,
          stock: variant.stock,
          isDefault,
          isActive: variant.isActive,
        },
      })
    } else {
      /*
       * Variante nueva:
       * el SKU se genera exclusivamente en el backend.
       */
      const generatedSku = buildVariantSku(
        skuBase,
        variant.values,
        optionNames,
      )

      if (generatedSkus.has(generatedSku)) {
        throw new HttpError(
          400,
          'Hay dos variantes con la misma combinación de opciones.',
          'DUPLICATE_VARIANT_COMBINATION',
        )
      }

      generatedSkus.add(generatedSku)

      /*
       * Si la combinación existía anteriormente pero estaba inactiva,
       * reutilizamos su identidad y su SKU.
       */
      const reusable = existingBySku.get(generatedSku)

      if (reusable) {
        if (retainedVariantIds.has(reusable.id)) {
          throw new HttpError(
            400,
            'Hay dos variantes con la misma combinación de opciones.',
            'DUPLICATE_VARIANT_COMBINATION',
          )
        }

        savedVariant = await transaction.productVariant.update({
          where: {
            id: reusable.id,
          },
          data: {
            price: variant.price,
            previousPrice: variant.previousPrice,
            stock: variant.stock,
            isDefault,
            isActive: variant.isActive,
          },
        })
      } else {
        savedVariant = await transaction.productVariant.create({
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
    }

    retainedVariantIds.add(savedVariant.id)

    /*
     * Cada variante debe seleccionar exactamente un valor
     * de cada opción declarada.
     */
    const variantValueNames = Object.keys(variant.values)

    const hasExactOptionSelection =
      variantValueNames.length === optionNames.length &&
      optionNames.every((optionName) => {
        const selectedValue = variant.values[optionName]

        return (
          typeof selectedValue === 'string' &&
          selectedValue.length > 0 &&
          optionValueIds.has(`${optionName}\u0000${selectedValue}`)
        )
      })

    if (!hasExactOptionSelection) {
      throw new HttpError(
        400,
        'Una variante contiene opciones inválidas o incompletas.',
        'INVALID_VARIANT',
      )
    }

    const selectedOptionValueIds = optionNames.map((optionName) => {
      const selectedValue = variant.values[optionName]

      return optionValueIds.get(
        `${optionName}\u0000${selectedValue}`,
      )!
    })

    if (selectedOptionValueIds.length > 0) {
      await transaction.variantOptionValue.createMany({
        data: selectedOptionValueIds.map((optionValueId) => ({
          variantId: savedVariant.id,
          optionValueId,
        })),
      })
    }
  }

  /*
   * Las variantes eliminadas desde el formulario no se borran,
   * porque podrían estar relacionadas con pedidos anteriores.
   */
  const removedVariantIds = existingVariants
    .filter((variant) => !retainedVariantIds.has(variant.id))
    .map((variant) => variant.id)

  if (removedVariantIds.length > 0) {
    await transaction.productVariant.updateMany({
      where: {
        id: {
          in: removedVariantIds,
        },
      },
      data: {
        isActive: false,
        isDefault: false,
      },
    })
  }

  /*
   * Actualización de imágenes.
   */
  await transaction.productImage.deleteMany({
    where: {
      productId,
    },
  })

  if (input.images.length > 0) {
    const imageData = input.images.map((image, index) => {
      let optionValueId: string | null = null

      if (image.option) {
        const optionKey = `${image.option.name}\u0000${image.option.value}`
        const resolvedOptionValueId = optionValueIds.get(optionKey)

        if (!resolvedOptionValueId) {
          throw new HttpError(
            400,
            `La asociación de imagen ${image.option.name}: ${image.option.value} no existe.`,
            'INVALID_IMAGE_OPTION',
          )
        }

        optionValueId = resolvedOptionValueId
      }

      return {
        productId,
        optionValueId,
        url: image.url,
        altText: image.altText || input.name,
        sortOrder: image.sortOrder ?? index,
      }
    })

    await transaction.productImage.createMany({
      data: imageData,
    })
  }
}

export async function readProduct(
  transaction: Prisma.TransactionClient,
  productId: string,
) {
  const product = await transaction.product.findUnique({
    where: {
      id: productId,
    },
    include: productInclude,
  })

  if (!product) {
    throw new HttpError(
      404,
      'Producto no encontrado.',
      'PRODUCT_NOT_FOUND',
    )
  }

  return toProductDto(product)
}

