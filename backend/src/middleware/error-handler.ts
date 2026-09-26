import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import multer from 'multer'
import { HttpError } from '../lib/http-error.js'
import { isProduction } from '../config/env.js'

export function notFound(_request: Request, response: Response) {
  response.status(404).json({ error: { code: 'NOT_FOUND', message: 'Recurso no encontrado.' } })
}

export function errorHandler(error: unknown, _request: Request, response: Response, _next: NextFunction) {
  if (error instanceof HttpError) {
    return response.status(error.status).json({
      error: { code: error.code, message: error.message, details: error.details },
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
    return response.status(409).json({
      error: { code: 'DUPLICATE_VALUE', message: 'Ya existe un registro con ese valor.' },
    })
  }

  if (error instanceof multer.MulterError) {
    const fileTooLarge = error.code === 'LIMIT_FILE_SIZE'
    return response.status(fileTooLarge ? 413 : 400).json({
      error: {
        code: fileTooLarge ? 'IMAGE_TOO_LARGE' : 'INVALID_UPLOAD',
        message: fileTooLarge
          ? 'La imagen supera el límite de 5 MB.'
          : 'No fue posible procesar el archivo enviado.',
      },
    })
  }

  console.error(error)
  response.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'No fue posible completar la operación.',
      ...(!isProduction && error instanceof Error ? { details: error.message } : {}),
    },
  })
}