import { Router } from 'express'
import { prisma } from '../../lib/prisma.js'
import { HttpError } from '../../lib/http-error.js'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { requireCsrf } from '../../middleware/csrf.js'
import { validate } from '../../middleware/validate.js'
import { audit } from '../../utils/audit.js'
import { productInclude, toProductDto } from './product.dto.js'
import { productInputSchema, type ProductInput } from './product.schemas.js'
import { readProduct, writeProductRelations } from './product.service.js'

const router = Router()

const productTransactionOptions = {
  maxWait: 10_000,
  timeout: 60_000,
}

router.use(authenticate, authorize('ADMIN', 'SUPERADMIN'))

router.get('/', async (request, response) => {
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : ''
  const products = await prisma.product.findMany({
    where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
    include: productInclude,
    orderBy: { updatedAt: 'desc' },
    take: 200,
  })
  response.json({ data: { products: products.map(toProductDto) } })
})

router.get('/:id', async (request, response) => {
  const product = await prisma.product.findUnique({ where: { id: String(request.params.id) }, include: productInclude })
  if (!product) throw new HttpError(404, 'Producto no encontrado.', 'PRODUCT_NOT_FOUND')
  response.json({ data: { product: toProductDto(product) } })
})

router.post('/', requireCsrf, validate(productInputSchema), async (request, response) => {
  const input = request.body as ProductInput
  const product = await prisma.$transaction(async (transaction) => {
    const created = await transaction.product.create({
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        shortDescription: input.shortDescription,
        description: input.description,
        badge: input.badge,
        featured: input.featured,
        isActive: input.isActive,
      },
    })
    await writeProductRelations(transaction, created.id, input)
    return readProduct(transaction, created.id)
}, productTransactionOptions)


  await audit(request, 'CREATE', 'PRODUCT', product.id, undefined, product)
  response.status(201).json({ data: { product } })
})

router.put('/:id', requireCsrf, validate(productInputSchema), async (request, response) => {
  const input = request.body as ProductInput
  const before = await prisma.product.findUnique({ where: { id: String(request.params.id) }, include: productInclude })
  if (!before) throw new HttpError(404, 'Producto no encontrado.', 'PRODUCT_NOT_FOUND')

  const product = await prisma.$transaction(async (transaction) => {
    await transaction.variantOptionValue.deleteMany({ where: { variant: { productId: before.id } } })
    await transaction.productVariant.deleteMany({ where: { productId: before.id } })
    await transaction.optionValue.deleteMany({ where: { option: { productId: before.id } } })
    await transaction.productOption.deleteMany({ where: { productId: before.id } })
    await transaction.productImage.deleteMany({ where: { productId: before.id } })
    await transaction.product.update({
      where: { id: before.id },
      data: {
        categoryId: input.categoryId,
        name: input.name,
        slug: input.slug,
        shortDescription: input.shortDescription,
        description: input.description,
        badge: input.badge,
        featured: input.featured,
        isActive: input.isActive,
      },
    })
    await writeProductRelations(transaction, before.id, input)
    return readProduct(transaction, before.id)
}, productTransactionOptions)


  await audit(request, 'UPDATE', 'PRODUCT', product.id, toProductDto(before), product)
  response.json({ data: { product } })
})

router.delete('/:id', requireCsrf, async (request, response) => {
  const before = await prisma.product.findUnique({ where: { id: String(request.params.id) } })
  if (!before) throw new HttpError(404, 'Producto no encontrado.', 'PRODUCT_NOT_FOUND')
  const product = await prisma.product.update({ where: { id: before.id }, data: { isActive: false } })
  await audit(request, 'ARCHIVE', 'PRODUCT', product.id, before, product)
  response.json({ data: { product } })
})

export { router as adminProductRouter }
