import { Heart, ShoppingCart, Trash2 } from 'lucide-react'
import L from '../../components/common/L'
import ProductArt from '../../components/common/ProductArt'
import { Breadcrumbs, EmptyState, Price } from '../../components/common/ui'
import { useWishlist } from '../../stores/shop'
import { useAddToCart } from '../../hooks/useShop'
import { productById } from '../../data'
import { useT } from '../../i18n'

export default function WishlistPage() {
  const { t } = useT()
  const ids = useWishlist((s) => s.ids)
  const remove = useWishlist((s) => s.remove)
  const add = useAddToCart()
  const items = ids.map((id) => productById.get(id)).filter((p) => !!p)
  const addAll = () => items.filter((p) => p.stock > 0).forEach((p) => add(p))
  return (
    <div className="container-mb pb-10">
      <Breadcrumbs items={[{ label: t('wishlist') }]} />
      <div className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <h1 className="text-xl font-bold">{t('yourWishlist')} <span className="text-base font-normal text-muted">({items.length})</span></h1>
          {items.some((p) => p.stock > 0) && <button onClick={addAll} className="btn-cart px-4 py-2"><ShoppingCart size={16} />Add all to cart</button>}
        </div>
        {!items.length ? (
          <EmptyState icon={<Heart size={40} />} title="Your wishlist is empty" text="Tap the heart on any product to save it here for later.">
            <L to="/products" className="btn-accent">Browse products</L>
          </EmptyState>
        ) : (
          <ul className="divide-y divide-border">
            {items.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-4">
                <L to={`/products/${p.slug}`} className="h-24 w-20 shrink-0"><ProductArt product={p} /></L>
                <div className="min-w-0 flex-1">
                  <L to={`/products/${p.slug}`} className="line-clamp-2 font-medium hover:text-accent-dark">{p.title}</L>
                  <Price price={p.price} original={p.originalPrice} />
                  <p className={`text-xs font-medium ${p.stock > 0 ? 'text-instock' : 'text-sale'}`}>{p.stock > 0 ? t('inStock') : t('outOfStock')}</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button onClick={() => add(p)} disabled={p.stock <= 0} className="btn-cart px-3 py-2"><ShoppingCart size={15} /><span className="hidden sm:inline">{t('addToCart')}</span></button>
                  <button onClick={() => remove(p.id)} aria-label={`Remove ${p.title}`} className="btn-outline px-3 py-2"><Trash2 size={15} /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
