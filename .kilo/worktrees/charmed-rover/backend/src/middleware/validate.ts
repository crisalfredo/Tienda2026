import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { HttpError } from '../lib/http-error.js'

export function validate(schema: ZodType, source: 'body' | 'query' | 'params' = 'body') {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request[source])
    if (!result.success) {
      return next(new HttpError(400, 'Revisa los datos enviados.', 'VALIDATION_ERROR', result.error.flatten()))
    }
    request[source] = result.data
    next()
  }
}
