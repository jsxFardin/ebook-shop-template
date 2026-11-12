import { useParams, useSearchParams } from 'react-router'
import { CircleCheck, PackageX } from 'lucide-react'
import L from '../../components/common/L'
import ProductArt from '../../components/common/ProductArt'
import { EmptyState } from '../../components/common/ui'
import { useAuth } from '../../stores/shop'
import { productById } from '../../data'
import { formatPrice } from '../../utils/catalog'
import { STATUS_STYLE, fmtDate } from './Orders'

const STEPS = ['Processing', 'Shipped', 'Delivered'] as const
const PAY = { cod: 'Cash on Delivery', bkash: 'bKash', nagad: 'Nagad', card: 'Card' }

export default function OrderDetail() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const o = useAuth((s) => s.orders.find((x) => x.id === id))
  const cancel = useAuth((s) => s.cancelOrder)
  if (!o) return <div className="panel"><EmptyState icon={<PackageX size={40} />} title="Order not found" text="This order isn't in your account."><L to="/account/orders" className="btn-accent">My Orders</L></EmptyState></div>
  const step = STEPS.indexOf(o.status as (typeof STEPS)[number])
  return (
    <div className="space-y-5">
      {sp.get('placed') && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
          <CircleCheck size={24} className="shrink-0" />
          <div><p className="font-bold">Order placed — thank you!</p><p className="text-sm">We'll call {o.address.phone} to confirm. Order number <b>#{o.id}</b>.</p></div>
        </div>
      )}
      <section className="panel p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-bold">Order #{o.id}</h1>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status]}`}>{o.status}</span>
          <span className="text-sm text-muted">{fmtDate(o.date)}</span>
          {o.status === 'Processing' && <button onClick={() => cancel(o.id)} className="ml-auto text-sm font-medium text-sale hover:underline">Cancel order</button>}
        </div>
        {o.status !== 'Cancelled' && (
          <ol className="mt-5 flex items-center">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center last:flex-none">
                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${i <= step ? 'bg-accent text-gray-900' : 'bg-surface-2 text-subtle'}`}>{i + 1}</span>
                <span className={`ml-2 text-xs sm:text-sm ${i <= step ? 'font-semibold' : 'text-subtle'}`}>{s}</span>
                {i < STEPS.length - 1 && <span className={`mx-2 h-0.5 flex-1 ${i < step ? 'bg-accent' : 'bg-border'}`} />}
              </li>
            ))}
          </ol>
        )}
      </section>
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <section className="panel">
          <h2 className="border-b border-border p-4 font-bold">Items</h2>
          <ul className="divide-y divide-border">
            {o.items.map((it) => {
              const p = productById.get(it.id)
              return (
                <li key={it.id} className="flex items-center gap-3 p-4">
                  {p && <L to={`/products/${p.slug}`} className="h-16 w-12 shrink-0"><ProductArt product={p} /></L>}
                  <span className="flex-1 text-sm">{it.title}<span className="block text-xs text-subtle">{formatPrice(it.price)} × {it.qty}</span></span>
                  <span className="font-medium">{formatPrice(it.price * it.qty)}</span>
                </li>
              )
            })}
          </ul>
        </section>
        <aside className="space-y-5">
          <section className="panel p-4 text-sm">
            <h2 className="mb-2 font-bold">Payment</h2>
            <dl className="space-y-1.5">
              <div className="flex justify-between"><dt className="text-muted">Method</dt><dd>{PAY[o.payment]}</dd></div>
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(o.subtotal)}</dd></div>
              {o.discount > 0 && <div className="flex justify-between text-instock"><dt>Discount</dt><dd>-{formatPrice(o.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{o.shipping ? formatPrice(o.shipping) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-bold"><dt>Total</dt><dd className="text-price">{formatPrice(o.total)}</dd></div>
            </dl>
          </section>
          <section className="panel p-4 text-sm">
            <h2 className="mb-2 font-bold">Delivery address</h2>
            <p className="font-medium">{o.address.name}</p>
            <p className="text-muted">{o.address.address}, {o.address.area}, {o.address.district}</p>
            <p className="text-muted">{o.address.phone}</p>
          </section>
        </aside>
      </div>
    </div>
  )
}
