import { useState } from 'react'
import { ChevronLeft, ChevronRight, Heart, ZoomIn } from 'lucide-react'
import type { Product } from '../../types'
import ProductArt from '../common/ProductArt'
import { Modal } from '../common/ui'
import { discountPct } from '../../utils/catalog'
import { useWish } from '../../hooks/useShop'

export default function Gallery({ p, compact = false }: { p: Product; compact?: boolean }) {
  const [i, setI] = useState(0)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [lightbox, setLightbox] = useState(false)
  const wish = useWish(p)
  const n = p.images
  const off = discountPct(p)
  const go = (d: number) => setI((v) => (v + d + n) % n)
  return (
    <div>
      <div
        className="relative aspect-[4/4.4] cursor-zoom-in overflow-hidden rounded-lg border border-border bg-surface"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }) }}
        onMouseLeave={() => setZoom(null)}
        onClick={() => setLightbox(true)}
      >
        <div className="h-full w-full transition-transform duration-150" style={zoom && !compact ? { transform: 'scale(1.8)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}>
          <ProductArt product={p} variant={i} />
        </div>
        {off > 0 && <span className="absolute right-3 top-3 rounded bg-sale px-2 py-1 text-sm font-bold text-white">-{off}%</span>}
        <span className="absolute bottom-3 left-3 hidden items-center gap-1 rounded bg-black/60 px-2 py-1 text-[11px] text-white sm:flex">
          <ZoomIn size={13} /> Hover to zoom - click to enlarge {i + 1}/{n}
        </span>
        <button onClick={(e) => { e.stopPropagation(); wish.toggle() }} aria-label="Toggle wishlist" className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface shadow">
          <Heart size={18} className={wish.on ? 'fill-sale text-sale' : 'text-muted'} />
        </button>
      </div>
      {n > 1 && (
        <div className="scrollbar-none mt-3 flex gap-2 overflow-x-auto">
          {Array.from({ length: n }, (_, k) => (
            <button key={k} onClick={() => setI(k)} aria-label={`Image ${k + 1}`} className={`h-16 w-16 shrink-0 rounded border-2 bg-surface p-0.5 sm:h-[72px] sm:w-[72px] ${k === i ? 'border-accent' : 'border-border hover:border-border-strong'}`}>
              <ProductArt product={p} variant={k} />
            </button>
          ))}
        </div>
      )}
      <Modal open={lightbox} onClose={() => setLightbox(false)} label={`${p.title} images`}>
        <div className="relative flex h-[80vh] items-center justify-center bg-surface p-6">
          <ProductArt product={p} variant={i} />
          {n > 1 && <>
            <button onClick={() => go(-1)} aria-label="Previous image" className="absolute left-3 rounded-full bg-surface-2 p-2 shadow"><ChevronLeft /></button>
            <button onClick={() => go(1)} aria-label="Next image" className="absolute right-3 rounded-full bg-surface-2 p-2 shadow"><ChevronRight /></button>
          </>}
          <span className="absolute bottom-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">{i + 1} / {n}</span>
        </div>
      </Modal>
    </div>
  )
}
