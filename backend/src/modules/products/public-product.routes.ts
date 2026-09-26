import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma.js'
import { HttpError } from '../../lib/http-error.js'
import { productInclude, toProductDto } from './product.dto.js'

const router = Router()
const querySchema = z.object({
  category: z.string().trim().max(100).optional(),
  featured: z.enum(['true', 'false']).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
})

router.get('/', async (request, response) => {
  const query = querySchema.parse(request.query)
  const where = {
    isActive: true,
    category: { isActive: true, ...(query.category ? { slug: query.category } : {}) },
    ...(query.featured ? { featured: query.featured === 'true' } : {}),
    ...(query.search ? {
      OR: [
        { name: { contains: query.search, mode: 'insensitive' as const } },
        { shortDescription: { contains: query.search, mode: 'insensitive' as const } },
      ],
    } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.product.count({ where }),
  ])
  response.json({ data: { items: items.map(toProductDto), pagination: { page: query.page, limit: query.limit, total } } })
})

router.get('/:slug', async (request, response) => {
  const product = await prisma.product.findFirst({
    where: { slug: String(request.params.slug), isActive: true, category: { isActive: true } },
    include: productInclude,
  })
  if (!product) throw new HttpError(404, 'Producto no encontrado.', 'PRODUCT_NOT_FOUND')
  response.json({ data: { product: toProductDto(product) } })
})

export { router as publicProductRouter }
