import { useState } from 'react'
import { ChevronDown, Menu, Search } from 'lucide-react'
import L from '../common/L'
import { Drawer } from '../common/ui'
import { categories, childrenOf, productCountByCategory, rootCategories } from '../../data'
import { useUi } from '../../stores/ui'
import { useT } from '../../i18n'

export default function CategoryDrawer() {
  const { t } = useT()
  const open = useUi((s) => s.panel === 'categories')
  const close = useUi((s) => s.close)
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const ql = q.trim().toLowerCase()
  const matches = ql ? categories.filter((c) => c.name.toLowerCase().includes(ql)) : null
  const count = (slug: string) => productCountByCategory.get(slug) ?? 0
  return (
    <Drawer open={open} onClose={close} title={<><Menu size={20} />{t('allCategories')}</>}>
      <div className="border-b border-border p-3">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('searchCategories')} className="input rounded-lg bg-surface-2 pl-9" />
        </label>
      </div>
      {matches ? (
        <ul className="py-2">
          {matches.map((c) => <li key={c.slug}><L to={`/products?category=${c.slug}`} onClick={close} className="block px-4 py-2.5 text-sm hover:bg-surface-2 hover:text-accent-dark">{c.name}</L></li>)}
          {!matches.length && <li className="px-4 py-6 text-center text-sm text-muted">No categories match “{q}”.</li>}
        </ul>
      ) : (
        <ul className="py-2">
          {rootCategories.map((c) => {
            const kids = childrenOf(c.slug)
            const isOpen = expanded === c.slug
            return (
              <li key={c.slug}>
                <div className={`flex items-center ${isOpen ? 'bg-accent-tint text-accent-dark' : ''}`}>
                  <L to={`/products?category=${c.slug}`} onClick={close} className="flex flex-1 items-center gap-2 px-4 py-2.5 text-sm hover:text-accent-dark">
                    {c.name}
                    {kids.length > 0 && <span className="rounded-full bg-surface-2 px-1.5 text-[10px] font-semibold text-muted">{count(c.slug)}</span>}
                  </L>
                  {kids.length > 0 && (
                    <button onClick={() => setExpanded(isOpen ? null : c.slug)} aria-expanded={isOpen} aria-label={`Show ${c.name} subcategories`} className="px-4 py-2.5 text-muted">
                      <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>
                {isOpen && (
                  <ul className="anim-fade border-l-2 border-accent/40 bg-page-alt py-1 pl-4">
                    <li><L to={`/products?category=${c.slug}`} onClick={close} className="block px-4 py-2 text-sm font-medium text-link">All {c.name}</L></li>
                    {kids.map((k) => (
                      <li key={k.slug}><L to={`/products?category=${k.slug}`} onClick={close} className="flex justify-between px-4 py-2 text-sm text-muted hover:text-accent-dark">{k.name}<span className="text-xs text-subtle">{count(k.slug)}</span></L></li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
          <li className="mt-2 border-t border-border pt-2"><L to="/products?sort_by=newest" onClick={close} className="block px-4 py-2.5 text-sm hover:text-accent-dark">{t('newArrivals')}</L></li>
          <li><L to="/products?sort_by=bestselling" onClick={close} className="block px-4 py-2.5 text-sm hover:text-accent-dark">{t('bestsellers')}</L></li>
          <li className="md:hidden"><L to="/authors" onClick={close} className="block px-4 py-2.5 text-sm hover:text-accent-dark">{t('authors')}</L></li>
          <li className="md:hidden"><L to="/publishers" onClick={close} className="block px-4 py-2.5 text-sm hover:text-accent-dark">{t('publishers')}</L></li>
          <li className="md:hidden"><L to="/brands" onClick={close} className="block px-4 py-2.5 text-sm hover:text-accent-dark">{t('brands')}</L></li>
        </ul>
      )}
    </Drawer>
  )
}
