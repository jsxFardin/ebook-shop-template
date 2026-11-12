import { Package } from 'lucide-react'
import type { Order } from '../../types'
import L from '../../components/common/L'
import { EmptyState } from '../../components/common/ui'
import { useAuth } from '../../stores/shop'
import { formatPrice } from '../../utils/catalog'

export const STATUS_STYLE: Record<Order['status'], string> = {
  Processing: 'bg-amber-100 text-amber-800', Shipped: 'bg-sky-100 text-sky-800', Delivered: 'bg-emerald-100 text-emerald-800', Cancelled: 'bg-gray-200 text-gray-700',
}
export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

export function OrdersTable({ orders }: { orders: Order[] }) {
  if (!orders.length)
    return <EmptyState icon={<Package size={40} />} title="No orders yet" text="When you place an order it will show up here."><L to="/products" className="btn-accent">Start Shopping</L></EmptyState>
  return (
    <ul className="divide-y divide-border">
      {orders.map((o) => (
        <li key={o.id}>
          <L to={`/account/orders/${o.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-1 p-4 hover:bg-surface-2">
            <span className="font-mono font-semibold">#{o.id}</span>
            <span className="text-sm text-muted">{fmtDate(o.date)}</span>
            <span className="text-sm text-muted">{o.items.reduce((s, i) => s + i.qty, 0)} items</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[o.status]}`}>{o.status}</span>
            <span className="ml-auto font-bold">{formatPrice(o.total)}</span>
          </L>
        </li>
      ))}
    </ul>
  )
}

export default function Orders() {
  const orders = useAuth((s) => s.orders)
  return (
    <section className="panel">
      <h1 className="border-b border-border p-4 text-xl font-bold">My Orders</h1>
      <OrdersTable orders={orders} />
    </section>
  )
}
