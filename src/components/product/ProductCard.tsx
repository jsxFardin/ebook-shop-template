import { Eye, Heart, ShoppingCart } from 'lucide-react'
import type { Product } from '../../types'
import L from '../common/L'
import ProductArt from '../common/ProductArt'
import { Price } from '../common/ui'
import { authorLine } from '../../data'
import { discountPct } from '../../utils/catalog'
import { useAddToCart, useWish } from '../../hooks/useShop'
import { useUi } from '../../stores/ui'
import { useT } from '../../i18n'

export function ByLine({ p, className = '' }: { p: Product; className?: string }) {
  const { t } = useT()
  const people = authorLine(p)
  const base = p.type === 'book' ? '/authors/' : '/brands/'
  return (
    <p className={`line-clamp-2 text-[10px] leading-snug text-muted sm:text-xs ${className}`}>
      {t('by')}{' '}
      {people.length ? people.map((a, i) => (
        <span key={a.slug}>
          {i > 0 && ' , '}
          <L to={base + a.slug} className="text-link hover:text-accent-dark hover:underline">{a.nameBn ? `${a.nameBn} , ${a.name}` : a.name}</L>
        </span>
      )) : <span className="text-link">N/A</span>}
    </p>
  )
}

export default function ProductCard({ p }: { p: Product }) {
  const { t } = useT()
  const add = useAddToCart()
  const wish = useWish(p)
  const quick = useUi((s) => s.setQuickView)
  const off = discountPct(p)
  const out = p.stock <= 0
  return (
    <article className="group flex h-full flex-col rounded border border-border bg-surface transition-shadow duration-200 hover:shadow-lg">
      <div className="relative">
        <L to={`/products/${p.slug}`} className={`block aspect-square overflow-hidden p-1.5 sm:p-2 ${out ? 'bg-gray-400/40' : ''}`}>
          <ProductArt product={p} className={`transition-transform duration-300 group-hover:scale-[1.03] ${out ? 'opacity-70' : ''}`} />
        </L>
        {off > 0 && <span className="absolute right-1 top-1 rounded bg-sale px-1 py-0.5 text-[9px] font-bold text-white sm:right-2 sm:top-2 sm:px-1.5 sm:text-xs">-{off}%</span>}
        {out && <span className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-sale px-2 py-1 text-[9px] font-bold uppercase text-white sm:text-xs">{t('outOfStock')}</span>}
        <button
          onClick={() => quick(p.id)}
          className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full bg-navy/90 px-3 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 md:flex"
        >
          <Eye size={14} /> Quick view
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-1.5 pb-1.5 sm:px-3 sm:pb-3">
        <h3 className="line-clamp-1 text-[11px] font-medium sm:text-sm" title={p.title}>
          <L to={`/products/${p.slug}`} className="hover:text-accent-dark">{p.title}</L>
        </h3>
        <ByLine p={p} />
        <div className="mt-auto flex items-center justify-between gap-1 pt-1">
          <Price price={p.price} original={p.originalPrice} size="sm" />
          <button onClick={wish.toggle} aria-pressed={wish.on} aria-label={wish.on ? 'Remove from wishlist' : 'Add to wishlist'} className="shrink-0 p-0.5 text-muted hover:text-sale">
            <Heart size={16} className={wish.on ? 'fill-sale text-sale' : ''} />
          </button>
        </div>
        <button onClick={() => add(p)} disabled={out} className="btn-cart mt-1 w-full py-1.5 text-[10px] sm:py-2 sm:text-sm">
          <ShoppingCart size={15} className="hidden sm:block" /> {out ? t('outOfStock') : t('addToCart')}
        </button>
      </div>
    </article>
  )
}
