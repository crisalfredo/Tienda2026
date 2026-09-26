import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Product, SelectedOptions } from '../types'

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  addItem: (
    product: Product,
    quantity?: number,
    selectedOptions?: SelectedOptions,
  ) => void
  removeItem: (cartId: string) => void
  updateQuantity: (cartId: string, quantity: number) => void
  clearCart: () => void
}

const STORAGE_KEY = 'urbano-sv-cart'
const CartContext = createContext<CartContextValue | null>(null)

function getInitialCart(): CartItem[] {
  try {
    const savedCart = localStorage.getItem(STORAGE_KEY)
    if (!savedCart) return []
    const parsed = JSON.parse(savedCart) as CartItem[]
    // Los carritos de versiones anteriores no tenían variantId y no son
    // confiables para crear un pedido validado por el backend.
    return parsed.filter((item) => item.variantId && Number.isFinite(item.unitPrice))
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(getInitialCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (
    product: Product,
    quantity = 1,
    selectedOptions: SelectedOptions = {},
  ) => {
    const variant = (product.variants ?? []).find((item) =>
      Object.entries(selectedOptions).every(([name, value]) => item.values[name] === value),
    ) ?? (product.variants ?? []).find((item) => item.isDefault) ?? product.variants?.[0] ?? {
      id: `demo-${product.id}`,
      sku: `DEMO-${product.id}`,
      price: product.price,
      previousPrice: product.previousPrice,
      stock: product.stock,
      isDefault: true,
      isActive: true,
      values: selectedOptions,
    }

    if (!variant || !variant.isActive || variant.stock < 1) return
    const cartId = variant.id

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartId === cartId)

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartId === cartId
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, variant.stock),
              }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          cartId,
          product,
          variantId: variant.id,
          unitPrice: variant.price,
          quantity: Math.min(quantity, variant.stock),
          selectedOptions,
        },
      ]
    })
  }

  const removeItem = (cartId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.cartId !== cartId),
    )
  }

  const updateQuantity = (cartId: string, quantity: number) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.cartId === cartId
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(
                  quantity,
                  item.product.variants?.find((variant) => variant.id === item.variantId)?.stock ?? item.product.stock,
                ),
              ),
            }
          : item,
      ),
    )
  }

  const clearCart = () => {
    localStorage.removeItem(STORAGE_KEY)
    setItems([])
  }

  const value = useMemo(
    () => ({
      items,
      totalItems: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0,
      ),
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
    }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)

  if (!context) {
    throw new Error('useCart debe utilizarse dentro de CartProvider')
  }

  return context
}
