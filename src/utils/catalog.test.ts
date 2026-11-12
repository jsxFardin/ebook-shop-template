// Run with: npm test
import assert from 'node:assert/strict'
import { cartTotals, filterProducts, isBdPhone, pageWindow, paginate, sortProducts, discountPct, formatPrice } from './catalog.ts'
import type { Product } from '../types/index.ts'

const P = (id: string, o: Partial<Product>): Product => ({
  id, slug: id, title: id, type: 'book', category: 'a', authors: [], price: 100, stock: 5, sku: id, description: [], highlights: [],
  images: 1, hue: 0, featured: false, soldCount: 0, createdAt: '2026-01-01', rating: 0, reviews: [], ...o,
})
const list = [
  P('x', { title: 'Admission Guide', category: 'a1', price: 500, originalPrice: 1000, authors: ['ra'], soldCount: 9 }),
  P('y', { title: 'Pen', type: 'general', category: 'b', price: 20000, brand: 'nib', stock: 0 }),
  P('z', { title: 'Novel', category: 'a', price: 300, createdAt: '2026-05-01', publisher: 'pub' }),
]
const ctx = { descendants: (s: string) => new Set(s === 'a' ? ['a', 'a1'] : [s]), text: (p: Product) => p.title.toLowerCase() }

assert.deepEqual(filterProducts(list, { category: 'a' }, ctx).map((p) => p.id), ['x', 'z'])
assert.deepEqual(filterProducts(list, { search: 'guide adm' }, ctx).map((p) => p.id), ['x'])
assert.deepEqual(filterProducts(list, { price: '10000-50000' }, ctx).map((p) => p.id), ['y'])
assert.deepEqual(filterProducts(list, { stock: 'in', type: 'book', authors: ['ra'] }, ctx).map((p) => p.id), ['x'])
assert.deepEqual(filterProducts(list, { publishers: ['pub'] }, ctx).map((p) => p.id), ['z'])
assert.deepEqual(sortProducts(list, 'price_desc').map((p) => p.id), ['x', 'z', 'y'], 'out of stock sorts last')
assert.deepEqual(sortProducts(list, 'newest').map((p) => p.id), ['z', 'x', 'y'])
assert.equal(discountPct(list[0]), 50)

const pg = paginate([1, 2, 3, 4, 5], 9, 2)
assert.deepEqual([pg.page, pg.pages, pg.items, pg.from, pg.to], [3, 3, [5], 5, 5])
assert.deepEqual(pageWindow(6, 12), [1, 0, 5, 6, 7, 0, 12])
assert.deepEqual(pageWindow(1, 2), [1, 2])

const lines = [{ price: 500, originalPrice: 1000, qty: 2 }, { price: 300, qty: 1 }]
assert.deepEqual(cartTotals(lines, 'outside'), { subtotal: 1300, saved: 1000, discount: 0, shipping: 120, total: 1420, count: 3 })
assert.equal(cartTotals(lines, 'inside').shipping, 60)
assert.equal(cartTotals([{ price: 1500, qty: 1 }], 'inside').shipping, 0, 'free inside Dhaka over 1500')
assert.equal(cartTotals(lines, 'inside', 'mamun10').discount, 130)
assert.equal(cartTotals([{ price: 5000, qty: 1 }], null, 'MAMUN10').discount, 200, 'coupon cap')
assert.equal(cartTotals([], 'inside').total, 0)

assert.ok(isBdPhone('01712345678') && isBdPhone('+8801912-345678') && !isBdPhone('01212345678') && !isBdPhone('0171234567'))
assert.equal(formatPrice(12500), '৳12,500')
assert.equal(formatPrice(12500, 'bn'), '৳১২,৫০০')
console.log('catalog tests passed')
