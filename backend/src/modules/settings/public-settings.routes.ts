import { Router } from 'express'
import { env } from '../../config/env.js'
import { prisma } from '../../lib/prisma.js'

const router = Router()

router.get('/', async (_request, response) => {
  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 } })
  response.json({
    data: {
      settings: settings ?? {
        storeName: 'UrbanoSV',
        whatsappNumber: env.WHATSAPP_NUMBER,
        supportMessage: 'Atención por WhatsApp',
        deliveryMessage: 'Entregas disponibles en El Salvador',
      },
    },
  })
})

export { router as publicSettingsRouter }
