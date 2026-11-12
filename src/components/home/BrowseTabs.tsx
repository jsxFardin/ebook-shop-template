import { useState } from 'react'
import { BookOpen, Box, UserRound } from 'lucide-react'
import L from '../common/L'
import Avatar from '../common/Avatar'
import { authors, brands, publishers, countFor } from '../../data'
import { useT } from '../../i18n'

const TABS = [
  { key: 'publishers', icon: BookOpen, list: publishers, base: '/publishers/', field: 'publisher' },
  { key: 'authors', icon: UserRound, list: authors, base: '/authors/', field: 'authors' },
  { key: 'brands', icon: Box, list: brands, base: '/brands/', field: 'brand' },
] as const

export default function BrowseTabs() {
  const { t } = useT()
  const [tab, setTab] = useState(0)
  const cur = TABS[tab]
  const labels = [t('browsePublisher'), t('browseAuthor'), t('topBrands')]
  const items = [...cur.list].sort((a, b) => countFor(cur.field, b.slug) - countFor(cur.field, a.slug)).slice(0, 9)
  return (
    <section className="border-t border-border py-6 sm:py-8">
      <div className="container-mb">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div role="tablist" className="scrollbar-none flex overflow-x-auto border-b border-border">
            {TABS.map((tb, i) => (
              <button key={tb.key} role="tab" aria-selected={i === tab} onClick={() => setTab(i)}
                className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold ${i === tab ? 'border-accent bg-accent-tint text-accent-dark' : 'border-transparent text-muted hover:text-foreground'}`}>
                <tb.icon size={15} />{labels[i]}
              </button>
            ))}
          </div>
          <L to={`/${cur.key}`} className="shrink-0 text-sm font-medium text-link hover:text-accent-dark">{t('seeAll')}</L>
        </div>
        <div role="tabpanel" className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:px-0 lg:grid-cols-9">
          {items.map((x) => (
            <L key={x.slug} to={cur.base + x.slug} className="group w-24 shrink-0 text-center sm:w-auto">
              <span className="block rounded-lg border border-border bg-surface p-2 transition-shadow group-hover:shadow-md">
                <Avatar person={x} round={cur.key === 'authors'} className="aspect-square w-full text-xl" />
              </span>
              <span className="mt-1.5 line-clamp-2 block text-xs text-muted group-hover:text-accent-dark">{'nameBn' in x && x.nameBn ? `${x.nameBn}, ${x.name}` : x.name}</span>
            </L>
          ))}
        </div>
      </div>
    </section>
  )
}
