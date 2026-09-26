import { createHash, randomBytes } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import type { Role } from '@prisma/client'
import { env, isProduction } from '../config/env.js'

export const ACCESS_COOKIE = isProduction ? '__Host-admin_access' : 'admin_access'
export const REFRESH_COOKIE = isProduction ? '__Host-admin_refresh' : 'admin_refresh'
export const CSRF_COOKIE = isProduction ? '__Host-csrf' : 'csrf_token'

export interface AccessPayload {
  sub: string
  role: Role
  email: string
  type: 'access'
}

const baseCookie = {
  secure: isProduction,
  sameSite: env.COOKIE_SAME_SITE,
  path: '/',
} as const

export function signAccessToken(payload: Omit<AccessPayload, 'type'>) {
  return jwt.sign({ ...payload, type: 'access' }, env.JWT_ACCESS_SECRET, {
    expiresIn: `${env.ACCESS_TOKEN_MINUTES}m`,
    issuer: 'urbano-sv-api',
    audience: 'urbano-sv-admin',
  })
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'urbano-sv-api',
    audience: 'urbano-sv-admin',
  }) as AccessPayload
}

export function createRefreshToken() {
  return randomBytes(48).toString('base64url')
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function setAccessCookie(response: Response, token: string) {
  response.cookie(ACCESS_COOKIE, token, {
    ...baseCookie,
    httpOnly: true,
    maxAge: env.ACCESS_TOKEN_MINUTES * 60 * 1000,
  })
}

export function setRefreshCookie(response: Response, token: string) {
  response.cookie(REFRESH_COOKIE, token, {
    ...baseCookie,
    httpOnly: true,
    maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookies(response: Response) {
  response.clearCookie(ACCESS_COOKIE, { ...baseCookie, httpOnly: true })
  response.clearCookie(REFRESH_COOKIE, { ...baseCookie, httpOnly: true })
}

export function csrfCookieOptions() {
  return {
    ...baseCookie,
    httpOnly: false,
    maxAge: 2 * 60 * 60 * 1000,
  }
}
