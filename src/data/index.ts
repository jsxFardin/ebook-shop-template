import type { Category, Person, Product } from '../types'
import productsJson from './products.json'
import categoriesJson from './categories.json'
import authorsJson from './authors.json'
import publishersJson from './publishers.json'
import brandsJson from './brands.json'
export { default as banners } from './banners.json'
export { default as navigation } from './navigation.json'
export { default as homepage } from './homepage-sections.json'
export { default as pages } from './pages.json'

export const products = productsJson as Product[]
export const categories = categoriesJson as Category[]
export const authors = authorsJson as Person[]
export const publishers = publishersJson as Person[]
export const brands = brandsJson as Person[]

const byKey = <T,>(list: T[], key: (t: T) => string) => new Map(list.map((x) => [key(x), x]))
export const productById = byKey(products, (p) => p.id)
export const productBySlug = byKey(products, (p) => p.slug)
export const categoryBySlug = byKey(categories, (c) => c.slug)
export const authorBySlug = byKey(authors, (a) => a.slug)
export const publisherBySlug = byKey(publishers, (a) => a.slug)
export const brandBySlug = byKey(brands, (a) => a.slug)

export const rootCategories = categories.filter((c) => !c.parent)
export const childrenOf = (slug: string) => categories.filter((c) => c.parent === slug)

/** Root-first chain for breadcrumbs. */
export function categoryTrail(slug: string): Category[] {
  const trail: Category[] = []
  for (let c = categoryBySlug.get(slug); c; c = c.parent ? categoryBySlug.get(c.parent) : undefined) trail.unshift(c)
  return trail
}

export const productCountByCategory = (() => {
  const m = new Map<string, number>()
  for (const p of products) for (const c of categoryTrail(p.category)) m.set(c.slug, (m.get(c.slug) ?? 0) + 1)
  return m
})()

export const countFor = (field: 'authors' | 'publisher' | 'brand', slug: string) =>
  products.filter((p) => (field === 'authors' ? p.authors.includes(slug) : p[field] === slug)).length

/** "by Author" line: Bangla name first like the reference, then Latin. */
export const authorLine = (p: Product) =>
  p.type === 'book'
    ? p.authors.map((s) => authorBySlug.get(s)).filter(Boolean) as Person[]
    : ([p.brand && brandBySlug.get(p.brand)].filter(Boolean) as Person[])

const textCache = new Map<string, string>()
/** Lowercased haystack for search: title, people (both scripts), publisher/brand, category, ISBN, SKU. */
export const textOf = (p: Product) => {
  let s = textCache.get(p.id)
  if (!s) {
    const ppl = [...p.authors.map((a) => authorBySlug.get(a)), p.publisher && publisherBySlug.get(p.publisher), p.brand && brandBySlug.get(p.brand)]
      .filter(Boolean)
      .map((x) => `${(x as Person).name} ${(x as Person).nameBn ?? ''}`)
    s = [p.title, ...ppl, categoryBySlug.get(p.category)?.name, p.isbn, p.sku].join(' ').toLowerCase()
    textCache.set(p.id, s)
  }
  return s
}
export const descendants = (slug: string) => {
  const out = new Set([slug])
  for (const c of childrenOf(slug)) for (const d of descendants(c.slug)) out.add(d)
  return out
}
export const catalogCtx = { text: textOf, descendants }

export const DISTRICTS = ['Dhaka', 'Chattogram', 'Gazipur', 'Narayanganj', 'Sylhet', 'Rajshahi', 'Khulna', 'Barishal', 'Rangpur', 'Mymensingh', 'Cumilla', 'Bogura', "Cox's Bazar", 'Jashore', 'Dinajpur']
