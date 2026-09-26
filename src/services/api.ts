import type { AdminUser, Category, DeliveryForm, Order, Product } from '../types'

const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api').replace(/\/$/, '')
let csrfToken: string | null = null

export class ApiError extends Error {
  constructor(public status: number, message: string, public code = 'API_ERROR') {
    super(message)
  }
}

async function parse<T>(response: Response): Promise<T> {
  const payload = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(response.status, payload?.error?.message ?? 'No fue posible completar la operación.', payload?.error?.code)
  }
  return payload as T
}

export async function getCsrfToken() {
  const payload = await parse<{ data: { csrfToken: string } }>(
    await fetch(`${API_URL}/admin/auth/csrf`, { credentials: 'include' }),
  )
  csrfToken = payload.data.csrfToken
  return csrfToken
}

export async function apiRequest<T>(path: string, options: RequestInit = {}, protectedMutation = false) {
  const method = options.method?.toUpperCase() ?? 'GET'
  const mutation = !['GET', 'HEAD', 'OPTIONS'].includes(method)
  if (protectedMutation && mutation && !csrfToken) await getCsrfToken()

  const headers = new Headers(options.headers)
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (protectedMutation && mutation && csrfToken) headers.set('X-CSRF-Token', csrfToken)

  return parse<T>(await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  }))
}

export const publicApi = {
  async categories() {
    const payload = await apiRequest<{ data: { categories: Category[] } }>('/categories/public')
    return payload.data.categories.map((category) => ({ ...category, image: category.imageUrl }))
  },
  async products() {
    const payload = await apiRequest<{ data: { items: Product[] } }>('/products?limit=100')
    return payload.data.items
  },
  async createOrder(form: DeliveryForm, items: Array<{ variantId: string; quantity: number }>) {
    const payload = await apiRequest<{ data: { order: Order; whatsappUrl: string } }>('/orders/public', {
      method: 'POST',
      body: JSON.stringify({ items, customer: form }),
    })
    return payload.data
  },
}

export const adminApi = {
  async login(email: string, password: string) {
    await getCsrfToken()
    const payload = await apiRequest<{ data: { user: AdminUser } }>('/admin/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    }, true)
    return payload.data.user
  },
  async me() {
    const payload = await apiRequest<{ data: { user: AdminUser } }>('/admin/auth/me')
    return payload.data.user
  },
  async refresh() {
    await getCsrfToken()
    const payload = await apiRequest<{ data: { user: AdminUser } }>('/admin/auth/refresh', { method: 'POST' }, true)
    return payload.data.user
  },
  async logout() {
    await apiRequest<null>('/admin/auth/logout', { method: 'POST' }, true)
  },
  async uploadImage(file: File, folder: 'products' | 'categories' = 'products') {
    const formData = new FormData()
    formData.append('image', file)
    const payload = await apiRequest<{ data: { url: string; publicId: string; width: number; height: number; format: string; bytes: number } }>(
      `/admin/uploads?folder=${folder}`,
      { method: 'POST', body: formData },
      true,
    )
    return payload.data
  },
  get<T>(path: string) { return apiRequest<T>(path) },
  mutate<T>(path: string, options: RequestInit) { return apiRequest<T>(path, options, true) },
}
