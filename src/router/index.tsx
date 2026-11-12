import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { createBrowserRouter, Navigate, Outlet, useLocation, useParams, useSearchParams } from 'react-router'
import MainLayout from '../layouts/MainLayout'
import AuthLayout from '../layouts/AuthLayout'
import Home from '../pages/Home/HomePage'
import { useAuth } from '../stores/shop'

const Products = lazy(() => import('../pages/Products/ProductsPage'))
const Product = lazy(() => import('../pages/Product/ProductPage'))
const { AuthorsIndex, PublishersIndex, BrandsIndex } = {
  AuthorsIndex: lazy(() => import('../pages/Entity/EntityIndex').then((m) => ({ default: m.AuthorsIndex }))),
  PublishersIndex: lazy(() => import('../pages/Entity/EntityIndex').then((m) => ({ default: m.PublishersIndex }))),
  BrandsIndex: lazy(() => import('../pages/Entity/EntityIndex').then((m) => ({ default: m.BrandsIndex }))),
}
const EntityPage = lazy(() => import('../pages/Entity/EntityPage'))
const Cart = lazy(() => import('../pages/Cart/CartPage'))
const Wishlist = lazy(() => import('../pages/Wishlist/WishlistPage'))
const Checkout = lazy(() => import('../pages/Checkout/CheckoutPage'))
const Login = lazy(() => import('../pages/Auth/LoginPage'))
const Register = lazy(() => import('../pages/Auth/RegisterPage'))
const Forgot = lazy(() => import('../pages/Auth/ForgotPage'))
const AccountLayout = lazy(() => import('../pages/Account/AccountLayout'))
const Dashboard = lazy(() => import('../pages/Account/Dashboard'))
const Orders = lazy(() => import('../pages/Account/Orders'))
const OrderDetail = lazy(() => import('../pages/Account/OrderDetail'))
const Profile = lazy(() => import('../pages/Account/Profile'))
const Content = lazy(() => import('../pages/Static/ContentPage'))
const Contact = lazy(() => import('../pages/Static/ContactPage'))
const Faq = lazy(() => import('../pages/Static/FaqPage'))
const Deals = lazy(() => import('../pages/Static/DealsPage'))
const DeleteAccount = lazy(() => import('../pages/Static/DeleteAccountPage'))
const NotFound = lazy(() => import('../pages/Static/NotFoundPage'))

const S = (el: ReactNode) => <Suspense fallback={<div className="container-mb py-24 text-center text-sm text-subtle">Loading…</div>}>{el}</Suspense>

/** Valid locale → render; anything else is treated as a path missing its locale. */
function LangGate() {
  const { lang } = useParams()
  const loc = useLocation()
  useEffect(() => { document.documentElement.lang = lang ?? 'en' }, [lang])
  if (lang !== 'en' && lang !== 'bn') return <Navigate to={`/en${loc.pathname}${loc.search}`} replace />
  return <Outlet />
}

/** Mock auth guard: sends guests to /login?redirect=… like the reference. */
function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user)
  const { lang } = useParams()
  const loc = useLocation()
  if (!user) return <Navigate to={`/${lang}/login?redirect=${encodeURIComponent(loc.pathname.replace(/^\/(en|bn)/, '') + loc.search)}`} replace />
  return <>{children}</>
}

/** Brief-suggested aliases mapped onto the reference URL scheme. */
function Alias({ kind }: { kind: 'category' | 'search' }) {
  const { lang, slug } = useParams()
  const [sp] = useSearchParams()
  const q = kind === 'category' ? `category=${slug}` : `search=${encodeURIComponent(sp.get('q') ?? '')}`
  return <Navigate to={`/${lang}/products?${q}`} replace />
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/en" replace /> },
  {
    path: '/:lang',
    element: <LangGate />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'products', element: S(<Products />) },
          { path: 'products/:slug', element: S(<Product />) },
          { path: 'categories/:slug', element: <Alias kind="category" /> },
          { path: 'search', element: <Alias kind="search" /> },
          { path: 'authors', element: S(<AuthorsIndex />) },
          { path: 'authors/:slug', element: S(<EntityPage kind="author" />) },
          { path: 'publishers', element: S(<PublishersIndex />) },
          { path: 'publishers/:slug', element: S(<EntityPage kind="publisher" />) },
          { path: 'brands', element: S(<BrandsIndex />) },
          { path: 'brands/:slug', element: S(<EntityPage kind="brand" />) },
          { path: 'deals', element: S(<Deals />) },
          { path: 'cart', element: S(<Cart />) },
          { path: 'wishlist', element: S(<Wishlist />) },
          { path: 'account/wishlist', element: S(<Wishlist />) },
          { path: 'checkout', element: <RequireAuth>{S(<Checkout />)}</RequireAuth> },
          {
            path: 'account',
            element: <RequireAuth>{S(<AccountLayout />)}</RequireAuth>,
            children: [
              { index: true, element: S(<Dashboard />) },
              { path: 'orders', element: S(<Orders />) },
              { path: 'orders/:id', element: S(<OrderDetail />) },
              { path: 'profile', element: S(<Profile />) },
            ],
          },
          { path: 'contact', element: S(<Contact />) },
          { path: 'faq', element: S(<Faq />) },
          { path: 'delete-account', element: S(<DeleteAccount />) },
          ...['about', 'privacy', 'terms', 'returns', 'career', 'blog'].map((k) => ({ path: k, element: S(<Content page={k} />) })),
          { path: '*', element: S(<NotFound />) },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: 'login', element: S(<Login />) },
          { path: 'register', element: S(<Register />) },
          { path: 'forgot-password', element: S(<Forgot />) },
        ],
      },
    ],
  },
])
