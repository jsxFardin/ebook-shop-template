import { Tag } from 'lucide-react'
import L from '../../components/common/L'
import ProductGrid from '../../components/product/ProductGrid'
import { EmptyState } from '../../components/common/ui'
import { products } from '../../data'
import { discountPct, sortProducts } from '../../utils/catalog'

const deals = sortProducts(products.filter((p) => discountPct(p) >= 30 && p.stock > 0), 'discount')

export default function DealsPage() {
  return (
    <div className="container-mb py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Today's Deals &amp; Promotions</h1>
      <p className="mt-1 text-sm text-muted">Limited time offers on your favorite books — 30% off or more.</p>
      <div className="mt-6">
        {deals.length ? <ProductGrid items={deals} /> : (
          <div className="panel"><EmptyState icon={<Tag size={40} />} title="No Active Deals" text="Check back soon for exciting deals and promotions!"><L to="/products" className="link font-medium">Browse All Products →</L></EmptyState></div>
        )}
      </div>
    </div>
  )
}
