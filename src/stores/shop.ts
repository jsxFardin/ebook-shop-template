import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, Order, User } from '../types'

const MAX_QTY = 20

interface CartState {
  items: CartItem[]
  coupon: string
  add: (id: string, qty?: number, stock?: number) => void
  setQty: (id: string, qty: number, stock?: number) => void
  remove: (id: string) => void
  clear: () => void
  setCoupon: (c: string) => void
}
const clamp = (q: number, stock = MAX_QTY) => Math.max(1, Math.min(q, stock, MAX_QTY))

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: '',
      add: (id, qty = 1, stock) =>
        set((s) => {
          const found = s.items.find((i) => i.id === id)
          return {
            items: found
              ? s.items.map((i) => (i.id === id ? { ...i, qty: clamp(i.qty + qty, stock) } : i))
              : [...s.items, { id, qty: clamp(qty, stock) }],
          }
        }),
      setQty: (id, qty, stock) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty: clamp(qty, stock) } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [], coupon: '' }),
      setCoupon: (coupon) => set({ coupon }),
    }),
    { name: 'mb-cart' },
  ),
)

interface WishState {
  ids: string[]
  toggle: (id: string) => boolean
  remove: (id: string) => void
}
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) => {
        const has = get().ids.includes(id)
        set({ ids: has ? get().ids.filter((x) => x !== id) : [id, ...get().ids] })
        return !has
      },
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
    }),
    { name: 'mb-wishlist' },
  ),
)

interface AuthState {
  user: User | null
  orders: Order[]
  /** Mock auth: any well-formed credentials sign in. No backend. */
  login: (u: User) => void
  logout: () => void
  update: (u: Partial<User>) => void
  addOrder: (o: Order) => void
  cancelOrder: (id: string) => void
}
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      orders: [],
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      update: (u) => set((s) => ({ user: s.user ? { ...s.user, ...u } : s.user })),
      addOrder: (o) => set((s) => ({ orders: [o, ...s.orders] })),
      cancelOrder: (id) => set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'Cancelled' } : o)) })),
    }),
    { name: 'mb-auth' },
  ),
)
