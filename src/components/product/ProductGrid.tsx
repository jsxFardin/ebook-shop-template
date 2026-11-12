import type { Product } from '../../types'
import ProductCard from './ProductCard'

export default function ProductGrid({ items, cols = 5 }: { items: Product[]; cols?: 4 | 5 | 6 }) {
  const c = { 4: 'md:grid-cols-3 lg:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-5 xl:grid-cols-6' }[cols]
  return (
    <div className={`grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-4 ${c}`}>
      {items.map((p) => <ProductCard key={p.id} p={p} />)}
    </div>
  )
}
