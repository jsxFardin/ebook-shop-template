import { useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { ChevronDown, ChevronRight, LayoutGrid, List, PackageSearch, Search, SlidersHorizontal, X } from 'lucide-react'
import type { Product } from '../../types'
import ProductGrid from '../../components/product/ProductGrid'
import ProductRow from '../../components/product/ProductRow'
import { Breadcrumbs, Drawer, EmptyState, Pagination } from '../../components/common/ui'
import {
  products, catalogCtx, categoryBySlug, categoryTrail, childrenOf, rootCategories, productCountByCategory,
  authorBySlug, publisherBySlug, brandBySlug,
} from '../../data'
import { filterProducts, sortProducts, paginate, PRICE_RANGES, SORTS, type Query, type SortKey } from '../../utils/catalog'

const PER_PAGE = 20
// reference sort_by values → ours
const SORT_ALIAS: Record<string, SortKey> = { latest_upload: 'newest', sold_count: 'bestselling' }
const list = (v: string | null) => (v ? v.split(',').filter(Boolean) : [])

function useListingQuery() {
  const [sp, setSp] = useSearchParams()
  const sortRaw = sp.get('sort_by') ?? 'newest'
  const sort = (SORT_ALIAS[sortRaw] ?? (SORTS.some((s) => s.key === sortRaw) ? sortRaw : 'newest')) as SortKey
  const type = (sp.get('type') ?? sp.get('category_type')) as Query['type'] | null
  const q: Query = {
    category: sp.get('category') ?? undefined,
    search: sp.get('search') ?? undefined,
    type: type === 'book' || type === 'general' ? type : undefined,
    price: sp.get('price') ?? undefined,
    min: sp.get('min') ? Number(sp.get('min')) : undefined,
    max: sp.get('max') ? Number(sp.get('max')) : undefined,
    authors: list(sp.get('author')),
    publishers: list(sp.get('publisher')),
    brands: list(sp.get('brand')),
    stock: (sp.get('stock') as Query['stock']) ?? undefined,
  }
  /** Patch params; any filter change resets to page 1. */
  const patch = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(sp)
    for (const [k, v] of Object.entries(changes)) if (v) next.set(k, v); else next.delete(k)
    if (!('page' in changes)) next.delete('page')
    if ('type' in changes) next.delete('category_type')
    setSp(next)
  }
  return { sp, q, sort, page: Number(sp.get('page') ?? 1), view: sp.get('view') === 'list' ? 'list' : 'grid', patch, setSp }
}

export default function ProductsPage() {
  const { sp, q, sort, page, view, patch, setSp } = useListingQuery()
  const [filtersOpen, setFiltersOpen] = useState(false)
  // facets are counted on the category+search base so options don't vanish as you tick them
  const base = useMemo(() => filterProducts(products, { category: q.category, search: q.search }, catalogCtx), [q.category, q.search])
  const result = useMemo(() => sortProducts(filterProducts(products, q, catalogCtx), sort), [sp]) // eslint-disable-line react-hooks/exhaustive-deps
  const pg = paginate(result, page, PER_PAGE)

  const cat = q.category ? categoryBySlug.get(q.category) : undefined
  const title = q.search ? `Search results for “${q.search}”` : cat ? cat.name : sort === 'bestselling' ? 'Bestsellers' : sort === 'featured' ? 'Featured Products' : 'All Products'
  const chips = activeChips(q, patch)
  const clearAll = () => setSp(new URLSearchParams(q.search ? { search: q.search } : {}))

  const filters = <Filters q={q} base={base} patch={patch} onClear={clearAll} />
  return (
    <div className="bg-page-alt pb-10">
      <div className="container-mb">
        <Breadcrumbs items={[{ label: 'Products', to: '/products' }, ...(cat ? categoryTrail(cat.slug).map((c) => ({ label: c.name, to: `/products?category=${c.slug}` })) : []), ...(q.search ? [{ label: `“${q.search}”` }] : [])]} />
        <div className="flex gap-5">
          <aside className="hidden w-64 shrink-0 lg:block">{filters}</aside>
          <div className="min-w-0 flex-1">
            <div className="panel mb-4 p-3 sm:p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="mr-auto min-w-0">
                  <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
                  <p className="text-xs text-muted">{pg.total ? `Showing ${pg.from}–${pg.to} of ${pg.total} products` : 'No products found'}</p>
                </div>
                <button onClick={() => setFiltersOpen(true)} className="btn-outline px-3 py-1.5 lg:hidden"><SlidersHorizontal size={16} />Filters{chips.length > 0 && ` (${chips.length})`}</button>
                <label className="flex items-center gap-2 text-sm">
                  <span className="hidden text-muted sm:inline">Sort by:</span>
                  <select value={sort} onChange={(e) => patch({ sort_by: e.target.value })} className="input w-auto py-1.5 pr-8">
                    {SORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </label>
                <div className="hidden gap-1 sm:flex" role="group" aria-label="View">
                  {(['grid', 'list'] as const).map((v) => (
                    <button key={v} onClick={() => patch({ view: v === 'grid' ? null : v, page: String(page) })} aria-pressed={view === v} aria-label={`${v} view`}
                      className={`rounded p-1.5 ${view === v ? 'bg-accent-tint text-accent-dark' : 'text-muted hover:bg-surface-2'}`}>
                      {v === 'grid' ? <LayoutGrid size={18} /> : <List size={18} />}
                    </button>
                  ))}
                </div>
              </div>
              {chips.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
                  <span className="text-muted">Active Filters:</span>
                  {chips.map((c) => (
                    <button key={c.key} onClick={c.remove} className="inline-flex items-center gap-1 rounded-full bg-accent-tint px-2.5 py-0.5 text-xs font-medium text-accent-dark hover:bg-accent/20">
                      {c.label}<X size={12} />
                    </button>
                  ))}
                  <button onClick={clearAll} className="ml-auto text-xs font-medium text-sale hover:underline">Clear all</button>
                </div>
              )}
            </div>

            {pg.items.length ? (
              view === 'list' ? <div className="space-y-3">{pg.items.map((p) => <ProductRow key={p.id} p={p} />)}</div> : <ProductGrid items={pg.items} cols={4} />
            ) : (
              <div className="panel">
                <EmptyState icon={<PackageSearch size={40} />} title="No products found" text={q.search ? `Nothing matches “${q.search}” with these filters. Check the spelling or remove a filter.` : 'Remove a filter or widen the price range to see more products.'}>
                  {chips.length > 0 && <button onClick={clearAll} className="btn-accent">Clear filters</button>}
                </EmptyState>
              </div>
            )}

            {pg.pages > 1 && (
              <div className="panel mt-5 flex flex-wrap items-center justify-between gap-3 p-3 text-sm text-muted">
                <span>Showing {pg.from} - {pg.to} of {pg.total} results</span>
                <Pagination page={pg.page} pages={pg.pages} onChange={(n) => patch({ page: String(n) })} />
              </div>
            )}
          </div>
        </div>
      </div>
      <Drawer open={filtersOpen} onClose={() => setFiltersOpen(false)} title={<><SlidersHorizontal size={18} />Filters</>}>
        <div className="p-3">{filters}</div>
        <div className="sticky bottom-0 border-t border-border bg-surface p-3"><button onClick={() => setFiltersOpen(false)} className="btn-accent w-full">Show {result.length} products</button></div>
      </Drawer>
    </div>
  )
}

function activeChips(q: Query, patch: (c: Record<string, string | null>) => void) {
  const chips: { key: string; label: string; remove: () => void }[] = []
  if (q.category) chips.push({ key: 'cat', label: categoryBySlug.get(q.category)?.name ?? q.category, remove: () => patch({ category: null }) })
  if (q.type) chips.push({ key: 'type', label: q.type === 'book' ? 'Books' : 'General products', remove: () => patch({ type: null }) })
  if (q.price) chips.push({ key: 'price', label: PRICE_RANGES.find((r) => r.key === q.price)?.label ?? q.price, remove: () => patch({ price: null }) })
  if (q.min != null || q.max != null) chips.push({ key: 'mm', label: `৳${q.min ?? 0} – ৳${q.max ?? '∞'}`, remove: () => patch({ min: null, max: null }) })
  if (q.stock) chips.push({ key: 'stock', label: q.stock === 'in' ? 'In stock' : 'Out of stock', remove: () => patch({ stock: null }) })
  const multi = (field: 'author' | 'publisher' | 'brand', vals: string[] | undefined, name: (s: string) => string | undefined) =>
    vals?.forEach((v) => chips.push({ key: field + v, label: name(v) ?? v, remove: () => patch({ [field]: vals.filter((x) => x !== v).join(',') || null }) }))
  multi('author', q.authors, (s) => authorBySlug.get(s)?.name)
  multi('publisher', q.publishers, (s) => publisherBySlug.get(s)?.name)
  multi('brand', q.brands, (s) => brandBySlug.get(s)?.name)
  return chips
}

function Section({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-border px-4 py-3 first:border-t-0">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between py-1 font-semibold">
        {title}<ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  )
}

function Filters({ q, base, patch, onClear }: { q: Query; base: Product[]; patch: (c: Record<string, string | null>) => void; onClear: () => void }) {
  const [min, setMin] = useState(q.min?.toString() ?? '')
  const [max, setMax] = useState(q.max?.toString() ?? '')
  const facet = (field: 'authors' | 'publisher' | 'brand', lookup: Map<string, { name: string; nameBn?: string }>) => {
    const counts = new Map<string, number>()
    for (const p of base) for (const s of field === 'authors' ? p.authors : p[field] ? [p[field]!] : []) counts.set(s, (counts.get(s) ?? 0) + 1)
    return [...counts].sort((a, b) => b[1] - a[1]).map(([slug, n]) => ({ slug, n, label: lookup.get(slug)?.name ?? slug }))
  }
  const authorsF = facet('authors', authorBySlug)
  const pubsF = facet('publisher', publisherBySlug)
  const brandsF = facet('brand', brandBySlug)
  const radio = 'h-4 w-4 accent-[#ff9900]'
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-lg font-bold">Filters</h2>
        <button onClick={onClear} className="text-sm font-medium text-sale hover:underline">Clear all</button>
      </div>
      <Section title="Category"><CategoryTree current={q.category} onPick={(slug) => patch({ category: slug })} /></Section>
      <Section title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => (
            <label key={r.key} className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="price" className={radio} checked={q.price === r.key} onChange={() => patch({ price: r.key, min: null, max: null })} />{r.label}
            </label>
          ))}
        </div>
        <form className="mt-3 flex items-center gap-2" onSubmit={(e) => { e.preventDefault(); patch({ min: min || null, max: max || null, price: null }) }}>
          <input aria-label="Minimum price" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ''))} placeholder="Min" className="input px-2 py-1.5" />
          <span className="text-subtle">–</span>
          <input aria-label="Maximum price" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ''))} placeholder="Max" className="input px-2 py-1.5" />
          <button className="rounded bg-navy-2 px-2.5 py-1.5 text-sm font-medium text-white hover:bg-navy">Go</button>
        </form>
      </Section>
      <Section title="Product Type">
        {(['book', 'general'] as const).map((ty) => (
          <label key={ty} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input type="checkbox" className={radio} checked={q.type === ty} onChange={() => patch({ type: q.type === ty ? null : ty })} />
            {ty === 'book' ? '📚 Books' : '🛍️ General products'}
          </label>
        ))}
      </Section>
      <Section title="Availability">
        {(['in', 'out'] as const).map((s) => (
          <label key={s} className="flex cursor-pointer items-center gap-2 py-1 text-sm">
            <input type="checkbox" className={radio} checked={q.stock === s} onChange={() => patch({ stock: q.stock === s ? null : s })} />
            {s === 'in' ? 'In stock' : 'Out of stock'} <span className="text-xs text-subtle">({base.filter((p) => (s === 'in' ? p.stock > 0 : p.stock === 0)).length})</span>
          </label>
        ))}
      </Section>
      {authorsF.length > 0 && <FacetList title="Author" field="author" items={authorsF} selected={q.authors ?? []} patch={patch} />}
      {pubsF.length > 0 && <FacetList title="Publisher" field="publisher" items={pubsF} selected={q.publishers ?? []} patch={patch} />}
      {brandsF.length > 0 && <FacetList title="Brand" field="brand" items={brandsF} selected={q.brands ?? []} patch={patch} />}
    </div>
  )
}

function FacetList({ title, field, items, selected, patch }: { title: string; field: string; items: { slug: string; n: number; label: string }[]; selected: string[]; patch: (c: Record<string, string | null>) => void }) {
  const [q, setQ] = useState('')
  const [all, setAll] = useState(false)
  const shown = items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase()))
  const toggle = (slug: string) => {
    const next = selected.includes(slug) ? selected.filter((s) => s !== slug) : [...selected, slug]
    patch({ [field]: next.join(',') || null })
  }
  return (
    <Section title={title} defaultOpen={selected.length > 0}>
      {items.length > 6 && (
        <label className="relative mb-2 block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}s...`} className="input py-1.5 pl-8 text-xs" />
        </label>
      )}
      <div className="max-h-56 space-y-1 overflow-y-auto">
        {(all || q ? shown : shown.slice(0, 6)).map((i) => (
          <label key={i.slug} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-[#ff9900]" checked={selected.includes(i.slug)} onChange={() => toggle(i.slug)} />
            <span className="flex-1 truncate">{i.label}</span><span className="text-xs text-subtle">{i.n}</span>
          </label>
        ))}
      </div>
      {!q && shown.length > 6 && <button onClick={() => setAll(!all)} className="mt-2 text-xs font-medium text-link">{all ? 'Show less' : `Show all ${shown.length}`}</button>}
    </Section>
  )
}

function CategoryTree({ current, onPick }: { current?: string; onPick: (slug: string | null) => void }) {
  const trail = current ? categoryTrail(current).map((c) => c.slug) : []
  const [open, setOpen] = useState<string[]>(trail)
  const [q, setQ] = useState('')
  const Node = ({ slug, depth }: { slug: string; depth: number }) => {
    const c = categoryBySlug.get(slug)!
    const kids = childrenOf(slug)
    const isOpen = open.includes(slug)
    return (
      <li>
        <div className={`flex items-center rounded ${current === slug ? 'bg-accent-tint font-semibold text-accent-dark' : 'hover:bg-surface-2'}`} style={{ paddingLeft: depth * 12 }}>
          {kids.length ? (
            <button onClick={() => setOpen(isOpen ? open.filter((s) => s !== slug) : [...open, slug])} aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${c.name}`} className="p-1 text-subtle">
              {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : <span className="w-[22px]" />}
          <button onClick={() => onPick(current === slug ? null : slug)} className="flex-1 truncate py-1 text-left text-sm">{c.name}</button>
          <span className="pr-2 text-[11px] text-subtle">{productCountByCategory.get(slug) ?? 0}</span>
        </div>
        {isOpen && kids.length > 0 && <ul>{kids.map((k) => <Node key={k.slug} slug={k.slug} depth={depth + 1} />)}</ul>}
      </li>
    )
  }
  const ql = q.trim().toLowerCase()
  return (
    <>
      <label className="relative mb-2 block"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search categories..." className="input py-1.5 pl-8 text-xs" />
      </label>
      <ul className="max-h-72 overflow-y-auto">
        {ql
          ? [...categoryBySlug.values()].filter((c) => c.name.toLowerCase().includes(ql)).map((c) => <Node key={c.slug} slug={c.slug} depth={0} />)
          : rootCategories.map((c) => <Node key={c.slug} slug={c.slug} depth={0} />)}
      </ul>
    </>
  )
}
