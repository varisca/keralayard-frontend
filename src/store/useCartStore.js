import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * useCartStore
 *
 * cartItems shape: { [productId]: quantity }
 *
 * Persisted to localStorage under the key "kerala-yard-cart" so the cart
 * survives page refreshes.
 */
const useCartStore = create(
  persist(
    (set, get) => ({
      // -------------------------------------------------------------------
      // State
      // -------------------------------------------------------------------
      /** { [productId: string]: number } */
      cartItems: {},

      // -------------------------------------------------------------------
      // Mutations
      // -------------------------------------------------------------------

      /**
       * Add one unit of a product to the cart.
       * If the product is already in the cart, increments quantity by 1.
       */
      addToCart: (productId) =>
        set((state) => ({
          cartItems: {
            ...state.cartItems,
            [productId]: (state.cartItems[productId] ?? 0) + 1,
          },
        })),

      /**
       * Remove a product from the cart entirely.
       */
      removeFromCart: (productId) =>
        set((state) => {
          const updated = { ...state.cartItems }
          delete updated[productId]
          return { cartItems: updated }
        }),

      /**
       * Set the exact quantity for a product.
       * If qty <= 0 the item is removed from the cart.
       */
      updateCartItem: (productId, qty) =>
        set((state) => {
          if (qty <= 0) {
            const updated = { ...state.cartItems }
            delete updated[productId]
            return { cartItems: updated }
          }
          return { cartItems: { ...state.cartItems, [productId]: qty } }
        }),

      /**
       * Empty the entire cart.
       */
      clearCart: () => set({ cartItems: {} }),

      // -------------------------------------------------------------------
      // Computed helpers (not memoised — call sparingly in hot paths)
      // -------------------------------------------------------------------

      /**
       * Total number of individual items in the cart.
       */
      getCartCount: () =>
        Object.values(get().cartItems).reduce((sum, qty) => sum + qty, 0),

      /**
       * Total cart value in INR based on the provided products array.
       *
       * @param {Array<{ id: string, sellingPrice: number }>} products
       * @returns {number} Total amount
       */
      getCartAmount: (products = []) => {
        const { cartItems } = get()
        return Object.entries(cartItems).reduce((total, [productId, qty]) => {
          const product = products.find((p) => p.id === productId)
          if (!product) return total
          return total + product.sellingPrice * qty
        }, 0)
      },
    }),
    {
      name: 'kerala-yard-cart',
      // Only persist the raw cartItems map, not the method references
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
)

export default useCartStore
