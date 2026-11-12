import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, Lock, Phone } from 'lucide-react'
import L from '../../components/common/L'
import Field, { validate } from '../../components/forms/Field'
import { useAuth } from '../../stores/shop'
import { isBdPhone, isEmail } from '../../utils/catalog'
import { useT } from '../../i18n'

const PORTALS: Record<string, string> = { publisher: 'Publisher', brand: 'Brand', wholesale: 'Wholesale' }

/** Safe internal redirect target (blocks //evil.com and absolute URLs). */
export const safeRedirect = (r: string | null) => (r && r.startsWith('/') && !r.startsWith('//') ? r : '/account')

export default function LoginPage() {
  const { to } = useT()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const login = useAuth((s) => s.login)
  const portal = PORTALS[sp.get('portal') ?? '']
  const [v, setV] = useState({ id: '', password: '' })
  const [errors, setErrors] = useState<Partial<typeof v>>({})
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(v, {
      id: (s) => !(isBdPhone(s) || isEmail(s)) && 'Enter a valid mobile number (01XXXXXXXXX) or email address.',
      password: (s) => s.length < 6 && 'Password must be at least 6 characters.',
    })
    setErrors(errs)
    if (Object.keys(errs).length) return
    const email = isEmail(v.id) ? v.id.trim() : undefined
    // mock auth: derive a display name from the identifier
    login({ name: email ? email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Mamun Book Reader', phone: email ? '' : v.id.trim(), email })
    nav(to(safeRedirect(sp.get('redirect'))), { replace: true })
  }
  return (
    <div className="mx-auto max-w-md px-4">
      <h1 className="text-center text-2xl font-bold">{portal ? `${portal} Login` : 'Welcome Back'}</h1>
      <p className="mt-1 text-center text-sm text-muted">{portal ? `Sign in to the ${portal.toLowerCase()} portal (demo).` : 'Welcome back! Please enter your details.'}</p>
      <form onSubmit={submit} noValidate className="panel mt-6 space-y-4 p-6 shadow-sm">
        <Field label="Mobile or Email" icon={<Phone size={16} />} value={v.id} onChange={(e) => setV({ ...v, id: e.target.value })} error={errors.id} placeholder="01XXXXXXXXX or email@example.com" autoComplete="username" />
        <Field label="Password" type="password" icon={<Lock size={16} />} value={v.password} onChange={(e) => setV({ ...v, password: e.target.value })} error={errors.password} placeholder="Enter your password" autoComplete="current-password"
          aside={<L to="/forgot-password" className="text-xs font-medium text-link hover:underline">Forgot Password?</L>} />
        <button className="btn-accent w-full py-2.5 text-base">Login <ArrowRight size={16} /></button>
        <div className="relative py-1 text-center text-xs text-subtle"><span className="relative z-10 bg-surface px-2">New to Mamun Book?</span><span className="absolute inset-x-0 top-1/2 border-t border-border" /></div>
        <L to={`/register${sp.get('redirect') ? `?redirect=${encodeURIComponent(sp.get('redirect')!)}` : ''}`} className="btn-outline w-full">Create your Mamun Book account</L>
      </form>
      <L to="/" className="mt-5 flex items-center justify-center gap-1 text-sm text-link hover:underline"><ArrowLeft size={15} />Back to Home</L>
      <p className="mt-4 text-center text-xs text-subtle">By signing in, you agree to our <L to="/terms" className="link">Terms of Service</L> and <L to="/privacy" className="link">Privacy Policy</L></p>
    </div>
  )
}
