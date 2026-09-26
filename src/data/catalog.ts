import type { Category, Product } from '../types'

export const categories: Category[] = [
  {
    id: 'cat-tech',
    name: 'Tecnología',
    slug: 'tecnologia',
    skuPrefix: 'TEC',
    description: 'Audífonos, accesorios y productos útiles para tu día.',
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'cat-fashion',
    name: 'Moda',
    slug: 'moda',
    skuPrefix: 'MOD',
    description: 'Prendas cómodas con un estilo moderno y versátil.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'cat-perfume',
    name: 'Perfumes',
    slug: 'perfumes',
    skuPrefix: 'PER',
    description: 'Fragancias para cada personalidad y ocasión.',
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'cat-accessories',
    name: 'Accesorios',
    slug: 'accesorios',
    skuPrefix: 'ACC',
    description: 'Detalles funcionales que complementan tu estilo.',
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
  },
]

export const products: Product[] = [
  {
    id: 'prod-headphones',
    name: 'Audífonos Wave Pro',
    slug: 'audifonos-wave-pro',
    categorySlug: 'tecnologia',
    shortDescription: 'Sonido claro, conexión Bluetooth y diseño cómodo.',
    description:
      'Audífonos inalámbricos pensados para música, estudio y llamadas. Incluyen controles integrados, almohadillas suaves y batería para acompañarte durante el día.',
    price: 19.99,
    previousPrice: 24.99,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=90',
    ],
    badge: 'Más vendido',
    featured: true,
    stock: 12,
    options: [{ name: 'Color', values: ['Negro', 'Blanco'] }],
  },
  {
    id: 'prod-earbuds',
    name: 'Earbuds Air Mini',
    slug: 'earbuds-air-mini',
    categorySlug: 'tecnologia',
    shortDescription: 'Compactos, ligeros y perfectos para llevar contigo.',
    description:
      'Audífonos compactos con estuche de carga, micrófono integrado y conexión rápida. Una opción práctica para llamadas y entretenimiento diario.',
    price: 16.5,
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=90',
    ],
    badge: 'Nuevo',
    featured: true,
    stock: 18,
    options: [{ name: 'Color', values: ['Blanco', 'Negro'] }],
  },
  {
    id: 'prod-shirt',
    name: 'Camisa Essential',
    slug: 'camisa-essential',
    categorySlug: 'moda',
    shortDescription: 'Corte moderno y tela fresca para uso diario.',
    description:
      'Camisa básica de algodón con caída cómoda y acabado limpio. Combina fácilmente con jeans, pantalones casuales o accesorios urbanos.',
    price: 24.5,
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=90',
    ],
    badge: 'Nuevo',
    featured: true,
    stock: 20,
    options: [
      { name: 'Talla', values: ['S', 'M', 'L', 'XL'] },
      { name: 'Color', values: ['Negro', 'Blanco', 'Azul'] },
    ],
  },
  {
    id: 'prod-sneakers',
    name: 'Tenis Urban Move',
    slug: 'tenis-urban-move',
    categorySlug: 'moda',
    shortDescription: 'Comodidad ligera con una silueta urbana.',
    description:
      'Tenis versátiles para caminar y combinar con atuendos casuales. Su diseño limpio permite usarlos durante toda la semana.',
    price: 38,
    previousPrice: 44,
    image:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=90',
    ],
    badge: 'Oferta',
    featured: false,
    stock: 9,
    options: [{ name: 'Talla', values: ['37', '38', '39', '40', '41'] }],
  },
  {
    id: 'prod-perfume-classic',
    name: 'Fragancia Classic',
    slug: 'fragancia-classic',
    categorySlug: 'perfumes',
    shortDescription: 'Aroma elegante y equilibrado para cualquier ocasión.',
    description:
      'Una fragancia versátil con presencia suave y duradera. Ideal para quienes buscan un aroma elegante que funcione tanto de día como de noche.',
    price: 34.99,
    image:
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=90',
    ],
    badge: 'Favorito',
    featured: true,
    stock: 7,
    options: [{ name: 'Presentación', values: ['50 ml', '100 ml'] }],
  },
  {
    id: 'prod-perfume-floral',
    name: 'Fragancia Floral Mist',
    slug: 'fragancia-floral-mist',
    categorySlug: 'perfumes',
    shortDescription: 'Notas florales frescas con un acabado delicado.',
    description:
      'Fragancia fresca de carácter floral, creada para el uso diario. Su presentación compacta es práctica para llevar en el bolso.',
    price: 29.99,
    image:
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=90',
    ],
    featured: false,
    stock: 11,
    options: [{ name: 'Presentación', values: ['50 ml', '80 ml'] }],
  },
  {
    id: 'prod-watch',
    name: 'Reloj Minimal',
    slug: 'reloj-minimal',
    categorySlug: 'accesorios',
    shortDescription: 'Diseño limpio para combinar con cualquier estilo.',
    description:
      'Reloj de estilo minimalista con correa cómoda y una esfera fácil de leer. Una pieza sencilla para completar atuendos casuales o formales.',
    price: 27,
    image:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=90',
    ],
    featured: true,
    stock: 10,
    options: [{ name: 'Color', values: ['Negro', 'Café'] }],
  },
  {
    id: 'prod-glasses',
    name: 'Lentes Urban Sun',
    slug: 'lentes-urban-sun',
    categorySlug: 'accesorios',
    shortDescription: 'Protección y estilo en un diseño ligero.',
    description:
      'Lentes de sol livianos y cómodos para acompañarte todos los días. Su forma versátil combina con distintos estilos.',
    price: 18.75,
    image:
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=85',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=90',
    ],
    badge: 'Popular',
    featured: false,
    stock: 14,
    options: [{ name: 'Color', values: ['Negro', 'Carey'] }],
  },
]

export const getCategoryBySlug = (slug?: string) =>
  categories.find((category) => category.slug === slug)

export const getProductBySlug = (slug?: string) =>
  products.find((product) => product.slug === slug)

export const getProductsByCategory = (slug?: string) =>
  products.filter((product) => product.categorySlug === slug)