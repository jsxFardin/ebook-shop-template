import { Heart, ShoppingCart } from 'lucide-react'
import type { Product } from '../../types'
import L from '../common/L'
import ProductArt from '../common/ProductArt'
import { Price, Stars } from '../common/ui'
import { ByLine } from './ProductCard'
import { categoryBySlug } from '../../data'
import { discountPct } from '../../utils/catalog'
import { useAddToCart, useWish } from '../../hooks/useShop'
import { useT } from '../../i18n'

/** List-view row for the listing page's grid/list toggle. */
export default function ProductRow({ p }: { p: Product }) {
  const { t } = useT()
  const add = useAddToCart()
  const wish = useWish(p)
  const off = discountPct(p)
  return (
    <article className="flex gap-3 rounded border border-border bg-surface p-3 hover:shadow-md sm:gap-5">
      <L to={`/products/${p.slug}`} className="relative h-32 w-24 shrink-0 sm:h-40 sm:w-32">
        <ProductArt product={p} />
        {off > 0 && <span className="absolute right-0 top-0 rounded bg-sale px-1 text-[10px] font-bold text-white">-{off}%</span>}
      </L>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <L to={`/products/${p.slug}`} className="line-clamp-2 font-medium hover:text-accent-dark sm:text-lg">{p.title}</L>
        <ByLine p={p} className="!text-xs sm:!text-sm" />
        <p className="text-xs text-subtle">{categoryBySlug.get(p.category)?.name}</p>
        {p.rating > 0 && <div className="flex items-center gap-1 text-xs text-muted"><Stars value={p.rating} size={12} />({p.reviews.length})</div>}
        <p className="line-clamp-2 hidden text-sm text-muted sm:block">{p.description[0]}</p>
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
          <Price price={p.price} original={p.originalPrice} />
          <span className={`text-xs font-medium ${p.stock > 0 ? 'text-instock' : 'text-sale'}`}>{p.stock > 0 ? t('inStock') : t('outOfStock')}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={wish.toggle} aria-pressed={wish.on} aria-label="Toggle wishlist" className="rounded border border-border p-2 hover:border-sale"><Heart size={16} className={wish.on ? 'fill-sale text-sale' : 'text-muted'} /></button>
            <button onClick={() => add(p)} disabled={p.stock <= 0} className="btn-cart px-4 py-2"><ShoppingCart size={15} />{p.stock > 0 ? t('addToCart') : t('outOfStock')}</button>
          </div>
        </div>
      </div>
    </article>
  )
}
