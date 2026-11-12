import { Home, Package, SearchX } from 'lucide-react'
import L from '../../components/common/L'

export default function NotFoundPage() {
  return (
    <div className="container-mb flex flex-col items-center py-16 text-center">
      <SearchX size={72} strokeWidth={1.2} className="text-accent" />
      <p className="mt-2 text-7xl font-extrabold text-border-strong">404</p>
      <h1 className="mt-3 text-lg">The page you're looking for doesn't exist or has been moved.</h1>
      <p className="text-sm text-muted">Don't worry, let's get you back on track!</p>
      <div className="mt-6 flex gap-3">
        <L to="/" className="btn-accent px-5 py-2.5"><Home size={16} />Back to Home</L>
        <L to="/products" className="btn-outline px-5 py-2.5"><Package size={16} />Browse Products</L>
      </div>
    </div>
  )
}
