import { useState } from 'react'
import { Search, UsersRound } from 'lucide-react'
import type { Person } from '../../types'
import L from '../../components/common/L'
import Avatar from '../../components/common/Avatar'
import { Breadcrumbs, EmptyState, Pagination } from '../../components/common/ui'
import { authors, brands, publishers, countFor } from '../../data'
import { paginate } from '../../utils/catalog'

const LATIN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const BANGLA = 'অআইউএওকখগঘচছজঝটঠডঢতথদধনপফবভমযরলশসহ'.split('')
const PER = 24

type Kind = 'authors' | 'publishers' | 'brands'
const CFG: Record<Kind, { title: string; list: Person[]; field: 'authors' | 'publisher' | 'brand'; round: boolean; noun: string }> = {
  authors: { title: 'Browse Authors', list: authors, field: 'authors', round: true, noun: 'authors' },
  publishers: { title: 'Browse Publishers', list: publishers, field: 'publisher', round: false, noun: 'publishers' },
  brands: { title: 'Browse Brands', list: brands, field: 'brand', round: false, noun: 'brands' },
}

function EntityIndex({ kind }: { kind: Kind }) {
  const cfg = CFG[kind]
  const [q, setQ] = useState('')
  const [letter, setLetter] = useState('All')
  const [page, setPage] = useState(1)
  const ql = q.trim().toLowerCase()
  const filtered = cfg.list
    .filter((x) => !ql || `${x.name} ${x.nameBn ?? ''}`.toLowerCase().includes(ql))
    .filter((x) => letter === 'All' || x.name.toUpperCase().startsWith(letter) || x.nameBn?.startsWith(letter))
    .sort((a, b) => a.name.localeCompare(b.name))
  const pg = paginate(filtered, page, PER)
  const chip = (l: string) => (
    <button key={l} onClick={() => { setLetter(l); setPage(1) }} aria-pressed={letter === l}
      className={`h-8 min-w-8 rounded border px-2 text-xs font-medium ${letter === l ? 'border-accent bg-accent text-gray-900' : 'border-border bg-surface hover:border-accent'}`}>{l}</button>
  )
  return (
    <div className="container-mb pb-10">
      <Breadcrumbs items={[{ label: cfg.title.replace('Browse ', '') }]} />
      <div className="grid gap-6 border-b border-border pb-6 lg:grid-cols-[1fr_300px]">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{cfg.title}</h1>
          <label className="relative mt-4 block max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} placeholder={`Search ${cfg.noun} by name...`} className="input pl-9" />
          </label>
          <div className="mt-4 flex flex-wrap gap-1.5">{['All', ...LATIN].map(chip)}</div>
          {kind !== 'brands' && <div className="mt-1.5 flex flex-wrap gap-1.5">{BANGLA.map(chip)}</div>}
        </div>
        <div className="h-fit rounded-lg bg-accent p-5 text-gray-900">
          <p className="text-lg font-bold">📚 Book Sale</p>
          <p className="mt-1 text-sm">Explore books from your favourite {kind === 'brands' ? 'brands' : 'authors and publishers'} with up to 40% off.</p>
          <L to="/products?sort_by=discount" className="mt-4 block rounded bg-white py-2 text-center text-sm font-semibold hover:bg-gray-50">Shop Now</L>
        </div>
      </div>
      <p className="my-4 text-sm text-muted">Showing {pg.from}-{pg.to} of {pg.total} {cfg.noun}</p>
      {pg.items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 lg:grid-cols-6">
          {pg.items.map((x) => (
            <L key={x.slug} to={`/${kind}/${x.slug}`} className="group overflow-hidden rounded-lg border border-border bg-surface transition-shadow hover:shadow-md">
              <Avatar person={x} className="aspect-square w-full !rounded-none text-3xl" />
              <div className="p-2 text-center">
                <p className="line-clamp-2 text-sm font-medium group-hover:text-accent-dark">{x.nameBn ? `${x.nameBn} , ${x.name}` : x.name}</p>
                <p className="text-xs text-subtle">{countFor(cfg.field, x.slug)} products</p>
              </div>
            </L>
          ))}
        </div>
      ) : (
        <EmptyState icon={<UsersRound size={40} />} title={`No ${cfg.noun} found`} text="Try a different letter or spelling.">
          <button onClick={() => { setQ(''); setLetter('All') }} className="btn-accent">Show all</button>
        </EmptyState>
      )}
      <div className="mt-6 flex justify-center"><Pagination page={pg.page} pages={pg.pages} onChange={setPage} /></div>
    </div>
  )
}

export const AuthorsIndex = () => <EntityIndex kind="authors" />
export const PublishersIndex = () => <EntityIndex kind="publishers" />
export const BrandsIndex = () => <EntityIndex kind="brands" />
