import { useMemo } from 'react'
import type { Product } from '../types'
import { useCart, useWishlist } from '../stores/shop'
import { useUi } from '../stores/ui'
import { useT } from '../i18n'
import { productById } from '../data'
import { cartTotals } from '../utils/catalog'

export function useAddToCart() {
  const add = useCart((s) => s.add)
  const toast = useUi((s) => s.toast)
  const { t } = useT()
  return (p: Product, qty = 1) => {
    if (p.stock <= 0) return
    add(p.id, qty, p.stock)
    toast(`${t('addedToCart')}: ${p.title}`)
  }
}

export function useWish(p: Product) {
  const on = useWishlist((s) => s.ids.includes(p.id))
  const toggle = useWishlist((s) => s.toggle)
  const toast = useUi((s) => s.toast)
  const { t } = useT()
  return { on, toggle: () => toast(toggle(p.id) ? t('addedToWishlist') : t('removedFromWishlist'), 'info') }
}

/** Cart lines joined with catalog data; drops ids no longer in the catalog. */
export function useCartLines(zone: 'inside' | 'outside' | null = null) {
  const items = useCart((s) => s.items)
  const coupon = useCart((s) => s.coupon)
  return useMemo(() => {
    const lines = items.flatMap((i) => {
      const p = productById.get(i.id)
      return p ? [{ product: p, qty: i.qty, price: p.price, originalPrice: p.originalPrice }] : []
    })
    return { lines, totals: cartTotals(lines, zone, coupon), coupon }
  }, [items, coupon, zone])
}
