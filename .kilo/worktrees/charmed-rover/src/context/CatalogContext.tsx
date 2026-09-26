import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { categories as demoCategories, products as demoProducts } from '../data/catalog'
import { publicApi } from '../services/api'
import type { Category, Product } from '../types'

interface CatalogValue {
  categories: Category[]
  products: Product[]
  loading: boolean
  error: string | null
  reload: () => Promise<void>
  getCategoryBySlug: (slug?: string) => Category | undefined
  getProductBySlug: (slug?: string) => Product | undefined
  getProductsByCategory: (slug?: string) => Product[]
}

const CatalogContext = createContext<CatalogValue | null>(null)
const demoEnabled = import.meta.env.VITE_ENABLE_DEMO_DATA === 'true'

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = async () => {
    setLoading(true)
    setError(null)
    try {
      const [nextCategories, nextProducts] = await Promise.all([publicApi.categories(), publicApi.products()])
      setCategories(nextCategories)
      setProducts(nextProducts)
    } catch (requestError) {
      if (demoEnabled) {
        setCategories(demoCategories)
        setProducts(demoProducts)
        setError('Vista de demostración: conecta el backend para administrar datos reales.')
      } else {
        setError(requestError instanceof Error ? requestError.message : 'No pudimos cargar el catálogo.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void reload() }, [])

  const value = useMemo<CatalogValue>(() => ({
    categories,
    products,
    loading,
    error,
    reload,
    getCategoryBySlug: (slug) => categories.find((category) => category.slug === slug),
    getProductBySlug: (slug) => products.find((product) => product.slug === slug),
    getProductsByCategory: (slug) => products.filter((product) => product.categorySlug === slug),
  }), [categories, products, loading, error])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const value = useContext(CatalogContext)
  if (!value) throw new Error('useCatalog debe utilizarse dentro de CatalogProvider')
  return value
}
