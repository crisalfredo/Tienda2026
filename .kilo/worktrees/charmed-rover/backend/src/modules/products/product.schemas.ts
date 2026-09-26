import { z } from 'zod'

const imageSchema = z.object({
  url: z.url().max(2000),
  altText: z.string().trim().max(180).optional().default(''),
  sortOrder: z.number().int().min(0).default(0),
})

const optionSchema = z.object({
  name: z.string().trim().min(1).max(60),
  values: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
})

const variantSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  price: z.number().nonnegative().max(9999999999),
  previousPrice: z.number().positive().max(9999999999).nullable().optional(),
  stock: z.number().int().nonnegative().max(1000000),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  values: z.record(z.string(), z.string()).default({}),
})

export const productInputSchema = z.object({
  categoryId: z.uuid(),
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(170),
  shortDescription: z.string().trim().min(10).max(260),
  description: z.string().trim().min(20).max(10000),
  badge: z.string().trim().max(40).nullable().optional(),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(imageSchema).min(1).max(10),
  options: z.array(optionSchema).max(5).default([]),
  variants: z.array(variantSchema).min(1).max(300),
}).superRefine((data, context) => {
  const optionMap = new Map(data.options.map((option) => [option.name, new Set(option.values)]))
  const skuSet = new Set<string>()
  for (const [index, variant] of data.variants.entries()) {
    if (skuSet.has(variant.sku)) {
      context.addIssue({ code: 'custom', message: 'Los SKU no pueden repetirse.', path: ['variants', index, 'sku'] })
    }
    skuSet.add(variant.sku)
    for (const [name, value] of Object.entries(variant.values)) {
      if (!optionMap.get(name)?.has(value)) {
        context.addIssue({ code: 'custom', message: `La opción ${name}: ${value} no existe.`, path: ['variants', index, 'values'] })
      }
    }
  }
})

export type ProductInput = z.infer<typeof productInputSchema>
