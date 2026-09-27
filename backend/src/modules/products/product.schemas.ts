import { z } from 'zod'

const imageSchema = z.object({
  url: z.url().max(2000),
  altText: z.string().trim().max(180).optional().default(''),
  sortOrder: z.number().int().min(0).default(0),
})

const optionSchema = z.object({
  name: z.string().trim().min(1).max(60),
  values: z
    .array(z.string().trim().min(1).max(80))
    .min(1)
    .max(30),
})

const variantSchema = z.object({
  /*
   * El ID solamente se envía cuando la variante ya existe.
   * Las variantes nuevas no tienen ID.
   */
  id: z.uuid().optional(),

  /*
   * El SKU no se recibe desde el frontend.
   * Se genera exclusivamente en el backend.
   */
  price: z
    .number()
    .nonnegative()
    .max(9999999999),

  previousPrice: z
    .number()
    .positive()
    .max(9999999999)
    .nullable()
    .optional(),

  stock: z
    .number()
    .int()
    .nonnegative()
    .max(1000000),

  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),

  values: z
    .record(z.string(), z.string())
    .default({}),
})

export const productInputSchema = z
  .object({
    categoryId: z.uuid(),

    name: z
      .string()
      .trim()
      .min(2)
      .max(140),

    slug: z
      .string()
      .trim()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'El slug contiene caracteres inválidos.',
      )
      .max(170),

    shortDescription: z
      .string()
      .trim()
      .min(10)
      .max(260),

    description: z
      .string()
      .trim()
      .min(20)
      .max(10000),

    badge: z
      .string()
      .trim()
      .max(40)
      .nullable()
      .optional(),

    featured: z.boolean().default(false),
    isActive: z.boolean().default(true),

    images: z
      .array(imageSchema)
      .min(1)
      .max(10),

    options: z
      .array(optionSchema)
      .max(5)
      .default([]),

    variants: z
      .array(variantSchema)
      .min(1)
      .max(300),
  })
  .superRefine((data, context) => {
    const optionNames = new Set<string>()
    const optionMap = new Map<string, Set<string>>()

    /*
     * Validar nombres y valores repetidos en las opciones.
     */
    for (const [optionIndex, option] of data.options.entries()) {
      if (optionNames.has(option.name)) {
        context.addIssue({
          code: 'custom',
          message: `La opción ${option.name} está repetida.`,
          path: ['options', optionIndex, 'name'],
        })
      }

      optionNames.add(option.name)

      const uniqueValues = new Set<string>()

      for (const [valueIndex, value] of option.values.entries()) {
        if (uniqueValues.has(value)) {
          context.addIssue({
            code: 'custom',
            message: `El valor ${value} está repetido en ${option.name}.`,
            path: [
              'options',
              optionIndex,
              'values',
              valueIndex,
            ],
          })
        }

        uniqueValues.add(value)
      }

      optionMap.set(option.name, uniqueValues)
    }

    const variantIds = new Set<string>()
    const variantCombinations = new Set<string>()

    for (const [variantIndex, variant] of data.variants.entries()) {
      /*
       * Un mismo ID no puede enviarse dos veces.
       */
      if (variant.id) {
        if (variantIds.has(variant.id)) {
          context.addIssue({
            code: 'custom',
            message: 'La misma variante fue enviada más de una vez.',
            path: ['variants', variantIndex, 'id'],
          })
        }

        variantIds.add(variant.id)
      }

      /*
       * Cada variante debe seleccionar un valor de cada opción.
       */
      for (const option of data.options) {
        const selectedValue = variant.values[option.name]

        if (!selectedValue) {
          context.addIssue({
            code: 'custom',
            message: `Selecciona un valor para ${option.name}.`,
            path: ['variants', variantIndex, 'values'],
          })

          continue
        }

        if (!optionMap.get(option.name)?.has(selectedValue)) {
          context.addIssue({
            code: 'custom',
            message:
              `La opción ${option.name}: ${selectedValue} no existe.`,
            path: ['variants', variantIndex, 'values'],
          })
        }
      }

      /*
       * No permitir propiedades que no estén declaradas como opciones.
       */
      for (const [name, value] of Object.entries(variant.values)) {
        if (!optionMap.has(name)) {
          context.addIssue({
            code: 'custom',
            message: `La opción ${name}: ${value} no existe.`,
            path: ['variants', variantIndex, 'values'],
          })
        }
      }

      /*
       * Detectar combinaciones repetidas antes de generar el SKU.
       */
      const combination =
        data.options.length > 0
          ? data.options
              .map(
                (option) =>
                  `${option.name}=${variant.values[option.name] ?? ''}`,
              )
              .join('|')
          : '__DEFAULT_VARIANT__'

      if (variantCombinations.has(combination)) {
        context.addIssue({
          code: 'custom',
          message:
            'Hay dos variantes con la misma combinación de opciones.',
          path: ['variants', variantIndex, 'values'],
        })
      }

      variantCombinations.add(combination)
    }
  })

export type ProductInput = z.infer<
  typeof productInputSchema
>
