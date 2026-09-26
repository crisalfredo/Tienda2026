import { randomBytes, timingSafeEqual } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { CSRF_COOKIE, csrfCookieOptions } from '../lib/auth.js'
import { HttpError } from '../lib/http-error.js'

export function issueCsrfToken(_request: Request, response: Response) {
  const token = randomBytes(32).toString('base64url')
  response.cookie(CSRF_COOKIE, token, csrfCookieOptions())
  response.json({ data: { csrfToken: token } })
}

export function requireCsrf(request: Request, _response: Response, next: NextFunction) {
  const cookieToken = request.cookies[CSRF_COOKIE] as string | undefined
  const headerToken = request.header('x-csrf-token')

  if (!cookieToken || !headerToken) {
    return next(new HttpError(403, 'La solicitud de seguridad expiró.', 'CSRF_INVALID'))
  }

  const cookieBuffer = Buffer.from(cookieToken)
  const headerBuffer = Buffer.from(headerToken)
  if (cookieBuffer.length !== headerBuffer.length || !timingSafeEqual(cookieBuffer, headerBuffer)) {
    return next(new HttpError(403, 'La solicitud de seguridad no es válida.', 'CSRF_INVALID'))
  }

  next()
}
