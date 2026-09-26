import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { allowedOrigins } from './config/env.js'
import { adminRouter } from './modules/admin/admin.routes.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { categoryRouter } from './modules/categories/category.routes.js'
import { orderRouter } from './modules/orders/order.routes.js'
import { adminProductRouter } from './modules/products/admin-product.routes.js'
import { publicProductRouter } from './modules/products/public-product.routes.js'
import { publicSettingsRouter } from './modules/settings/public-settings.routes.js'
import { errorHandler, notFound } from './middleware/error-handler.js'

export const app = express()
app.set('trust proxy', 1)
app.disable('x-powered-by')

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error('Origen no permitido por CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-CSRF-Token'],
}))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false }))
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: false, limit: '50kb' }))
app.use(cookieParser())

app.get('/api/health', (_request, response) => {
  response.json({ data: { status: 'ok', timestamp: new Date().toISOString() } })
})
app.use('/api/admin/auth', authRouter)
app.use('/api/categories', categoryRouter)
app.use('/api/products', publicProductRouter)
app.use('/api/admin/products', adminProductRouter)
app.use('/api/orders', orderRouter)
app.use('/api/admin', adminRouter)
app.use('/api/store-settings', publicSettingsRouter)

app.use(notFound)
app.use(errorHandler)
