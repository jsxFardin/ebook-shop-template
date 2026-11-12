import { ShoppingCart, Trash2 } from 'lucide-react'
import L from '../common/L'
import ProductArt from '../common/ProductArt'
import { Drawer, QtyStepper, EmptyState } from '../common/ui'
import { useCart } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { useCartLines } from '../../hooks/useShop'
import { formatPrice } from '../../utils/catalog'
import { useT } from '../../i18n'

export default function MiniCart() {
  const { t, lang } = useT()
  const open = useUi((s) => s.panel === 'cart')
  const close = useUi((s) => s.close)
  const { lines, totals } = useCartLines()
  const setQty = useCart((s) => s.setQty)
  const remove = useCart((s) => s.remove)
  return (
    <Drawer open={open} onClose={close} side="right" width="w-[380px]" title={<><ShoppingCart size={20} />{t('cart')} ({totals.count})</>}>
      {!lines.length ? (
        <EmptyState icon={<ShoppingCart size={40} />} title="Your cart is empty" text="Add books or products to see them here.">
          <L to="/products" onClick={close} className="btn-accent">Start Shopping</L>
        </EmptyState>
      ) : (
        <div className="flex h-full flex-col">
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {lines.map(({ product: p, qty }) => (
              <li key={p.id} className="flex gap-3 p-4">
                <L to={`/products/${p.slug}`} onClick={close} className="h-20 w-16 shrink-0"><ProductArt product={p} /></L>
                <div className="min-w-0 flex-1">
                  <L to={`/products/${p.slug}`} onClick={close} className="line-clamp-2 text-sm font-medium hover:text-accent-dark">{p.title}</L>
                  <p className="mt-0.5 text-sm font-semibold text-price">{formatPrice(p.price * qty, lang)}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <QtyStepper small value={qty} max={Math.min(p.stock, 20)} onChange={(n) => setQty(p.id, n, p.stock)} />
                    <button onClick={() => remove(p.id)} aria-label={`Remove ${p.title}`} className="p-1 text-subtle hover:text-sale"><Trash2 size={16} /></button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-3 border-t border-border bg-page-alt p-4">
            <div className="flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-bold">{formatPrice(totals.subtotal, lang)}</span></div>
            {totals.saved > 0 && <p className="text-xs text-instock">You save {formatPrice(totals.saved, lang)} on this order</p>}
            <div className="grid grid-cols-2 gap-2">
              <L to="/cart" onClick={close} className="btn-outline">View Cart</L>
              <L to="/checkout" onClick={close} className="btn-accent">Checkout</L>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
