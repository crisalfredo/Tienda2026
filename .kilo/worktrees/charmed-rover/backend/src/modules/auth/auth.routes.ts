import { Router } from 'express'
import argon2 from 'argon2'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import type { Role } from '@prisma/client'
import {
  REFRESH_COOKIE,
  clearAuthCookies,
  createRefreshToken,
  hashToken,
  setAccessCookie,
  setRefreshCookie,
  signAccessToken,
} from '../../lib/auth.js'
import { HttpError } from '../../lib/http-error.js'
import { prisma } from '../../lib/prisma.js'
import { authenticate } from '../../middleware/authenticate.js'
import { issueCsrfToken, requireCsrf } from '../../middleware/csrf.js'
import { validate } from '../../middleware/validate.js'
import { env } from '../../config/env.js'

const router = Router()
const credentialsSchema = z.object({
  email: z.email().max(190).transform((value) => value.toLowerCase().trim()),
  password: z.string().min(8).max(200),
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_ATTEMPTS', message: 'Espera unos minutos antes de intentarlo nuevamente.' } },
})

function publicUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

async function createSession(
  response: Parameters<typeof setAccessCookie>[0],
  user: { id: string; email: string; role: Role },
  userAgent?: string,
  ipAddress?: string,
) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role })
  const refreshToken = createRefreshToken()
  await prisma.refreshSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000),
      userAgent,
      ipAddress,
    },
  })
  setAccessCookie(response, accessToken)
  setRefreshCookie(response, refreshToken)
}

router.get('/csrf', issueCsrfToken)

router.post('/login', loginLimiter, requireCsrf, validate(credentialsSchema), async (request, response) => {
  const { email, password } = request.body as z.infer<typeof credentialsSchema>
  const user = await prisma.user.findUnique({ where: { email } })
  const valid = user ? await argon2.verify(user.passwordHash, password) : false

  if (!user || !valid || !user.isActive || user.role === 'CUSTOMER') {
    throw new HttpError(401, 'Credenciales incorrectas.', 'INVALID_CREDENTIALS')
  }

  await createSession(response, user, request.get('user-agent'), request.ip)
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await prisma.auditLog.create({
    data: { actorId: user.id, action: 'LOGIN', entityType: 'AUTH', entityId: user.id, ipAddress: request.ip },
  })
  response.json({ data: { user: publicUser(user) } })
})

router.post('/refresh', requireCsrf, async (request, response) => {
  const token = request.cookies[REFRESH_COOKIE] as string | undefined
  if (!token) throw new HttpError(401, 'La sesión expiró.', 'SESSION_EXPIRED')

  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  })
  if (!session || session.expiresAt <= new Date() || !session.user.isActive || session.user.role === 'CUSTOMER') {
    if (session) await prisma.refreshSession.delete({ where: { id: session.id } })
    clearAuthCookies(response)
    throw new HttpError(401, 'La sesión expiró.', 'SESSION_EXPIRED')
  }

  await prisma.refreshSession.delete({ where: { id: session.id } })
  await createSession(response, session.user, request.get('user-agent'), request.ip)
  response.json({ data: { user: publicUser(session.user) } })
})

router.get('/me', authenticate, async (request, response) => {
  const user = await prisma.user.findUnique({ where: { id: request.admin!.id } })
  if (!user || !user.isActive) throw new HttpError(401, 'La sesión no es válida.', 'UNAUTHENTICATED')
  response.json({ data: { user: publicUser(user) } })
})

router.post('/logout', requireCsrf, async (request, response) => {
  const token = request.cookies[REFRESH_COOKIE] as string | undefined
  if (token) await prisma.refreshSession.deleteMany({ where: { tokenHash: hashToken(token) } })
  clearAuthCookies(response)
  response.status(204).send()
})

export { router as authRouter }
