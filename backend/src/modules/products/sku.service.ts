import { createHash } from 'node:crypto'
import type { Prisma } from '@prisma/client'

const MAX_SKU_LENGTH = 80

export function normalizeSkuPart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function buildVariantSku(
  skuBase: string,
  values: Record<string, string>,
  optionNames: string[],
) {
  const parts = optionNames
    .map((name) => normalizeSkuPart(values[name] ?? ''))
    .filter(Boolean)
  const suffix = parts.length ? parts.join('-') : 'STD'
  const candidate = `${skuBase}-${suffix}`

  if (candidate.length <= MAX_SKU_LENGTH) return candidate

  const hash = createHash('sha256').update(candidate).digest('hex').slice(0, 8).toUpperCase()
  const availableLength = MAX_SKU_LENGTH - hash.length - 1
  const shortened = candidate.slice(0, availableLength).replace(/-+$/g, '')
  return `${shortened}-${hash}`
}

export async function allocateProductIdentity(
  transaction: Prisma.TransactionClient,
  skuPrefix: string,
) {
  const rows = await transaction.$queryRaw<Array<{ value: bigint }>>`
    SELECT nextval('"products_internal_number_seq"') AS value
  `
  const internalNumber = Number(rows[0]?.value)
  if (!Number.isSafeInteger(internalNumber)) {
    throw new Error('No se pudo reservar el número interno del producto.')
  }

  return {
    internalNumber,
    skuBase: `${skuPrefix}-${String(internalNumber).padStart(6, '0')}`,
  }
}