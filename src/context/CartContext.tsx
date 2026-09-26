import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartItem, Product, SelectedOptions } from '../types'
import { findExactVariant, getPrimaryImage } from '../utils/ProductSelection'

interface AddItemOptions {
  quantity?: number
  selectedOptions?: SelectedOptions
  variantId?: string
  image?: string
}

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  subtotal: number
  addItem: (product: Product, options?: AddItemOptions) => void
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
    return parsed
      .filter((item) => item.variantId && Number.isFinite(item.unitPrice))
      .map((item) => ({
        ...item,
        image: item.image || item.product.image,
      }))
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
    options: AddItemOptions = {},
  ) => {
    const quantity = options.quantity ?? 1
    const requestedOptions = options.selectedOptions ?? {}
    const existingVariants = product.variants ?? []
    const variant = options.variantId
      ? existingVariants.find((item) => item.id === options.variantId && item.isActive)
      : findExactVariant(product, requestedOptions)

    const selectedVariant = variant ?? (!existingVariants.length
      ? {
          id: `demo-${product.id}`,
          sku: `DEMO-${product.id}`,
          price: product.price,
          previousPrice: product.previousPrice,
          stock: product.stock,
          isDefault: true,
          isActive: true,
          values: requestedOptions,
        }
      : undefined)

    if (!selectedVariant || !selectedVariant.isActive || selectedVariant.stock < 1) return

    const selectedOptions = existingVariants.length
      ? { ...selectedVariant.values }
      : requestedOptions
    const selectedImage = options.image || getPrimaryImage(product, selectedOptions)
    const cartId = selectedVariant.id

    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.cartId === cartId)

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartId === cartId
            ? {
              ...item,
                product,
                image: selectedImage,
                selectedOptions,
                quantity: Math.min(item.quantity + quantity, selectedVariant.stock),
              }
            : item,
        )
      }

      return [
        ...currentItems,
        {
          cartId,
          product,
          variantId: selectedVariant.id,
          image: selectedImage,
          unitPrice: selectedVariant.price,
          quantity: Math.min(quantity, selectedVariant.stock),
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

