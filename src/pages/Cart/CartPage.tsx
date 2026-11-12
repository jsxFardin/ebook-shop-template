import { useState } from 'react'
import { BookOpen, Flame, Sparkles, ShoppingCart, Target, Trash2, Heart, ShieldCheck } from 'lucide-react'
import L from '../../components/common/L'
import ProductArt from '../../components/common/ProductArt'
import { Breadcrumbs, EmptyState, Price, QtyStepper } from '../../components/common/ui'
import { ByLine } from '../../components/product/ProductCard'
import { useCart, useWishlist } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { useCartLines } from '../../hooks/useShop'
import { COUPONS, formatPrice, SHIPPING } from '../../utils/catalog'
import { useT } from '../../i18n'

export default function CartPage() {
  const { lang } = useT()
  const { lines, totals, coupon } = useCartLines()
  const { setQty, remove, clear, setCoupon } = useCart()
  const wishToggle = useWishlist((s) => s.toggle)
  const wishIds = useWishlist((s) => s.ids)
  const toast = useUi((s) => s.toast)
  const [code, setCode] = useState(coupon)
  const [codeErr, setCodeErr] = useState('')
  const f = (n: number) => formatPrice(n, lang)

  if (!lines.length)
    return (
      <div className="container-mb py-8">
        <div className="panel">
          <EmptyState icon={<ShoppingCart size={44} />} title="Your Cart is Empty" text="Looks like you haven't added any books yet. Explore our collection and find your next great read!">
            <L to="/products" className="btn-accent px-5 py-2.5"><ShoppingCart size={16} />Start Shopping</L>
            <button onClick={() => useUi.getState().open('categories')} className="btn-outline px-5 py-2.5">Browse Categories</button>
          </EmptyState>
          <div className="border-t border-border p-6">
            <h2 className="mb-4 text-center font-semibold">You might like</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[[BookOpen, 'Bestsellers', '/products?sort_by=bestselling'], [Sparkles, 'New Arrivals', '/products?sort_by=newest'], [Target, 'BCS Books', '/products?category=bcs-special'], [Flame, 'Admission', '/products?category=admission-books']].map(([Icon, label, to]) => {
                const I = Icon as typeof BookOpen
                return <L key={label as string} to={to as string} className="flex flex-col items-center gap-2 rounded-lg bg-page-alt p-4 text-sm font-medium hover:bg-accent-tint"><I size={26} className="text-accent" />{label as string}</L>
              })}
            </div>
          </div>
        </div>
      </div>
    )

  const applyCode = (e: React.FormEvent) => {
    e.preventDefault()
    const c = code.trim().toUpperCase()
    if (!c) { setCoupon(''); return setCodeErr('') }
    if (!COUPONS[c]) return setCodeErr('This code is not valid. Try MAMUN10.')
    setCoupon(c); setCodeErr(''); toast(`Coupon ${c} applied`)
  }
  return (
    <div className="bg-page-alt pb-10">
      <div className="container-mb">
        <Breadcrumbs items={[{ label: 'Shopping Cart' }]} />
        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="panel">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h1 className="text-xl font-bold">Shopping Cart <span className="text-base font-normal text-muted">({totals.count} items)</span></h1>
              <button onClick={clear} className="text-sm text-sale hover:underline">Clear cart</button>
            </div>
            <ul className="divide-y divide-border">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex gap-3 p-4 sm:gap-4">
                  <L to={`/products/${p.slug}`} className="h-28 w-20 shrink-0 sm:h-32 sm:w-24"><ProductArt product={p} /></L>
                  <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <L to={`/products/${p.slug}`} className="line-clamp-2 font-medium hover:text-accent-dark">{p.title}</L>
                      <ByLine p={p} />
                      <p className={`mt-1 text-xs font-medium ${p.stock > 0 ? 'text-instock' : 'text-sale'}`}>{p.stock > 0 ? 'In Stock' : 'Out of stock — remove to continue'}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <QtyStepper small value={qty} max={Math.min(p.stock || 1, 20)} onChange={(n) => setQty(p.id, n, p.stock)} />
                        <button onClick={() => remove(p.id)} className="flex items-center gap-1 text-xs text-muted hover:text-sale"><Trash2 size={14} />Remove</button>
                        {!wishIds.includes(p.id) && <button onClick={() => { wishToggle(p.id); remove(p.id); toast('Moved to wishlist', 'info') }} className="flex items-center gap-1 text-xs text-muted hover:text-accent-dark"><Heart size={14} />Save for later</button>}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-bold">{f(p.price * qty)}</p>
                      {qty > 1 && <p className="text-xs text-subtle">{f(p.price)} each</p>}
                      {p.originalPrice && <Price price={p.price} original={p.originalPrice} size="sm" />}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <aside className="h-fit space-y-4 lg:sticky lg:top-4">
            <div className="panel p-4">
              <h2 className="mb-3 text-lg font-bold">Order Summary</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-muted">Subtotal ({totals.count} items)</dt><dd>{f(totals.subtotal)}</dd></div>
                {totals.saved > 0 && <div className="flex justify-between text-instock"><dt>You save</dt><dd>-{f(totals.saved)}</dd></div>}
                {totals.discount > 0 && <div className="flex justify-between text-instock"><dt>Coupon ({coupon})</dt><dd>-{f(totals.discount)}</dd></div>}
                <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd className="text-xs text-muted">Calculated at checkout</dd></div>
                <div className="flex justify-between border-t border-border pt-2 text-base font-bold"><dt>Total</dt><dd className="text-price">{f(totals.subtotal - totals.discount)}</dd></div>
              </dl>
              {totals.subtotal < SHIPPING.freeOver && <p className="mt-3 rounded bg-accent-tint px-3 py-2 text-xs text-accent-dark">Add {f(SHIPPING.freeOver - totals.subtotal)} more for free delivery inside Dhaka.</p>}
              <form onSubmit={applyCode} className="mt-4">
                <label className="text-sm font-medium" htmlFor="coupon">Coupon code</label>
                <div className="mt-1 flex gap-2">
                  <input id="coupon" value={code} onChange={(e) => setCode(e.target.value)} placeholder="MAMUN10" className={`input uppercase ${codeErr ? 'input-error' : ''}`} />
                  <button className="rounded bg-navy-2 px-4 text-sm font-medium text-white hover:bg-navy">Apply</button>
                </div>
                {codeErr && <p className="mt-1 text-xs text-red-600">{codeErr}</p>}
              </form>
              <L to="/checkout" aria-disabled={lines.some((l) => l.product.stock <= 0)} className={`btn-accent mt-4 w-full py-3 text-base ${lines.some((l) => l.product.stock <= 0) ? 'pointer-events-none opacity-50' : ''}`}>Proceed to Checkout</L>
              <L to="/products" className="mt-2 block text-center text-sm text-link hover:underline">Continue shopping</L>
            </div>
            <p className="flex items-center justify-center gap-2 text-xs text-muted"><ShieldCheck size={15} className="text-instock" />Cash on delivery available nationwide</p>
          </aside>
        </div>
      </div>
    </div>
  )
}
