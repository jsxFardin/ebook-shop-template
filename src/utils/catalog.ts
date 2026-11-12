// Pure catalog + cart logic. No runtime imports so it can be checked with `npm test` (node strip-types).
import type { Product, Lang } from '../types'

export type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'bestselling' | 'featured' | 'discount' | 'name'
export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest Arrivals' },
  { key: 'bestselling', label: 'Bestselling' },
  { key: 'featured', label: 'Featured' },
  { key: 'price_asc', label: 'Price: Low to High' },
  { key: 'price_desc', label: 'Price: High to Low' },
  { key: 'discount', label: 'Biggest Discount' },
  { key: 'name', label: 'Name: A to Z' },
]

export const PRICE_RANGES = [
  { key: '0-1000', label: 'Under ৳1,000', min: 0, max: 999 },
  { key: '1000-10000', label: '৳1,000 to ৳10,000', min: 1000, max: 10000 },
  { key: '10000-50000', label: '৳10,000 to ৳50,000', min: 10000, max: 50000 },
  { key: '50000-', label: 'Over ৳50,000', min: 50000, max: Infinity },
]

export interface Query {
  category?: string
  search?: string
  type?: 'book' | 'general'
  price?: string
  min?: number
  max?: number
  authors?: string[]
  publishers?: string[]
  brands?: string[]
  stock?: 'in' | 'out'
}

export interface Ctx {
  /** slug → the slug itself plus every descendant slug */
  descendants: (slug: string) => Set<string>
  /** lowercased searchable text for a product (title, people, isbn, sku…) */
  text: (p: Product) => string
}

export const discountPct = (p: Pick<Product, 'price' | 'originalPrice'>) =>
  p.originalPrice && p.originalPrice > p.price ? Math.round((1 - p.price / p.originalPrice) * 100) : 0

export function filterProducts(list: Product[], q: Query, ctx: Ctx): Product[] {
  const cats = q.category ? ctx.descendants(q.category) : null
  const terms = (q.search ?? '').toLowerCase().split(/\s+/).filter(Boolean)
  const range = PRICE_RANGES.find((r) => r.key === q.price)
  const min = q.min ?? range?.min ?? 0
  const max = q.max ?? range?.max ?? Infinity
  return list.filter(
    (p) =>
      (!cats || cats.has(p.category)) &&
      (!q.type || p.type === q.type) &&
      p.price >= min &&
      p.price <= max &&
      (!q.authors?.length || p.authors.some((a) => q.authors!.includes(a))) &&
      (!q.publishers?.length || (p.publisher && q.publishers.includes(p.publisher))) &&
      (!q.brands?.length || (p.brand && q.brands.includes(p.brand))) &&
      (!q.stock || (q.stock === 'in' ? p.stock > 0 : p.stock === 0)) &&
      (!terms.length || terms.every((t) => ctx.text(p).includes(t))),
  )
}

export function sortProducts(list: Product[], sort: SortKey = 'newest'): Product[] {
  const s = [...list]
  const cmp: Record<SortKey, (a: Product, b: Product) => number> = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    bestselling: (a, b) => b.soldCount - a.soldCount,
    featured: (a, b) => Number(b.featured) - Number(a.featured) || b.soldCount - a.soldCount,
    discount: (a, b) => discountPct(b) - discountPct(a),
    name: (a, b) => a.title.localeCompare(b.title),
  }
  // in-stock first like the reference, then the chosen order
  return s.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0) || cmp[sort](a, b))
}

export function paginate<T>(list: T[], page: number, per: number) {
  const pages = Math.max(1, Math.ceil(list.length / per))
  const current = Math.min(Math.max(1, page), pages)
  const start = (current - 1) * per
  return { items: list.slice(start, start + per), page: current, pages, total: list.length, from: list.length ? start + 1 : 0, to: Math.min(start + per, list.length) }
}

/** Page numbers with ellipsis gaps (0 = gap), e.g. [1,0,4,5,6,0,12]. */
export function pageWindow(page: number, pages: number): number[] {
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages))
  const sorted = [...set].sort((a, b) => a - b)
  return sorted.flatMap((n, i) => (i && n - sorted[i - 1] > 1 ? [0, n] : [n]))
}

export const SHIPPING = { inside: 60, outside: 120, freeOver: 1500 }
export const COUPONS: Record<string, { pct: number; cap: number }> = { MAMUN10: { pct: 10, cap: 200 }, BOOKFAIR: { pct: 15, cap: 300 } }

export function cartTotals(lines: { price: number; originalPrice?: number; qty: number }[], zone: 'inside' | 'outside' | null, coupon?: string) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0)
  const mrp = lines.reduce((s, l) => s + (l.originalPrice ?? l.price) * l.qty, 0)
  const c = coupon ? COUPONS[coupon.toUpperCase()] : undefined
  const discount = c ? Math.min(Math.round((subtotal * c.pct) / 100), c.cap) : 0
  const shipping = !zone || !lines.length ? 0 : zone === 'inside' && subtotal >= SHIPPING.freeOver ? 0 : SHIPPING[zone]
  return { subtotal, saved: mrp - subtotal, discount, shipping, total: subtotal - discount + shipping, count: lines.reduce((s, l) => s + l.qty, 0) }
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯'
export const toBn = (s: string) => s.replace(/\d/g, (d) => BN_DIGITS[+d])
export const formatNumber = (n: number, lang: Lang = 'en') => {
  const s = n.toLocaleString('en-IN')
  return lang === 'bn' ? toBn(s) : s
}
export const formatPrice = (n: number, lang: Lang = 'en') => `৳${formatNumber(n, lang)}`

/** Bangladeshi mobile: 01[3-9] + 8 digits, optional +88 prefix. */
export const isBdPhone = (s: string) => /^(?:\+?88)?01[3-9]\d{8}$/.test(s.replace(/[\s-]/g, ''))
export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())
