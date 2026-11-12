import { NavLink, Outlet, useNavigate } from 'react-router'
import { Heart, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react'
import L from '../../components/common/L'
import { Breadcrumbs } from '../../components/common/ui'
import { useAuth } from '../../stores/shop'
import { useT } from '../../i18n'

export default function AccountLayout() {
  const { t, to } = useT()
  const user = useAuth((s) => s.user)!
  const logout = useAuth((s) => s.logout)
  const nav = useNavigate()
  const item = ({ isActive }: { isActive: boolean }) => `flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm ${isActive ? 'bg-accent-tint font-semibold text-accent-dark' : 'hover:bg-surface-2'}`
  return (
    <div className="bg-page-alt pb-10">
      <div className="container-mb">
        <Breadcrumbs items={[{ label: t('myAccount') }]} />
        <div className="grid gap-5 md:grid-cols-[240px_1fr]">
          <aside className="panel h-fit p-3">
            <div className="mb-3 flex items-center gap-3 border-b border-border px-2 pb-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-lg font-bold text-white">{user.name[0]}</span>
              <div className="min-w-0"><p className="truncate font-semibold">{user.name}</p><p className="truncate text-xs text-muted">{user.phone || user.email}</p></div>
            </div>
            <nav className="scrollbar-none flex gap-1 overflow-x-auto md:flex-col">
              <NavLink end to={to('/account')} className={item}><LayoutDashboard size={16} />Dashboard</NavLink>
              <NavLink to={to('/account/orders')} className={item}><Package size={16} />{t('myOrders')}</NavLink>
              <NavLink to={to('/account/profile')} className={item}><UserRound size={16} />{t('myProfile')}</NavLink>
              <L to="/account/wishlist" className="flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm hover:bg-surface-2"><Heart size={16} />{t('wishlist')}</L>
              <button onClick={() => { logout(); nav(to('/')) }} className="flex shrink-0 items-center gap-2 rounded px-3 py-2 text-left text-sm text-sale hover:bg-surface-2"><LogOut size={16} />{t('logout')}</button>
            </nav>
          </aside>
          <div className="min-w-0"><Outlet /></div>
        </div>
      </div>
    </div>
  )
}
