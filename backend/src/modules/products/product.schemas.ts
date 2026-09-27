import { z } from 'zod'

const normalizeSkuValue = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toUpperCase()
  .replace(/[^A-Z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')

const imageSchema = z.object({
  url: z.url().max(2000),
  altText: z.string().trim().max(180).optional().default(''),
  sortOrder: z.number().int().min(0).default(0),
})

const optionSchema = z.object({
  name: z.string().trim().min(1).max(60),
  values: z.array(z.string().trim().min(1).max(80)).min(1).max(30),
})

// const variantSchema = z.object({
//   id: z.uuid().optional(),
//   price: z.number().nonnegative().max(9999999999),
//   previousPrice: z.number().positive().max(9999999999).nullable().optional(),
//   stock: z.number().int().nonnegative().max(1000000),
//   isDefault: z.boolean().default(false),
//   isActive: z.boolean().default(true),
//   values: z.record(z.string(), z.string()).default({}),
// })

const variantSchema = z.object({
  id: z.uuid().optional(),
  price: z.coerce.number().nonnegative(),
  previousPrice: z.coerce.number().nonnegative().nullable().optional(),
  stock: z.coerce.number().int().nonnegative(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  values: z.record(z.string(), z.string()),
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
  const optionNames = data.options.map((option) => option.name)
  const optionNameSet = new Set(optionNames)
  const variantIds = new Set<string>()
  const combinations = new Set<string>()
  const normalizedSkuCombinations = new Set<string>()

  if (optionNameSet.size !== optionNames.length) {
    context.addIssue({ code: 'custom', message: 'Los nombres de las opciones no pueden repetirse.', path: ['options'] })
  }
  for (const [optionIndex, option] of data.options.entries()) {
    if (new Set(option.values).size !== option.values.length) {
      context.addIssue({ code: 'custom', message: `La opción ${option.name} contiene valores repetidos.`, path: ['options', optionIndex, 'values'] })
    }
  }
  if (data.variants.filter((variant) => variant.isDefault).length > 1) {
    context.addIssue({ code: 'custom', message: 'Solo una variante puede ser la principal.', path: ['variants'] })
  }
  if (!optionNames.length && data.variants.length > 1) {
    context.addIssue({ code: 'custom', message: 'Un producto sin opciones solo puede tener una variante.', path: ['variants'] })
  }

  for (const [index, variant] of data.variants.entries()) {
    if (variant.id) {
      if (variantIds.has(variant.id)) {
        context.addIssue({ code: 'custom', message: 'Una variante no puede enviarse dos veces.', path: ['variants', index, 'id'] })
      }
      variantIds.add(variant.id)
    }
    for (const [name, value] of Object.entries(variant.values)) {
      if (!optionMap.get(name)?.has(value)) {
        context.addIssue({ code: 'custom', message: `La opción ${name}: ${value} no existe.`, path: ['variants', index, 'values'] })
      }
    }
    for (const optionName of optionNames) {
      if (!variant.values[optionName]) {
        context.addIssue({ code: 'custom', message: `Selecciona un valor para ${optionName}.`, path: ['variants', index, 'values'] })
      }
    }
    for (const valueName of Object.keys(variant.values)) {
      if (!optionNameSet.has(valueName)) {
        context.addIssue({ code: 'custom', message: `La opción ${valueName} no pertenece al producto.`, path: ['variants', index, 'values'] })
      }
    }

    const combination = optionNames.map((name) => `${name}\u0000${variant.values[name] ?? ''}`).join('\u0001') || 'STD'
    if (combinations.has(combination)) {
      context.addIssue({ code: 'custom', message: 'Esta combinación de opciones ya está repetida.', path: ['variants', index, 'values'] })
    }
    combinations.add(combination)

    const normalizedCombination = optionNames.map((name) => normalizeSkuValue(variant.values[name] ?? '')).join('-') || 'STD'
    if (normalizedSkuCombinations.has(normalizedCombination)) {
      context.addIssue({ code: 'custom', message: 'Dos variantes producirían el mismo SKU después de normalizar sus valores.', path: ['variants', index, 'values'] })
    }
    normalizedSkuCombinations.add(normalizedCombination)
  }
})

export type ProductInput = z.infer<typeof productInputSchema>
