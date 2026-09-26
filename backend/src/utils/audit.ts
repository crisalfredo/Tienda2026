import type { Request } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export async function audit(
  request: Request,
  action: string,
  entityType: string,
  entityId?: string,
  beforeData?: unknown,
  afterData?: unknown,
) {
  const toJson = (value: unknown) => value === undefined
    ? undefined
    : JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
  await prisma.auditLog.create({
    data: {
      actorId: request.admin?.id,
      action,
      entityType,
      entityId,
      beforeData: toJson(beforeData),
      afterData: toJson(afterData),
      ipAddress: request.ip,
    },
  })
}
