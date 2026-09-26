import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var urbanoPrisma: PrismaClient | undefined
}

export const prisma = globalThis.urbanoPrisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.urbanoPrisma = prisma
}
