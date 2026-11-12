import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { Bell, ChevronDown, Globe, Heart, LogOut, MapPin, Menu, Moon, Package, Search, ShoppingCart, Sun, UserRound, X } from 'lucide-react'
import L from '../common/L'
import Logo from '../common/Logo'
import ProductArt from '../common/ProductArt'
import { navigation, products, catalogCtx, categoryBySlug, DISTRICTS } from '../../data'
import { filterProducts, formatPrice, sortProducts } from '../../utils/catalog'
import { useCart, useWishlist, useAuth } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { useT } from '../../i18n'

export default function Header() {
  return (
    <header>
      <AnnouncementBar />
      <UtilityBar />
      <MainBar />
      <CategoryNav />
    </header>
  )
}

function AnnouncementBar() {
  const { t } = useT()
  const msgs = navigation.announcements
  return (
    <div className="flex h-[30px] items-center overflow-hidden border-b border-white/20 bg-accent text-gray-900">
      <span className="z-10 flex h-full shrink-0 items-center gap-1 bg-accent px-3 text-[10px] font-bold uppercase sm:px-6 sm:text-xs">
        <Bell size={13} /> <span className="hidden sm:inline">{t('latest')}</span>
      </span>
      <div className="relative flex-1 overflow-hidden">
        <div className="animate-marquee flex w-max">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0" aria-hidden={k === 1}>
              {[...msgs, ...msgs].map((m, i) => (
                <span key={i} className="flex items-center whitespace-nowrap px-6 text-xs font-medium sm:text-sm">
                  <span className="mr-2 h-1 w-1 rounded-full bg-gray-900/60" />{m}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function UtilityBar() {
  const { t } = useT()
  const sep = <span className="text-white/30">|</span>
  return (
    <div className="border-b border-white/10 bg-gradient-to-r from-navy via-[#2a3a4a] to-navy text-white">
      <div className="container-mb flex h-9 items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <a href="tel:+8801914950420" className="hover:text-accent">+8801914950420</a>
          <span className="hidden text-white/30 sm:inline">|</span>
          <a href="mailto:support@mamunbooks.com" className="hidden hover:text-accent sm:inline">support@mamunbooks.com</a>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <L to="/login?portal=publisher" className="hover:text-accent">{t('publisherLogin')}</L>{sep}
          <L to="/login?portal=brand" className="hover:text-accent">{t('brandLogin')}</L>{sep}
          <L to="/login?portal=wholesale" className="hover:text-accent">{t('wholesaleLogin')}</L>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <L to="/login">{t('login')}</L>{sep}<L to="/register">{t('register')}</L>{sep}<L to="/login?portal=wholesale">{t('wholesaleLogin')}</L>
        </div>
      </div>
    </div>
  )
}

function LangSwitch() {
  const { lang } = useT()
  const loc = useLocation()
  const next = lang === 'en' ? 'bn' : 'en'
  const path = loc.pathname.replace(/^\/(en|bn)/, `/${next}`) + loc.search
  return (
    <Link to={path}
      className="flex items-center gap-1 rounded px-1.5 py-1 text-sm font-medium hover:bg-surface-2" aria-label={`Switch language to ${next.toUpperCase()}`}>
      <Globe size={17} /> {next.toUpperCase()}
    </Link>
  )
}

function ThemeToggle() {
  const theme = useUi((s) => s.theme)
  const toggle = useUi((s) => s.toggleTheme)
  const dark = theme === 'dark'
  return (
    <button onClick={toggle} role="switch" aria-checked={dark} aria-label="Dark mode"
      className="relative h-7 w-14 shrink-0 rounded-full border border-border-strong bg-surface-2 transition-colors">
      <span className={`absolute top-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full shadow transition-all ${dark ? 'left-[30px] bg-navy-2 text-yellow-300' : 'left-0.5 bg-white text-accent'}`}>
        {dark ? <Moon size={13} /> : <Sun size={13} />}
      </span>
    </button>
  )
}

export function SearchBox({ mobile = false }: { mobile?: boolean }) {
  const { t, to } = useT()
  const nav = useNavigate()
  const loc = useLocation()
  const [q, setQ] = useState(() => new URLSearchParams(loc.search).get('search') ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrap = useRef<HTMLFormElement>(null)
  const results = q.trim().length > 1 ? sortProducts(filterProducts(products, { search: q }, catalogCtx), 'bestselling').slice(0, 8) : []

  useEffect(() => {
    const off = (e: MouseEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', off)
    return () => document.removeEventListener('mousedown', off)
  }, [])

  const go = (path: string) => { setOpen(false); nav(to(path)) }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (active >= 0 && results[active]) return go(`/products/${results[active].slug}`)
    if (q.trim()) go(`/products?search=${encodeURIComponent(q.trim())}`)
  }
  return (
    <form ref={wrap} onSubmit={submit} role="search" className="relative flex w-full">
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, -1)) }
          if (e.key === 'Escape') setOpen(false)
        }}
        type="search" aria-label="Search products" aria-autocomplete="list" aria-expanded={open && results.length > 0}
        placeholder={t('searchPlaceholder')}
        className={`min-w-0 flex-1 border bg-surface px-4 text-sm text-foreground outline-none placeholder:text-subtle focus:border-accent [&::-webkit-search-cancel-button]:hidden ${mobile ? 'h-10 rounded-l border-transparent' : 'h-[38px] border-border-strong'}`}
      />
      {q && <button type="button" onClick={() => { setQ(''); setOpen(false) }} aria-label="Clear search" className="absolute right-14 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-foreground"><X size={16} /></button>}
      <button type="submit" aria-label="Search" className={`flex w-12 shrink-0 items-center justify-center bg-[#febd69] text-gray-900 hover:bg-accent ${mobile ? 'h-10 rounded-r' : 'h-[38px]'}`}><Search size={19} /></button>
      {open && q.trim().length > 1 && (
        <div className="anim-fade absolute left-0 right-12 top-full z-50 mt-1 max-h-[70vh] overflow-y-auto rounded-b border border-border bg-surface shadow-xl" role="listbox">
          {results.length ? (
            <>
              {results.map((p, i) => (
                <button type="button" key={p.id} role="option" aria-selected={i === active} onMouseEnter={() => setActive(i)} onClick={() => go(`/products/${p.slug}`)}
                  className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === active ? 'bg-surface-2' : ''}`}>
                  <span className="h-12 w-10 shrink-0"><ProductArt product={p} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{p.title}</span>
                    <span className="block truncate text-xs text-subtle">{categoryBySlug.get(p.category)?.name}</span>
                  </span>
                  <span className="text-right text-sm font-semibold text-price">
                    {formatPrice(p.price)}
                    {p.originalPrice && <s className="block text-[10px] font-normal text-subtle">{formatPrice(p.originalPrice)}</s>}
                  </span>
                </button>
              ))}
              <button type="submit" className="w-full border-t border-border px-3 py-2 text-left text-sm font-medium text-link hover:bg-surface-2">See all results for “{q}”</button>
            </>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-muted">No products match “{q}”. Try an author, publisher or ISBN.</p>
          )}
        </div>
      )}
    </form>
  )
}

function DeliverTo() {
  const { t } = useT()
  const district = useUi((s) => s.district)
  const setDistrict = useUi((s) => s.setDistrict)
  return (
    <label className="relative hidden items-center gap-1 rounded px-1.5 py-1 hover:bg-surface-2 xl:flex">
      <MapPin size={18} />
      <span className="leading-tight">
        <span className="block text-[11px] text-subtle">{t('deliverTo')}</span>
        <span className="block text-sm font-semibold">{district}</span>
      </span>
      <select aria-label="Delivery district" value={district} onChange={(e) => setDistrict(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0">
        {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
      </select>
    </label>
  )
}

function AccountMenu() {
  const { t, to } = useT()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const nav = useNavigate()
  return (
    <div className="group relative hidden md:block">
      <L to={user ? '/account' : '/login'} className="block rounded px-1.5 py-1 leading-tight hover:bg-surface-2">
        <span className="block text-[11px] text-subtle">{user ? `${t('helloUser')} ${user.name.split(' ')[0]}` : t('hello')}</span>
        <span className="flex items-center gap-0.5 text-sm font-bold">{t('accountLists')} <ChevronDown size={14} /></span>
      </L>
      <div className="invisible absolute right-0 top-full z-50 w-64 pt-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <div className="rounded-lg border border-border bg-surface p-4 shadow-xl">
          {!user && (
            <div className="mb-3 border-b border-border pb-3 text-center">
              <L to="/login" className="btn-cart w-full py-2">Sign in</L>
              <p className="mt-2 text-xs text-muted">New customer? <L to="/register" className="link">Start here.</L></p>
            </div>
          )}
          <ul className="space-y-1 text-sm">
            <li><L to="/account" className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-2"><UserRound size={15} />{t('myAccount')}</L></li>
            <li><L to="/account/orders" className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-2"><Package size={15} />{t('myOrders')}</L></li>
            <li><L to="/account/wishlist" className="flex items-center gap-2 rounded px-2 py-1.5 hover:bg-surface-2"><Heart size={15} />{t('wishlist')}</L></li>
            {user && <li><button onClick={() => { logout(); nav(to('/')) }} className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-surface-2"><LogOut size={15} />{t('logout')}</button></li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

export function CountBadge({ n, className = '' }: { n: number; className?: string }) {
  if (!n) return null
  return <span className={`absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-gray-900 ${className}`}>{n > 99 ? '99+' : n}</span>
}

function MainBar() {
  const { t } = useT()
  const open = useUi((s) => s.open)
  const cartCount = useCart((s) => s.items.reduce((a, i) => a + i.qty, 0))
  const wishCount = useWishlist((s) => s.ids.length)
  return (
    <>
      <div className="bg-surface py-3 text-foreground shadow-sm">
        <div className="container-mb flex items-center gap-1.5 sm:gap-3 lg:gap-4">
          <button onClick={() => open('categories')} className="-ml-1 rounded p-1 md:hidden" aria-label="Open categories"><Menu size={24} /></button>
          <Logo />
          <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-2"><LangSwitch /><ThemeToggle /></div>
          <div className="hidden min-w-0 flex-1 lg:flex"><SearchBox /></div>
          <DeliverTo />
          <AccountMenu />
          <L to="/account/wishlist" className="relative rounded p-1.5 hover:bg-surface-2" aria-label={t('wishlist')}>
            <Heart size={24} /><CountBadge n={wishCount} className="-right-0.5 -top-0.5" />
          </L>
          <L to="/cart" className="relative hidden items-end gap-1 rounded px-1.5 py-1 hover:bg-surface-2 md:flex" aria-label={t('cart')}>
            <span className="relative"><ShoppingCart size={28} /><CountBadge n={cartCount} className="-right-2 -top-2" /></span>
            <span className="text-lg font-bold leading-none">{t('cart')}</span>
          </L>
        </div>
      </div>
      <div className="bg-navy-3 px-4 pb-3 pt-1 lg:hidden"><SearchBox mobile /></div>
    </>
  )
}

function CategoryNav() {
  const { t } = useT()
  const open = useUi((s) => s.open)
  const item = 'whitespace-nowrap rounded px-2 py-1 text-sm font-medium hover:bg-white/10'
  return (
    <nav aria-label="Categories" className="hidden border-b border-white/10 bg-gradient-to-r from-navy-2 via-[#3f5166] to-navy-2 py-2 text-white md:block">
      <div className="container-mb flex items-center gap-1">
        <button onClick={() => open('categories')} className={`${item} flex items-center gap-1.5 font-semibold`}><Menu size={18} />{t('allCategories')}</button>
        <div className="scrollbar-none flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {navigation.main.map((n) => <L key={n.to} to={n.to} className={item}>{n.label}</L>)}
          <L to="/contact?subject=bulk" className="ml-1 whitespace-nowrap rounded border border-accent px-2 py-0.5 text-sm font-semibold text-accent hover:bg-accent hover:text-gray-900">{t('bulkOrder')}</L>
        </div>
        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <L to="/authors" className={item}>{t('authors')}</L>
          <L to="/brands" className={item}>{t('brands')}</L>
          <L to="/publishers" className={item}>{t('publishers')}</L>
        </div>
      </div>
    </nav>
  )
}
