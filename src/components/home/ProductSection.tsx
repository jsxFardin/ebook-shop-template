import type { ReactNode } from 'react'
import type { Product } from '../../types'
import ProductGrid from '../product/ProductGrid'
import { SectionHeader } from '../common/ui'

/** A home rail: header + 5×2 grid (3 columns on phones), alternating background. */
export default function ProductSection({ title, icon, to, linkLabel, items, alt = false, extra }: { title: ReactNode; icon?: ReactNode; to: string; linkLabel: string; items: Product[]; alt?: boolean; extra?: ReactNode }) {
  if (!items.length) return null
  return (
    <section className={`border-t border-border py-6 sm:py-8 ${alt ? 'bg-page-alt' : ''}`}>
      <div className="container-mb">
        <SectionHeader icon={icon} title={title} to={to} linkLabel={linkLabel} extra={extra} />
        <ProductGrid items={items} />
      </div>
    </section>
  )
}
