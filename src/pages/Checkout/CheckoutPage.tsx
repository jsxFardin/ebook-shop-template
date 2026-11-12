import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Banknote, Lock, MapPin, ShoppingCart, Smartphone } from 'lucide-react'
import type { Order } from '../../types'
import L from '../../components/common/L'
import ProductArt from '../../components/common/ProductArt'
import Field, { validate } from '../../components/forms/Field'
import { Breadcrumbs, EmptyState } from '../../components/common/ui'
import { useAuth, useCart } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { useCartLines } from '../../hooks/useShop'
import { DISTRICTS } from '../../data'
import { formatPrice, isBdPhone, isEmail } from '../../utils/catalog'
import { useT } from '../../i18n'

const PAYMENTS = [
  { key: 'cod', label: 'Cash on Delivery', note: 'Pay in cash when your parcel arrives.', icon: Banknote },
  { key: 'bkash', label: 'bKash', note: 'Demo only — no real payment is taken.', icon: Smartphone },
  { key: 'nagad', label: 'Nagad', note: 'Demo only — no real payment is taken.', icon: Smartphone },
] as const

export default function CheckoutPage() {
  const { lang, to } = useT()
  const nav = useNavigate()
  const user = useAuth((s) => s.user)
  const addOrder = useAuth((s) => s.addOrder)
  const clear = useCart((s) => s.clear)
  const district = useUi((s) => s.district)
  const [v, setV] = useState({ name: user?.name ?? '', phone: user?.phone ?? '', email: user?.email ?? '', district, area: '', address: '', notes: '', wallet: '' })
  const [payment, setPayment] = useState<Order['payment']>('cod')
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v, string>>>({})
  const [agree, setAgree] = useState(true)
  const zone = v.district === 'Dhaka' ? 'inside' : 'outside'
  const { lines, totals, coupon } = useCartLines(zone)
  const f = (n: number) => formatPrice(n, lang)
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setV({ ...v, [k]: e.target.value }); setErrors({ ...errors, [k]: undefined }) }

  if (!lines.length)
    return <div className="container-mb py-8"><div className="panel"><EmptyState icon={<ShoppingCart size={40} />} title="Nothing to check out" text="Your cart is empty. Add a few items first."><L to="/products" className="btn-accent">Start Shopping</L></EmptyState></div></div>

  const place = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(v, {
      name: (s) => s.trim().length < 3 && 'Enter the recipient’s full name.',
      phone: (s) => !isBdPhone(s) && 'Enter a valid Bangladeshi mobile number, e.g. 01712345678.',
      email: (s) => !!s && !isEmail(s) && 'Enter a valid email or leave it empty.',
      area: (s) => s.trim().length < 2 && 'Enter your area or thana.',
      address: (s) => s.trim().length < 8 && 'Enter house, road and landmark so the rider can find you.',
      wallet: (s) => payment !== 'cod' && !isBdPhone(s) && `Enter the ${payment === 'bkash' ? 'bKash' : 'Nagad'} account number.`,
    })
    setErrors(errs)
    if (Object.keys(errs).length || !agree) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    const order: Order = {
      id: `MB${Date.now().toString().slice(-8)}`,
      date: new Date().toISOString(),
      items: lines.map((l) => ({ id: l.product.id, title: l.product.title, price: l.price, qty: l.qty })),
      subtotal: totals.subtotal, shipping: totals.shipping, discount: totals.discount, total: totals.total,
      payment, status: 'Processing',
      address: { name: v.name.trim(), phone: v.phone.trim(), email: v.email.trim() || undefined, district: v.district, area: v.area.trim(), address: v.address.trim() },
    }
    addOrder(order)
    clear()
    nav(to(`/account/orders/${order.id}?placed=1`))
  }

  return (
    <div className="bg-page-alt pb-10">
      <div className="container-mb">
        <Breadcrumbs items={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />
        <form onSubmit={place} noValidate className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <section className="panel p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><MapPin size={18} className="text-accent" />Delivery Address</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" value={v.name} onChange={set('name')} error={errors.name} autoComplete="name" />
                <Field label="Mobile Number" value={v.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" placeholder="01XXXXXXXXX" autoComplete="tel" />
                <Field label="Email" optional value={v.email} onChange={set('email')} error={errors.email} type="email" autoComplete="email" />
                <div>
                  <label htmlFor="district" className="mb-1 block text-sm font-medium">District <span className="text-sale">*</span></label>
                  <select id="district" value={v.district} onChange={set('district')} className="input">{DISTRICTS.map((d) => <option key={d}>{d}</option>)}</select>
                </div>
                <Field label="Area / Thana" value={v.area} onChange={set('area')} error={errors.area} placeholder="e.g. Dhanmondi" />
                <Field label="Address" value={v.address} onChange={set('address')} error={errors.address} placeholder="House, road, landmark" autoComplete="street-address" />
                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="mb-1 block text-sm font-medium">Order note <span className="text-xs font-normal text-subtle">(optional)</span></label>
                  <textarea id="notes" rows={2} value={v.notes} onChange={set('notes')} className="input" placeholder="Anything the rider should know?" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">Delivery: {zone === 'inside' ? 'Inside Dhaka' : 'Outside Dhaka'} · {totals.shipping ? f(totals.shipping) : 'Free'}</p>
            </section>
            <section className="panel p-4 sm:p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><Lock size={18} className="text-accent" />Payment Method</h2>
              <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
                {PAYMENTS.map((pm) => (
                  <label key={pm.key} className={`flex cursor-pointer flex-col gap-1 rounded-lg border-2 p-3 ${payment === pm.key ? 'border-accent bg-accent-tint' : 'border-border hover:border-border-strong'}`}>
                    <span className="flex items-center gap-2 font-semibold"><input type="radio" name="pay" className="accent-[#ff9900]" checked={payment === pm.key} onChange={() => setPayment(pm.key)} /><pm.icon size={17} />{pm.label}</span>
                    <span className="text-xs text-muted">{pm.note}</span>
                  </label>
                ))}
              </div>
              {payment !== 'cod' && <Field className="mt-4 max-w-sm" label={`${payment === 'bkash' ? 'bKash' : 'Nagad'} account number`} value={v.wallet} onChange={set('wallet')} error={errors.wallet} inputMode="tel" placeholder="01XXXXXXXXX" />}
            </section>
          </div>
          <aside className="panel h-fit p-4 lg:sticky lg:top-4">
            <h2 className="mb-3 text-lg font-bold">Order Summary</h2>
            <ul className="max-h-64 divide-y divide-border overflow-y-auto">
              {lines.map(({ product: p, qty }) => (
                <li key={p.id} className="flex items-center gap-3 py-2">
                  <span className="relative h-14 w-11 shrink-0"><ProductArt product={p} /><span className="absolute -right-1.5 -top-1.5 rounded-full bg-navy px-1.5 text-[10px] font-bold text-white">{qty}</span></span>
                  <span className="line-clamp-2 flex-1 text-sm">{p.title}</span>
                  <span className="text-sm font-medium">{f(p.price * qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-2 border-t border-border pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{f(totals.subtotal)}</dd></div>
              {totals.discount > 0 && <div className="flex justify-between text-instock"><dt>Coupon ({coupon})</dt><dd>-{f(totals.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{totals.shipping ? f(totals.shipping) : 'Free'}</dd></div>
              <div className="flex justify-between border-t border-border pt-2 text-lg font-bold"><dt>Total</dt><dd className="text-price">{f(totals.total)}</dd></div>
            </dl>
            <label className="mt-4 flex items-start gap-2 text-xs text-muted">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[#ff9900]" />
              <span>I agree to the <L to="/terms" className="link">Terms &amp; Conditions</L> and <L to="/returns" className="link">Return Policy</L>.</span>
            </label>
            {!agree && <p className="mt-1 text-xs text-red-600">Accept the terms to place your order.</p>}
            <button className="btn-accent mt-4 w-full py-3 text-base">Place Order · {f(totals.total)}</button>
            <p className="mt-2 text-center text-xs text-subtle">Demo checkout — no payment is processed.</p>
          </aside>
        </form>
      </div>
    </div>
  )
}
