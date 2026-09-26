import type { NextFunction, Request, Response } from 'express'
import type { Role } from '@prisma/client'
import { ACCESS_COOKIE, verifyAccessToken } from '../lib/auth.js'
import { HttpError } from '../lib/http-error.js'

export function authenticate(request: Request, _response: Response, next: NextFunction) {
  try {
    const token = request.cookies[ACCESS_COOKIE] as string | undefined
    if (!token) throw new HttpError(401, 'Debes iniciar sesión.', 'UNAUTHENTICATED')

    const payload = verifyAccessToken(token)
    if (payload.type !== 'access') throw new Error('Tipo de token inválido')

    request.admin = { id: payload.sub, email: payload.email, role: payload.role }
    next()
  } catch (error) {
    if (error instanceof HttpError) return next(error)
    next(new HttpError(401, 'La sesión expiró.', 'SESSION_EXPIRED'))
  }
}

export function authorize(...roles: Role[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (!request.admin) return next(new HttpError(401, 'Debes iniciar sesión.', 'UNAUTHENTICATED'))
    if (!roles.includes(request.admin.role)) {
      return next(new HttpError(403, 'No tienes permiso para realizar esta acción.', 'FORBIDDEN'))
    }
    next()
  }
}
