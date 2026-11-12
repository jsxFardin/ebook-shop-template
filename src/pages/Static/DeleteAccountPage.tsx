import { useState } from 'react'
import { useNavigate } from 'react-router'
import { TriangleAlert } from 'lucide-react'
import L from '../../components/common/L'
import { Breadcrumbs } from '../../components/common/ui'
import { useAuth } from '../../stores/shop'
import { useT } from '../../i18n'

export default function DeleteAccountPage() {
  const { to } = useT()
  const nav = useNavigate()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const [confirm, setConfirm] = useState('')
  return (
    <div className="container-mb max-w-2xl pb-10">
      <Breadcrumbs items={[{ label: 'Delete Account' }]} />
      <div className="panel p-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold"><TriangleAlert className="text-sale" />Delete Account</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Deleting your account removes your profile, saved addresses, order history and wishlist. This can't be undone. Orders already placed will still be delivered.</p>
        {user ? (
          <form onSubmit={(e) => { e.preventDefault(); useAuth.setState({ user: null, orders: [] }); logout(); nav(to('/')) }} className="mt-5 space-y-3">
            <label htmlFor="del" className="block text-sm font-medium">Type <b>DELETE</b> to confirm</label>
            <input id="del" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input max-w-xs" autoComplete="off" />
            <button disabled={confirm !== 'DELETE'} className="block rounded bg-sale px-5 py-2 text-sm font-semibold text-white disabled:opacity-40">Delete my account</button>
          </form>
        ) : (
          <p className="mt-5 text-sm"><L to="/login?redirect=/delete-account" className="link font-medium">Sign in</L> to delete your account, or <L to="/contact" className="link font-medium">contact support</L>.</p>
        )}
      </div>
    </div>
  )
}
