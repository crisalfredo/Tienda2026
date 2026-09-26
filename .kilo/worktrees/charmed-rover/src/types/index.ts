export interface Category {
  id: string
  name: string
  slug: string
  description: string
  image?: string
  imageUrl?: string
  isActive?: boolean
  sortOrder?: number
  _count?: { products: number }
}

export interface ProductOption {
  name: string
  values: string[]
}

export interface Product {
  id: string
  categoryId?: string
  name: string
  slug: string
  categorySlug: string
  shortDescription: string
  description: string
  price: number
  previousPrice?: number
  image: string
  images: string[]
  badge?: string
  featured: boolean
  isActive?: boolean
  stock: number
  options?: ProductOption[]
  variants?: ProductVariant[]
  createdAt?: string
  updatedAt?: string
}

export interface ProductVariant {
  id: string
  sku: string
  price: number
  previousPrice?: number
  stock: number
  isDefault: boolean
  isActive: boolean
  values: SelectedOptions
}

export interface SelectedOptions {
  [key: string]: string
}

export interface CartItem {
  cartId: string
  product: Product
  variantId: string
  unitPrice: number
  quantity: number
  selectedOptions: SelectedOptions
}

export interface DeliveryForm {
  name: string
  phone: string
  department: string
  municipality: string
  address: string
  reference: string
  paymentMethod: string
  notes: string
}

export type AdminRole = 'ADMIN' | 'SUPERADMIN'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  isActive?: boolean
  lastLoginAt?: string | null
  createdAt?: string
}

export type OrderStatus =
  | 'AWAITING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItem {
  id: string
  variantId?: string | null
  productName: string
  productSlug: string
  variantLabel?: string | null
  sku: string
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  customerName: string
  customerPhone: string
  department: string
  municipality: string
  address: string
  reference?: string | null
  paymentMethod: string
  notes?: string | null
  adminNotes?: string | null
  subtotal: number
  deliveryFee: number
  total: number
  inventoryCommitted: boolean
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}
