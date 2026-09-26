import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { HttpError } from '../../lib/http-error.js'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { requireCsrf } from '../../middleware/csrf.js'
import { validate } from '../../middleware/validate.js'
import { audit } from '../../utils/audit.js'

const router = Router()
const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(100),
  skuPrefix: z.string().trim().min(2).max(5).regex(/^[A-Za-z0-9]+$/, 'Usa únicamente letras y números.').transform((value) => value.toUpperCase()),
  description: z.string().trim().min(10).max(300),
  imageUrl: z.url().max(2000),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

router.get('/public', async (_request, response) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  response.json({ data: { categories } })
})

router.use('/admin', authenticate, authorize('ADMIN', 'SUPERADMIN'))

router.get('/admin', async (_request, response) => {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })
  response.json({ data: { categories } })
})

router.post('/admin', requireCsrf, validate(categorySchema), async (request, response) => {
  const category = await prisma.category.create({ data: request.body })
  await audit(request, 'CREATE', 'CATEGORY', category.id, undefined, category)
  response.status(201).json({ data: { category } })
})

router.put('/admin/:id', requireCsrf, validate(categorySchema), async (request, response) => {
  const before = await prisma.category.findUnique({ where: { id: String(request.params.id) } })
  if (!before) throw new HttpError(404, 'Categoría no encontrada.', 'CATEGORY_NOT_FOUND')
  if (before.skuPrefix !== request.body.skuPrefix) {
    const productCount = await prisma.product.count({ where: { categoryId: before.id } })
    if (productCount > 0) {
      throw new HttpError(409, 'El prefijo SKU no puede cambiar porque la categoría ya tiene productos.', 'SKU_PREFIX_IN_USE')
    }
  }
  const category = await prisma.category.update({ where: { id: before.id }, data: request.body })
  await audit(request, 'UPDATE', 'CATEGORY', category.id, before, category)
  response.json({ data: { category } })
})

router.delete('/admin/:id', requireCsrf, async (request, response) => {
  const before = await prisma.category.findUnique({ where: { id: String(request.params.id) } })
  if (!before) throw new HttpError(404, 'Categoría no encontrada.', 'CATEGORY_NOT_FOUND')
  const category = await prisma.category.update({ where: { id: before.id }, data: { isActive: false } })
  await audit(request, 'ARCHIVE', 'CATEGORY', category.id, before, category)
  response.json({ data: { category } })
})

export { router as categoryRouter }
