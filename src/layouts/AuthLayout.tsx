import { Outlet } from 'react-router'
import Logo from '../components/common/Logo'
import Footer from '../components/layout/Footer'
import Floating from '../components/layout/Floating'
import { useScrollTop } from './MainLayout'

/** Minimal chrome for sign-in / registration, like the reference. */
export default function AuthLayout() {
  useScrollTop()
  return (
    <>
      <div className="border-b border-border bg-surface"><div className="container-mb flex h-14 items-center"><Logo /></div></div>
      <main id="main" className="bg-page-alt py-8 sm:py-12"><Outlet /></main>
      <Footer />
      <Floating />
    </>
  )
}
