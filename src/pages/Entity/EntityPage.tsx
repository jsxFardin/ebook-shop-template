import { useState } from 'react'
import { useParams } from 'react-router'
import { BookOpen, Search } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import ProductGrid from '../../components/product/ProductGrid'
import { Breadcrumbs, EmptyState, Pagination } from '../../components/common/ui'
import NotFoundPage from '../Static/NotFoundPage'
import { authorBySlug, brandBySlug, publisherBySlug, products, catalogCtx } from '../../data'
import { filterProducts, paginate, sortProducts, SORTS, type SortKey } from '../../utils/catalog'

const CFG = {
  author: { map: authorBySlug, label: 'Author', crumb: 'Authors', to: '/authors', field: 'authors' as const },
  publisher: { map: publisherBySlug, label: 'Publisher', crumb: 'Publishers', to: '/publishers', field: 'publishers' as const },
  brand: { map: brandBySlug, label: 'Brand', crumb: 'Brands', to: '/brands', field: 'brands' as const },
}

export default function EntityPage({ kind }: { kind: keyof typeof CFG }) {
  const { slug = '' } = useParams()
  const cfg = CFG[kind]
  const e = cfg.map.get(slug)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('featured')
  const [page, setPage] = useState(1)
  if (!e) return <NotFoundPage />
  const all = sortProducts(filterProducts(products, { [cfg.field]: [e.slug], search: q }, catalogCtx), sort)
  const pg = paginate(all, page, 20)
  return (
    <div className="pb-10">
      <div className="h-28 bg-gradient-to-r from-sky-100 via-indigo-50 to-sky-100 sm:h-40 dark:from-navy dark:via-navy-2 dark:to-navy" />
      <div className="container-mb">
        <div className="-mt-12 flex flex-wrap items-end gap-4 sm:-mt-16">
          <div className="rounded-lg border border-border bg-surface p-2 shadow"><Avatar person={e} round={kind === 'author'} className="h-24 w-24 text-2xl sm:h-28 sm:w-28" /></div>
          <div className="mb-1 min-w-0 flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl">{e.nameBn ? `${e.nameBn}, ${e.name}` : e.name}</h1>
            <span className="mt-1 inline-flex items-center gap-1 rounded bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800"><BookOpen size={12} />{cfg.label}</span>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <label className="relative flex-1 sm:w-60">
              <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle" />
              <input value={q} onChange={(ev) => { setQ(ev.target.value); setPage(1) }} placeholder={`Search in ${e.name}...`} className="input py-1.5 pl-8" />
            </label>
            <select aria-label="Sort" value={sort} onChange={(ev) => setSort(ev.target.value as SortKey)} className="input w-auto py-1.5">
              {SORTS.map((s) => <option key={s.key} value={s.key}>{s.key === 'featured' ? 'Recommended' : s.label}</option>)}
            </select>
          </div>
        </div>
        <Breadcrumbs items={[{ label: cfg.crumb, to: cfg.to }, { label: e.name }]} />
        <p className="mb-5 max-w-3xl text-sm text-muted">{e.bio}</p>
        {pg.items.length ? <ProductGrid items={pg.items} /> : <EmptyState icon={<Search size={40} />} title="No products found" text={q ? `Nothing by ${e.name} matches “${q}”.` : 'No products listed yet.'} />}
        <div className="panel mt-6 flex flex-wrap items-center justify-between gap-3 p-3 text-sm text-muted">
          <span>Showing {pg.from} - {pg.to} of {pg.total} results</span>
          <Pagination page={pg.page} pages={pg.pages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
