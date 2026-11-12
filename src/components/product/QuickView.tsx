import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useUi } from '../../stores/ui'
import { productById, categoryBySlug } from '../../data'
import { Modal, Price, QtyStepper } from '../common/ui'
import L from '../common/L'
import Gallery from './Gallery'
import { ByLine } from './ProductCard'
import { useAddToCart } from '../../hooks/useShop'
import { useT } from '../../i18n'

export default function QuickView() {
  const id = useUi((s) => s.quickView)
  const close = useUi((s) => s.setQuickView)
  const p = id ? productById.get(id) : undefined
  return (
    <Modal open={!!p} onClose={() => close(null)} label="Quick view">
      {p && <Body key={p.id} id={p.id} onDone={() => close(null)} />}
    </Modal>
  )
}

function Body({ id, onDone }: { id: string; onDone: () => void }) {
  const p = productById.get(id)!
  const [qty, setQty] = useState(1)
  const add = useAddToCart()
  const { t } = useT()
  return (
    <div className="grid gap-6 p-5 sm:grid-cols-2 sm:p-6">
      <Gallery p={p} compact />
      <div className="flex flex-col gap-3">
        <p className="text-xs text-subtle">{categoryBySlug.get(p.category)?.name}</p>
        <h2 className="pr-8 text-xl font-bold">{p.title}</h2>
        <ByLine p={p} className="!text-sm" />
        <Price price={p.price} original={p.originalPrice} size="lg" />
        <p className={`text-sm font-medium ${p.stock > 0 ? 'text-instock' : 'text-sale'}`}>{p.stock > 0 ? t('inStock') : t('outOfStock')}</p>
        <p className="text-sm text-muted">{p.description[0]}</p>
        {p.stock > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <QtyStepper value={qty} onChange={setQty} max={Math.min(p.stock, 20)} />
            <button onClick={() => { add(p, qty); onDone() }} className="btn-cart flex-1 px-5 py-2.5"><ShoppingCart size={16} />{t('addToCart')}</button>
          </div>
        )}
        <L to={`/products/${p.slug}`} onClick={onDone} className="mt-auto text-sm font-medium text-link hover:underline">View full details</L>
      </div>
    </div>
  )
}
