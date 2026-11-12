import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Headphones, Heart, Package, ShieldCheck, Tag, Truck, Zap } from 'lucide-react'
import L from '../../components/common/L'
import Field, { validate } from '../../components/forms/Field'
import { useAuth } from '../../stores/shop'
import { isBdPhone, isEmail } from '../../utils/catalog'
import { useT } from '../../i18n'
import { safeRedirect } from './LoginPage'

export default function RegisterPage() {
  const { to } = useT()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const login = useAuth((s) => s.login)
  const [v, setV] = useState({ name: '', email: '', phone: '', password: '', confirm: '' })
  const [errors, setErrors] = useState<Partial<typeof v> & { otp?: string }>({})
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otp, setOtp] = useState('')
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => { setV({ ...v, [k]: e.target.value }); setErrors({ ...errors, [k]: undefined }) }

  const sendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(v, {
      name: (s) => s.trim().length < 3 && 'Enter your full name.',
      email: (s) => !!s && !isEmail(s) && 'Enter a valid email or leave it empty.',
      phone: (s) => !isBdPhone(s) && 'Enter a valid Bangladeshi mobile number, e.g. 01712345678.',
      password: (s) => s.length < 6 && 'Use at least 6 characters.',
      confirm: (s, all) => s !== all.password && 'Passwords don’t match.',
    })
    setErrors(errs)
    if (!Object.keys(errs).length) setStep('otp')
  }
  const verify = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp)) return setErrors({ otp: 'Enter the 6-digit code.' })
    login({ name: v.name.trim(), phone: v.phone.trim(), email: v.email.trim() || undefined })
    nav(to(safeRedirect(sp.get('redirect'))), { replace: true })
  }
  const perks = [[Package, 'Track Orders', 'View and track all your orders in one place'], [Heart, 'Wishlist', 'Save books you want to buy later'], [Zap, 'Fast Checkout', 'Quick checkout with saved addresses'], [Tag, 'Exclusive Deals', 'Get special offers and discounts']] as const
  return (
    <div className="container-mb grid max-w-5xl gap-6 lg:grid-cols-[1fr_300px]">
      <div className="panel p-6 shadow-sm">
        {step === 'form' ? (
          <form onSubmit={sendOtp} noValidate className="space-y-4">
            <div><h1 className="text-2xl font-bold">Create Account</h1><p className="text-sm text-muted">Register to access your orders, wishlist, and more</p></div>
            <Field label="Full Name" value={v.name} onChange={set('name')} error={errors.name} placeholder="Enter your full name" autoComplete="name" />
            <Field label="Email Address" optional type="email" value={v.email} onChange={set('email')} error={errors.email} placeholder="your.email@example.com" autoComplete="email" />
            <Field label="Mobile Number" inputMode="tel" value={v.phone} onChange={set('phone')} error={errors.phone} placeholder="01XXXXXXXXX" autoComplete="tel" />
            <Field label="Password" type="password" value={v.password} onChange={set('password')} error={errors.password} placeholder="At least 6 characters" autoComplete="new-password" />
            <Field label="Confirm Password" type="password" value={v.confirm} onChange={set('confirm')} error={errors.confirm} placeholder="Re-enter password" autoComplete="new-password" />
            <p className="rounded bg-surface-2 p-3 text-xs text-muted">By creating an account, you agree to our <L to="/terms" className="link">Terms and Conditions</L> and <L to="/privacy" className="link">Privacy Policy</L></p>
            <button className="btn-accent w-full py-2.5 text-base">Send OTP &amp; Continue</button>
            <p className="text-center text-sm">Already have an account? <L to="/login" className="link font-medium">Sign in</L></p>
          </form>
        ) : (
          <form onSubmit={verify} noValidate className="space-y-4">
            <h1 className="text-2xl font-bold">Verify your number</h1>
            <p className="text-sm text-muted">We sent a 6-digit code to <b className="text-foreground">{v.phone}</b>. (Demo: any 6 digits work.)</p>
            <Field label="Verification code" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors({}) }} error={errors.otp} placeholder="••••••" autoComplete="one-time-code" />
            <button className="btn-accent w-full py-2.5 text-base">Verify &amp; Create Account</button>
            <button type="button" onClick={() => setStep('form')} className="w-full text-sm text-link hover:underline">Change details</button>
          </form>
        )}
      </div>
      <aside className="space-y-4">
        <div className="panel p-4">
          <h2 className="mb-3 font-bold">Benefits of Your Account</h2>
          <ul className="space-y-3">{perks.map(([I, t, d]) => <li key={t} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-gray-900"><I size={13} /></span><span><b className="block text-sm">{t}</b><span className="text-xs text-muted">{d}</span></span></li>)}</ul>
        </div>
        {[[ShieldCheck, 'Secure Shopping', '100% secure transactions', 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300'], [Truck, 'Fast Delivery', 'Quick delivery across Bangladesh', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'], [Headphones, '24/7 Support', "We're here to help you", 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300']].map(([I, t, d, c]) => {
          const Icon = I as typeof Truck
          return <div key={t as string} className={`flex items-center gap-3 rounded-lg p-4 ${c}`}><Icon size={26} /><span><b className="block text-sm">{t as string}</b><span className="text-xs opacity-80">{d as string}</span></span></div>
        })}
        <div className="rounded-lg bg-navy p-5 text-white">
          <h2 className="font-bold">Are you a Publisher?</h2>
          <p className="mt-1 text-xs text-gray-300">Join our publisher network and reach thousands of customers</p>
          <L to="/login?portal=publisher" className="btn-accent mt-4 w-full">Register as Publisher</L>
        </div>
      </aside>
    </div>
  )
}
