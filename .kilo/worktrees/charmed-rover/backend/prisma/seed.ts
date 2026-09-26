import 'dotenv/config'
import argon2 from 'argon2'
import { PrismaClient } from '@prisma/client'
import { writeProductRelations } from '../src/modules/products/product.service.js'
import type { ProductInput } from '../src/modules/products/product.schemas.js'

const prisma = new PrismaClient()

const categories = [
  { name: 'Tecnología', slug: 'tecnologia', description: 'Audífonos, accesorios y productos útiles para tu día.', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', sortOrder: 1 },
  { name: 'Moda', slug: 'moda', description: 'Prendas cómodas con un estilo moderno y versátil.', imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85', sortOrder: 2 },
  { name: 'Perfumes', slug: 'perfumes', description: 'Fragancias para cada personalidad y ocasión.', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85', sortOrder: 3 },
  { name: 'Accesorios', slug: 'accesorios', description: 'Detalles funcionales que complementan tu estilo.', imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85', sortOrder: 4 },
]

const products = [
  { name: 'Audífonos Wave Pro', slug: 'audifonos-wave-pro', category: 'tecnologia', shortDescription: 'Sonido claro, conexión Bluetooth y diseño cómodo.', description: 'Audífonos inalámbricos pensados para música, estudio y llamadas. Incluyen controles integrados, almohadillas suaves y batería para acompañarte durante el día.', price: 19.99, previousPrice: 24.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90', badge: 'Más vendido', featured: true, stock: 12, options: [{ name: 'Color', values: ['Negro', 'Blanco'] }] },
  { name: 'Earbuds Air Mini', slug: 'earbuds-air-mini', category: 'tecnologia', shortDescription: 'Compactos, ligeros y perfectos para llevar contigo.', description: 'Audífonos compactos con estuche de carga, micrófono integrado y conexión rápida. Una opción práctica para llamadas y entretenimiento diario.', price: 16.5, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=90', badge: 'Nuevo', featured: true, stock: 18, options: [{ name: 'Color', values: ['Blanco', 'Negro'] }] },
  { name: 'Camisa Essential', slug: 'camisa-essential', category: 'moda', shortDescription: 'Corte moderno y tela fresca para uso diario.', description: 'Camisa básica de algodón con caída cómoda y acabado limpio. Combina fácilmente con jeans, pantalones casuales o accesorios urbanos.', price: 24.5, image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90', badge: 'Nuevo', featured: true, stock: 20, options: [{ name: 'Talla', values: ['S', 'M', 'L', 'XL'] }, { name: 'Color', values: ['Negro', 'Blanco', 'Azul'] }] },
  { name: 'Tenis Urban Move', slug: 'tenis-urban-move', category: 'moda', shortDescription: 'Comodidad ligera con una silueta urbana.', description: 'Tenis versátiles para caminar y combinar con atuendos casuales. Su diseño limpio permite usarlos durante toda la semana.', price: 38, previousPrice: 44, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90', badge: 'Oferta', featured: false, stock: 9, options: [{ name: 'Talla', values: ['37', '38', '39', '40', '41'] }] },
  { name: 'Fragancia Classic', slug: 'fragancia-classic', category: 'perfumes', shortDescription: 'Aroma elegante y equilibrado para cualquier ocasión.', description: 'Una fragancia versátil con presencia suave y duradera. Ideal para quienes buscan un aroma elegante que funcione tanto de día como de noche.', price: 34.99, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=90', badge: 'Favorito', featured: true, stock: 7, options: [{ name: 'Presentación', values: ['50 ml', '100 ml'] }] },
  { name: 'Fragancia Floral Mist', slug: 'fragancia-floral-mist', category: 'perfumes', shortDescription: 'Notas florales frescas con un acabado delicado.', description: 'Fragancia fresca de carácter floral, creada para el uso diario. Su presentación compacta es práctica para llevar en el bolso.', price: 29.99, image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90', featured: false, stock: 11, options: [{ name: 'Presentación', values: ['50 ml', '80 ml'] }] },
  { name: 'Reloj Minimal', slug: 'reloj-minimal', category: 'accesorios', shortDescription: 'Diseño limpio para combinar con cualquier estilo.', description: 'Reloj de estilo minimalista con correa cómoda y una esfera fácil de leer. Una pieza sencilla para completar atuendos casuales o formales.', price: 27, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90', featured: true, stock: 10, options: [{ name: 'Color', values: ['Negro', 'Café'] }] },
  { name: 'Lentes Urban Sun', slug: 'lentes-urban-sun', category: 'accesorios', shortDescription: 'Protección y estilo en un diseño ligero.', description: 'Lentes de sol livianos y cómodos para acompañarte todos los días. Su forma versátil combina con distintos estilos.', price: 18.75, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=90', badge: 'Popular', featured: false, stock: 14, options: [{ name: 'Color', values: ['Negro', 'Carey'] }] },
]

function combinations(options: Array<{ name: string; values: string[] }>): Record<string, string>[] {
  return options.reduce<Record<string, string>[]>((current, option) =>
    current.flatMap((entry) => option.values.map((value) => ({ ...entry, [option.name]: value }))), [{}])
}

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? '').toLowerCase().trim()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? ''
  if (!adminEmail || adminPassword.length < 12 || adminPassword.includes('replace-with')) {
    throw new Error('Configura SEED_ADMIN_EMAIL y una SEED_ADMIN_PASSWORD segura de al menos 12 caracteres.')
  }

  const categoryIds = new Map<string, string>()
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    })
    categoryIds.set(category.slug, saved.id)
  }

  for (const product of products) {
    const exists = await prisma.product.findUnique({ where: { slug: product.slug } })
    if (exists) continue
    const categoryId = categoryIds.get(product.category)!
    const optionCombinations = combinations(product.options)
    const baseStock = Math.floor(product.stock / optionCombinations.length)
    const remainder = product.stock % optionCombinations.length
    const input: ProductInput = {
      categoryId,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      description: product.description,
      badge: product.badge ?? null,
      featured: product.featured,
      isActive: true,
      images: [{ url: product.image, altText: product.name, sortOrder: 0 }],
      options: product.options,
      variants: optionCombinations.map((values, index) => ({
        sku: `${product.slug.toUpperCase().replaceAll('-', '_')}-${String(index + 1).padStart(2, '0')}`,
        price: product.price,
        previousPrice: product.previousPrice ?? null,
        stock: baseStock + (index < remainder ? 1 : 0),
        isDefault: index === 0,
        isActive: true,
        values,
      })),
    }
    await prisma.$transaction(
  async (transaction) => {
    const created = await transaction.product.create({
      data: {
        categoryId,
        name: input.name,
        slug: input.slug,
        shortDescription: input.shortDescription,
        description: input.description,
        badge: input.badge,
        featured: input.featured,
        isActive: true,
      },
    })

    await writeProductRelations(transaction, created.id, input)
  },
  {
    maxWait: 10_000,
    timeout: 60_000,
  },
)
  }

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: 'UrbanoSV',
      whatsappNumber: process.env.WHATSAPP_NUMBER ?? '503XXXXXXXX',
      supportMessage: 'Atención por WhatsApp',
      deliveryMessage: 'Entregas disponibles en El Salvador',
    },
  })

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: 'Administrador principal',
        email: adminEmail,
        passwordHash: await argon2.hash(adminPassword, { type: argon2.argon2id }),
        role: 'SUPERADMIN',
      },
    })
  }

  console.log('Datos iniciales creados correctamente.')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => prisma.$disconnect())
