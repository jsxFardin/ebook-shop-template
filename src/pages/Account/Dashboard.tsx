import { Heart, Package, ShoppingCart, Wallet } from 'lucide-react'
import L from '../../components/common/L'
import ProductGrid from '../../components/product/ProductGrid'
import { OrdersTable } from './Orders'
import { useAuth, useCart, useWishlist } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { productById } from '../../data'
import { formatPrice } from '../../utils/catalog'

export default function Dashboard() {
  const user = useAuth((s) => s.user)!
  const orders = useAuth((s) => s.orders)
  const wish = useWishlist((s) => s.ids.length)
  const cart = useCart((s) => s.items.length)
  const recent = useUi((s) => s.recent).map((id) => productById.get(id)).filter((p) => !!p).slice(0, 5)
  const spent = orders.filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.total, 0)
  const stats = [[Package, 'Orders', orders.length, '/account/orders'], [Heart, 'Wishlist', wish, '/account/wishlist'], [ShoppingCart, 'In cart', cart, '/cart'], [Wallet, 'Total spent', formatPrice(spent), '/account/orders']] as const
  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <h1 className="text-xl font-bold">Hello, {user.name.split(' ')[0]}</h1>
        <p className="text-sm text-muted">Manage your orders, wishlist and profile from here.</p>
        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(([I, label, val, to]) => (
            <L key={label} to={to} className="rounded-lg border border-border p-4 hover:border-accent">
              <I size={20} className="text-accent" /><p className="mt-2 text-xl font-bold">{val}</p><p className="text-xs text-muted">{label}</p>
            </L>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="flex items-center justify-between border-b border-border p-4"><h2 className="font-bold">Recent Orders</h2><L to="/account/orders" className="text-sm text-link">See all</L></div>
        <OrdersTable orders={orders.slice(0, 3)} />
      </section>
      {recent.length > 0 && <section><h2 className="mb-3 font-bold">Recently viewed</h2><ProductGrid items={recent} /></section>}
    </div>
  )
}
