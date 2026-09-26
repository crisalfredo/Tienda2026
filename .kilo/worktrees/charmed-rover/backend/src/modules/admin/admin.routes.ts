import { Router } from 'express'
import argon2 from 'argon2'
import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'
import { z } from 'zod'
import { env } from '../../config/env.js'
import { prisma } from '../../lib/prisma.js'
import { HttpError } from '../../lib/http-error.js'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { requireCsrf } from '../../middleware/csrf.js'
import { validate } from '../../middleware/validate.js'
import { audit } from '../../utils/audit.js'

const router = Router()
router.use(authenticate, authorize('ADMIN', 'SUPERADMIN'))

router.get('/dashboard', async (_request, response) => {
  const [products, categories, pendingOrders, lowStock, recentOrders, confirmedTotals] = await prisma.$transaction([
    prisma.product.count({ where: { isActive: true } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.order.count({ where: { status: 'AWAITING_CONFIRMATION' } }),
    prisma.productVariant.count({ where: { isActive: true, stock: { lte: 5 } } }),
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.order.aggregate({
      where: { status: { in: ['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { total: true },
    }),
  ])
  response.json({
    data: {
      metrics: { products, categories, pendingOrders, lowStock, confirmedSales: Number(confirmedTotals._sum.total ?? 0) },
      recentOrders: recentOrders.map((order) => ({ ...order, subtotal: Number(order.subtotal), deliveryFee: Number(order.deliveryFee), total: Number(order.total) })),
    },
  })
})

router.get('/inventory', async (_request, response) => {
  const variants = await prisma.productVariant.findMany({
    include: { product: true, values: { include: { optionValue: { include: { option: true } } } } },
    orderBy: [{ stock: 'asc' }, { product: { name: 'asc' } }],
    take: 500,
  })
  response.json({ data: { variants: variants.map((variant) => ({
    id: variant.id,
    productId: variant.productId,
    productName: variant.product.name,
    sku: variant.sku,
    stock: variant.stock,
    isActive: variant.isActive,
    values: Object.fromEntries(variant.values.map(({ optionValue }) => [optionValue.option.name, optionValue.value])),
  })) } })
})

router.patch('/inventory/:id', requireCsrf, validate(z.object({ stock: z.number().int().min(0).max(1000000) })), async (request, response) => {
  const before = await prisma.productVariant.findUnique({ where: { id: String(request.params.id) } })
  if (!before) throw new HttpError(404, 'Variante no encontrada.', 'VARIANT_NOT_FOUND')
  const variant = await prisma.productVariant.update({ where: { id: before.id }, data: { stock: request.body.stock } })
  await audit(request, 'STOCK_UPDATE', 'PRODUCT_VARIANT', variant.id, { stock: before.stock }, { stock: variant.stock })
  response.json({ data: { variant } })
})

const settingsSchema = z.object({
  storeName: z.string().trim().min(2).max(100),
  whatsappNumber: z.string().trim().min(8).max(30),
  supportMessage: z.string().trim().min(2).max(180),
  deliveryMessage: z.string().trim().min(2).max(180),
})

router.get('/settings', async (_request, response) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } })
  response.json({ data: { settings } })
})

router.put('/settings', authorize('SUPERADMIN'), requireCsrf, validate(settingsSchema), async (request, response) => {
  const before = await prisma.storeSettings.findUnique({ where: { id: 1 } })
  const settings = await prisma.storeSettings.upsert({ where: { id: 1 }, update: request.body, create: { id: 1, ...request.body } })
  await audit(request, 'UPDATE', 'STORE_SETTINGS', '1', before ?? undefined, settings)
  response.json({ data: { settings } })
})

const adminSchema = z.object({
  name: z.string().trim().min(3).max(100),
  email: z.email().max(190).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(12).max(200),
  role: z.enum(['ADMIN', 'SUPERADMIN']).default('ADMIN'),
})

router.get('/users', authorize('SUPERADMIN'), async (_request, response) => {
  const users = await prisma.user.findMany({
    where: { role: { in: ['ADMIN', 'SUPERADMIN'] } },
    select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
  response.json({ data: { users } })
})

router.post('/users', authorize('SUPERADMIN'), requireCsrf, validate(adminSchema), async (request, response) => {
  const { password, ...data } = request.body as z.infer<typeof adminSchema>
  const user = await prisma.user.create({
    data: { ...data, passwordHash: await argon2.hash(password, { type: argon2.argon2id }) },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  })
  await audit(request, 'CREATE', 'ADMIN_USER', user.id, undefined, user)
  response.status(201).json({ data: { user } })
})

router.patch('/users/:id/status', authorize('SUPERADMIN'), requireCsrf, validate(z.object({ isActive: z.boolean() })), async (request, response) => {
  if (String(request.params.id) === request.admin!.id && request.body.isActive === false) {
    throw new HttpError(409, 'No puedes desactivar tu propia cuenta.', 'SELF_DEACTIVATION')
  }
  const before = await prisma.user.findUnique({ where: { id: String(request.params.id) } })
  if (!before || before.role === 'CUSTOMER') throw new HttpError(404, 'Administrador no encontrado.', 'ADMIN_NOT_FOUND')
  const user = await prisma.user.update({ where: { id: before.id }, data: { isActive: request.body.isActive } })
  await audit(request, 'STATUS_UPDATE', 'ADMIN_USER', user.id, { isActive: before.isActive }, { isActive: user.isActive })
  response.json({ data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive } } })
})

router.get('/audit', authorize('SUPERADMIN'), async (_request, response) => {
  const logs = await prisma.auditLog.findMany({
    include: { actor: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 300,
  })
  response.json({ data: { logs } })
})

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
  },
})

router.post('/uploads', requireCsrf, upload.single('image'), async (request, response) => {
  if (!request.file) throw new HttpError(400, 'Selecciona una imagen JPG, PNG o WebP.', 'IMAGE_REQUIRED')
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new HttpError(503, 'La carga de imágenes todavía no está configurada.', 'UPLOAD_NOT_CONFIGURED')
  }
  cloudinary.config({ cloud_name: env.CLOUDINARY_CLOUD_NAME, api_key: env.CLOUDINARY_API_KEY, api_secret: env.CLOUDINARY_API_SECRET })
  const uploaded = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'urbano-sv/products', resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => error || !result ? reject(error ?? new Error('No se recibió resultado')) : resolve(result),
    )
    stream.end(request.file!.buffer)
  })
  await audit(request, 'UPLOAD', 'IMAGE', uploaded.public_id, undefined, { url: uploaded.secure_url })
  response.status(201).json({ data: { url: uploaded.secure_url, publicId: uploaded.public_id } })
})

export { router as adminRouter }
