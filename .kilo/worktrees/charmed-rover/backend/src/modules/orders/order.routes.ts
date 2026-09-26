import { Router } from 'express'
import { Prisma, type OrderStatus } from '@prisma/client'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { env } from '../../config/env.js'
import { prisma } from '../../lib/prisma.js'
import { HttpError } from '../../lib/http-error.js'
import { authenticate, authorize } from '../../middleware/authenticate.js'
import { requireCsrf } from '../../middleware/csrf.js'
import { validate } from '../../middleware/validate.js'
import { audit } from '../../utils/audit.js'

const router = Router()
const createOrderSchema = z.object({
  items: z.array(z.object({ variantId: z.uuid(), quantity: z.number().int().min(1).max(50) })).min(1).max(50),
  customer: z.object({
    name: z.string().trim().min(3).max(120),
    phone: z.string().trim().min(8).max(30),
    department: z.string().trim().min(2).max(80),
    municipality: z.string().trim().min(2).max(100),
    address: z.string().trim().min(8).max(300),
    reference: z.string().trim().max(240).optional().default(''),
    paymentMethod: z.string().trim().min(2).max(80),
    notes: z.string().trim().max(500).optional().default(''),
  }),
})
const updateOrderSchema = z.object({
  status: z.enum(['AWAITING_CONFIRMATION', 'CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
  adminNotes: z.string().trim().max(1000).optional(),
})
const orderLimiter = rateLimit({ windowMs: 10 * 60 * 1000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false })

function orderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const random = crypto.randomUUID().slice(0, 6).toUpperCase()
  return `USV-${date}-${random}`
}

function number(value: Prisma.Decimal) {
  return Number(value)
}

function orderDto(order: any) {
  return {
    ...order,
    subtotal: number(order.subtotal),
    deliveryFee: number(order.deliveryFee),
    total: number(order.total),
    items: order.items?.map((item: any) => ({
      ...item,
      unitPrice: number(item.unitPrice),
      lineTotal: number(item.lineTotal),
    })),
  }
}

function buildMessage(order: ReturnType<typeof orderDto>) {
  const lines = order.items.map((item: any, index: number) =>
    `${index + 1}. ${item.productName}${item.variantLabel ? ` (${item.variantLabel})` : ''}\n   ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.lineTotal.toFixed(2)}`,
  )
  return [
    `NUEVO PEDIDO ${order.orderNumber}`,
    '',
    'Productos:',
    ...lines,
    '',
    `Total estimado: $${order.total.toFixed(2)}`,
    '',
    'Datos de entrega:',
    `Nombre: ${order.customerName}`,
    `Teléfono: ${order.customerPhone}`,
    `Departamento: ${order.department}`,
    `Municipio: ${order.municipality}`,
    `Dirección: ${order.address}`,
    `Referencia: ${order.reference || 'No especificada'}`,
    `Forma de pago: ${order.paymentMethod}`,
    `Notas: ${order.notes || 'Sin notas adicionales'}`,
    '',
    'Por favor, confirma la disponibilidad y el costo de entrega. Gracias.',
  ].join('\n')
}

router.post('/public', orderLimiter, validate(createOrderSchema), async (request, response) => {
  const { items, customer } = request.body as z.infer<typeof createOrderSchema>
  const ids = [...new Set(items.map((item) => item.variantId))]
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: ids }, isActive: true, product: { isActive: true, category: { isActive: true } } },
    include: { product: true, values: { include: { optionValue: { include: { option: true } } } } },
  })
  if (variants.length !== ids.length) throw new HttpError(409, 'Uno de los productos ya no está disponible.', 'PRODUCT_UNAVAILABLE')

  const variantMap = new Map(variants.map((variant) => [variant.id, variant]))
  const prepared = items.map((item) => {
    const variant = variantMap.get(item.variantId)!
    if (variant.stock < item.quantity) {
      throw new HttpError(409, `No hay suficiente inventario para ${variant.product.name}.`, 'INSUFFICIENT_STOCK')
    }
    const unitPrice = variant.price
    const lineTotal = unitPrice.mul(item.quantity)
    const variantLabel = variant.values
      .map(({ optionValue }) => `${optionValue.option.name}: ${optionValue.value}`)
      .join(', ')
    return { item, variant, unitPrice, lineTotal, variantLabel }
  })
  const subtotal = prepared.reduce((total, item) => total.add(item.lineTotal), new Prisma.Decimal(0))

  const order = await prisma.order.create({
    data: {
      orderNumber: orderNumber(),
      customerName: customer.name,
      customerPhone: customer.phone,
      department: customer.department,
      municipality: customer.municipality,
      address: customer.address,
      reference: customer.reference,
      paymentMethod: customer.paymentMethod,
      notes: customer.notes,
      subtotal,
      total: subtotal,
      items: {
        create: prepared.map(({ item, variant, unitPrice, lineTotal, variantLabel }) => ({
          variantId: variant.id,
          productName: variant.product.name,
          productSlug: variant.product.slug,
          variantLabel,
          sku: variant.sku,
          unitPrice,
          quantity: item.quantity,
          lineTotal,
        })),
      },
    },
    include: { items: true },
  })
  const dto = orderDto(order)
  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } })
  const phone = (settings?.whatsappNumber || env.WHATSAPP_NUMBER).replace(/\D/g, '')
  const destination = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
  response.status(201).json({
    data: { order: dto, whatsappUrl: `${destination}?text=${encodeURIComponent(buildMessage(dto))}` },
  })
})

router.use('/admin', authenticate, authorize('ADMIN', 'SUPERADMIN'))

router.get('/admin', async (request, response) => {
  const status = typeof request.query.status === 'string' ? request.query.status as OrderStatus : undefined
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  response.json({ data: { orders: orders.map(orderDto) } })
})

router.get('/admin/:id', async (request, response) => {
  const order = await prisma.order.findUnique({ where: { id: String(request.params.id) }, include: { items: true } })
  if (!order) throw new HttpError(404, 'Pedido no encontrado.', 'ORDER_NOT_FOUND')
  response.json({ data: { order: orderDto(order) } })
})

router.patch('/admin/:id/status', requireCsrf, validate(updateOrderSchema), async (request, response) => {
  const input = request.body as z.infer<typeof updateOrderSchema>
  const before = await prisma.order.findUnique({ where: { id: String(request.params.id) }, include: { items: true } })
  if (!before) throw new HttpError(404, 'Pedido no encontrado.', 'ORDER_NOT_FOUND')
  if (before.status === 'DELIVERED' && input.status === 'CANCELLED') {
    throw new HttpError(409, 'Un pedido entregado no puede cancelarse.', 'INVALID_STATUS')
  }

  const commitsInventory = ['CONFIRMED', 'PREPARING', 'SHIPPED', 'DELIVERED'].includes(input.status)
  const order = await prisma.$transaction(async (transaction) => {
    if (commitsInventory && !before.inventoryCommitted) {
      for (const item of before.items) {
        if (!item.variantId) throw new HttpError(409, 'Una variante del pedido ya no existe.', 'VARIANT_MISSING')
        const variant = await transaction.productVariant.findUnique({ where: { id: item.variantId } })
        if (!variant || variant.stock < item.quantity) {
          throw new HttpError(409, `Inventario insuficiente para ${item.productName}.`, 'INSUFFICIENT_STOCK')
        }
        await transaction.productVariant.update({ where: { id: variant.id }, data: { stock: { decrement: item.quantity } } })
      }
    }
    if (input.status === 'CANCELLED' && before.inventoryCommitted) {
      for (const item of before.items) {
        if (item.variantId) {
          await transaction.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } })
        }
      }
    }
    return transaction.order.update({
      where: { id: before.id },
      data: {
        status: input.status,
        adminNotes: input.adminNotes,
        inventoryCommitted: input.status === 'CANCELLED' ? false : (before.inventoryCommitted || commitsInventory),
      },
      include: { items: true },
    })
  })
  await audit(request, 'STATUS_UPDATE', 'ORDER', order.id, { status: before.status }, { status: order.status })
  response.json({ data: { order: orderDto(order) } })
})

export { router as orderRouter }
