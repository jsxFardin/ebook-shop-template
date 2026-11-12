import { useEffect, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight, House, Minus, Plus, Star, X } from 'lucide-react'
import L from './L'
import { useLang } from '../../i18n'
import { formatPrice, pageWindow } from '../../utils/catalog'

export function Price({ price, original, size = 'md' }: { price: number; original?: number; size?: 'sm' | 'md' | 'lg' }) {
  const lang = useLang()
  const cls = { sm: 'text-xs sm:text-lg', md: 'text-lg', lg: 'text-3xl' }[size]
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5">
      <span className={`font-semibold text-price ${cls}`}>{formatPrice(price, lang)}</span>
      {original && original > price && <s className={`text-subtle ${size === 'lg' ? 'text-lg' : 'text-[10px] sm:text-xs'}`}>{formatPrice(original, lang)}</s>}
    </span>
  )
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-accent text-accent' : 'text-border-strong'} />
      ))}
    </span>
  )
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="scrollbar-none overflow-x-auto py-3 text-xs sm:text-sm">
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-muted">
        <li><L to="/" className="inline-flex items-center gap-1 hover:text-accent-dark"><House size={14} />Home</L></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className="text-border-strong">/</span>
            {it.to && i < items.length - 1 ? <L to={it.to} className="hover:text-accent-dark">{it.label}</L> : <span className="font-medium text-foreground">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  if (pages <= 1) return null
  const btn = 'flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm transition-colors'
  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <button className={`${btn} border-border bg-surface disabled:opacity-40`} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
      {pageWindow(page, pages).map((n, i) =>
        n === 0 ? <span key={`g${i}`} className="px-1 text-subtle">…</span> : (
          <button key={n} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}
            className={`${btn} ${n === page ? 'border-accent bg-accent font-semibold text-gray-900' : 'border-border bg-surface hover:border-accent'}`}>{n}</button>
        ),
      )}
      <button className={`${btn} border-border bg-surface disabled:opacity-40`} disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
    </nav>
  )
}

export function QtyStepper({ value, onChange, max = 20, small = false }: { value: number; onChange: (n: number) => void; max?: number; small?: boolean }) {
  const s = small ? 'h-7 w-7' : 'h-9 w-9'
  return (
    <div className="inline-flex items-center rounded border border-border-strong bg-surface">
      <button type="button" className={`${s} flex items-center justify-center text-muted hover:bg-surface-2 disabled:opacity-40`} disabled={value <= 1} onClick={() => onChange(value - 1)} aria-label="Decrease quantity"><Minus size={14} /></button>
      <input
        aria-label="Quantity" inputMode="numeric" value={value}
        onChange={(e) => { const n = parseInt(e.target.value.replace(/\D/g, '') || '1'); onChange(Math.min(Math.max(n, 1), max)) }}
        className={`${small ? 'h-7 w-9 text-xs' : 'h-9 w-12 text-sm'} border-x border-border-strong bg-transparent text-center outline-none`}
      />
      <button type="button" className={`${s} flex items-center justify-center text-muted hover:bg-surface-2 disabled:opacity-40`} disabled={value >= max} onClick={() => onChange(value + 1)} aria-label="Increase quantity"><Plus size={14} /></button>
    </div>
  )
}

export function EmptyState({ icon, title, text, children }: { icon: ReactNode; title: string; text?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-4 py-14 text-center">
      <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-accent-tint text-accent">{icon}</div>
      <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
      {text && <p className="mt-2 max-w-md text-sm text-muted">{text}</p>}
      {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
    </div>
  )
}

/** Locks body scroll + closes on Escape while an overlay is open. */
export function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [open, onClose])
}

export function Drawer({ open, onClose, side = 'left', title, children, width = 'w-[300px]' }: { open: boolean; onClose: () => void; side?: 'left' | 'right'; title: ReactNode; children: ReactNode; width?: string }) {
  useOverlay(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true">
      <div className="anim-fade absolute inset-0 bg-black/50" onClick={onClose} />
      <aside className={`absolute top-0 flex h-full max-w-[88vw] flex-col bg-surface shadow-2xl ${width} ${side === 'left' ? 'anim-left left-0' : 'anim-right right-0'}`}>
        <header className="flex items-center justify-between bg-navy px-4 py-3 text-white">
          <div className="flex items-center gap-2 text-lg font-bold">{title}</div>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-white/10"><X size={20} /></button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </aside>
    </div>
  )
}

export function Modal({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  useOverlay(open, onClose)
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={label}>
      <div className="anim-fade absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="anim-pop relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-t-xl bg-surface shadow-2xl sm:rounded-lg">
        <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-surface-2 p-1.5 hover:bg-border"><X size={18} /></button>
        {children}
      </div>
    </div>
  )
}

export function SectionHeader({ icon, title, to, linkLabel, extra }: { icon?: ReactNode; title: ReactNode; to?: string; linkLabel?: string; extra?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon && <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-tint text-accent-dark">{icon}</span>}
        <h2 className="text-lg font-bold sm:text-xl">{title}</h2>
        {extra}
      </div>
      {to && <L to={to} className="shrink-0 text-sm font-medium text-link hover:text-accent-dark">{linkLabel}</L>}
    </div>
  )
}
