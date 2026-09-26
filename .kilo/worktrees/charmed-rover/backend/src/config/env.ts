
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  FRONTEND_ORIGIN: z.string().min(1).default('http://localhost:5173'),
  JWT_ACCESS_SECRET: z.string().min(32),
  ACCESS_TOKEN_MINUTES: z.coerce.number().int().min(5).max(60).default(15),
  REFRESH_TOKEN_DAYS: z.coerce.number().int().min(1).max(30).default(7),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  WHATSAPP_NUMBER: z.string().default(''),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Configuración inválida:', z.treeifyError(parsed.error))
  process.exit(1)
}

export const env = parsed.data
export const isProduction = env.NODE_ENV === 'production'
export const allowedOrigins = env.FRONTEND_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
