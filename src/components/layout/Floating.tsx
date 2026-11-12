import { CheckCircle2, Info, ShoppingCart } from 'lucide-react'
import Social from '../common/Social'
import { useCart } from '../../stores/shop'
import { useUi } from '../../stores/ui'

/** Right-edge CART tab, WhatsApp/Messenger bubbles, and toast stack. */
export default function Floating() {
  const open = useUi((s) => s.open)
  const toasts = useUi((s) => s.toasts)
  const count = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0))
  return (
    <>
      <button onClick={() => open('cart')} aria-label={`Open cart, ${count} items`}
        className="fixed right-0 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-0.5 rounded-l-lg bg-navy px-2 py-2.5 text-white shadow-lg hover:bg-navy-2 md:flex">
        <span className="relative"><ShoppingCart size={22} />{count > 0 && <span className="absolute -right-2 -top-2 rounded-full bg-accent px-1 text-[10px] font-bold text-gray-900">{count}</span>}</span>
        <span className="text-[9px] font-bold tracking-wide">CART</span>
      </button>
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-3 md:bottom-8">
        <a href="https://wa.me/8801914950420" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg transition-transform hover:scale-105"><Social name="whatsapp" size={24} /></a>
        <a href="https://m.me/" target="_blank" rel="noreferrer" aria-label="Chat on Messenger" className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#00b2ff] to-[#006aff] text-white shadow-lg transition-transform hover:scale-105"><Social name="messenger" size={24} /></a>
      </div>
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[90] flex flex-col items-center gap-2 px-4 md:bottom-auto md:left-auto md:right-6 md:top-6 md:items-end">
        {toasts.map((t) => (
          <div key={t.id} className="anim-pop flex max-w-sm items-center gap-2 rounded-lg bg-navy px-4 py-3 text-sm text-white shadow-xl">
            {t.tone === 'ok' ? <CheckCircle2 size={18} className="shrink-0 text-[#4ade80]" /> : <Info size={18} className="shrink-0 text-accent" />}
            <span className="line-clamp-2">{t.text}</span>
          </div>
        ))}
      </div>
    </>
  )
}
