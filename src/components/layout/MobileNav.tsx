import { NavLink } from 'react-router'
import { Heart, House, LayoutGrid, ShoppingCart, UserRound } from 'lucide-react'
import { CountBadge } from './Header'
import { useCart, useWishlist } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { useT } from '../../i18n'

/** Fixed bottom tab bar (< md) with the raised circular cart button from the reference. */
export default function MobileNav() {
  const { t, to } = useT()
  const open = useUi((s) => s.open)
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0))
  const wish = useWishlist((s) => s.ids.length)
  const tab = ({ isActive }: { isActive: boolean }) => `flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'text-accent-dark font-semibold' : 'text-muted'}`
  return (
    <nav aria-label="Mobile" className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,.06)] md:hidden">
      <div className="flex items-end">
        <NavLink to={to('/')} end className={tab}><House size={21} />{t('home')}</NavLink>
        <button onClick={() => open('categories')} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] text-muted"><LayoutGrid size={21} />{t('categories')}</button>
        <div className="flex flex-1 justify-center">
          <NavLink to={to('/cart')} aria-label={t('cart')} className="relative -mt-6 mb-1.5 flex h-14 w-14 items-center justify-center rounded-full border-4 border-surface bg-navy text-white shadow-lg">
            <ShoppingCart size={22} /><CountBadge n={cartCount} className="-right-1 -top-1" />
          </NavLink>
        </div>
        <NavLink to={to('/account/wishlist')} className={tab}><span className="relative"><Heart size={21} /><CountBadge n={wish} className="-right-2.5 -top-1.5" /></span>{t('wishlist')}</NavLink>
        <NavLink to={to('/account')} end className={tab}><UserRound size={21} />{t('account')}</NavLink>
      </div>
    </nav>
  )
}
