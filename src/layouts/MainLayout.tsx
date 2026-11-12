import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import MobileNav from '../components/layout/MobileNav'
import Floating from '../components/layout/Floating'
import CategoryDrawer from '../components/layout/CategoryDrawer'
import MiniCart from '../components/layout/MiniCart'
import QuickView from '../components/product/QuickView'
import { useUi } from '../stores/ui'

export function useScrollTop() {
  const { pathname, search } = useLocation()
  const close = useUi((s) => s.close)
  useEffect(() => { window.scrollTo(0, 0); close() }, [pathname, search, close])
}

export default function MainLayout() {
  useScrollTop()
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded focus:bg-accent focus:px-3 focus:py-2">Skip to content</a>
      <Header />
      <main id="main" className="min-h-[50vh]"><Outlet /></main>
      <Footer />
      <MobileNav />
      <Floating />
      <CategoryDrawer />
      <MiniCart />
      <QuickView />
    </>
  )
}
