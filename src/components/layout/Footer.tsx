import { useState } from 'react'
import { Headset, Mail, MapPin, Package, QrCode } from 'lucide-react'
import L from '../common/L'
import Social from '../common/Social'
import { rootCategories } from '../../data'
import { isEmail } from '../../utils/catalog'
import { useT } from '../../i18n'

export function NewsletterForm({ dark = true }: { dark?: boolean }) {
  const { t } = useT()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle')
  return (
    <form
      noValidate
      onSubmit={(e) => { e.preventDefault(); setState(isEmail(email) ? 'done' : 'error') }}
      className="max-w-sm"
    >
      <div className="flex gap-2">
        <input
          type="email" value={email} aria-label="Email for newsletter" aria-invalid={state === 'error'}
          onChange={(e) => { setEmail(e.target.value); setState('idle') }} placeholder={t('yourEmail')}
          className={`min-w-0 flex-1 rounded border px-3 py-2 text-sm outline-none focus:border-accent ${dark ? 'border-gray-600 bg-[#1f2a37] text-white placeholder:text-gray-400' : 'input'} ${state === 'error' ? '!border-red-500' : ''}`}
        />
        <button className="rounded bg-accent px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-[#f08c00]">{t('subscribe')}</button>
      </div>
      {state === 'error' && <p className="mt-1.5 text-xs text-red-400">Enter a valid email address, like name@example.com.</p>}
      {state === 'done' && <p className="mt-1.5 text-xs text-[#4ade80]">Subscribed. Watch your inbox for new arrivals.</p>}
    </form>
  )
}

const PAYMENTS = ['VISA', 'Mastercard', 'AMEX', 'bKash', 'Nagad', 'Rocket', 'Upay', 'DBBL', 'City Bank', 'BRAC Bank', 'EBL', 'COD']

export default function Footer() {
  const { t } = useT()
  const h = 'mb-3 text-sm font-bold uppercase tracking-wide text-white'
  const a = 'block py-1 text-sm hover:text-accent'
  const icon = 'mt-0.5 shrink-0 text-accent'
  return (
    <footer className="bg-footer pb-16 text-gray-300 md:pb-0">
      <div className="container-mb grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4 text-sm">
          <div className="flex gap-2"><Headset size={16} className={icon} /><div><p className="font-semibold text-white">Customer Care</p><p>01911-080807, 01914-514506,<br />01707-144122<br />(9:00 AM to 9:00 PM, Everyday)</p><a href="mailto:callcenter@mamunbooks.com" className="hover:text-accent">callcenter@mamunbooks.com</a></div></div>
          <div className="flex gap-2"><Package size={16} className={icon} /><div><p className="font-semibold text-white">Wholesale</p><p>01896177715 (WhatsApp)</p><a href="mailto:wholesale@mamunbooks.com" className="hover:text-accent">wholesale@mamunbooks.com</a></div></div>
          <div className="flex gap-2"><MapPin size={16} className={icon} /><div><p className="font-semibold text-white">Address</p><p><b className="text-gray-200">Business Location:</b><br />19, New Palton Line, Azimpur, Lalbagh, Dhaka-1205.</p><p className="mt-1"><b className="text-gray-200">Operations:</b><br />163-164, Sabbir Tower, Hatirpool, Sonargaon Road, Dhaka.</p></div></div>
          <div className="flex gap-2"><Mail size={16} className={icon} /><div><p className="font-semibold text-white">Email Us</p><a href="mailto:support@mamunbooks.com" className="hover:text-accent">support@mamunbooks.com</a></div></div>
        </div>
        <div>
          <h3 className={h}>Customer Service</h3>
          <L to="/account" className={a}>Account</L><L to="/faq" className={a}>FAQ</L><L to="/contact" className={a}>Contact</L><L to="/delete-account" className={a}>Delete Account</L>
          <h3 className={`${h} mt-6`}>Policy</h3>
          <L to="/privacy" className={a}>Privacy Policy</L><L to="/terms" className={a}>Terms &amp; Conditions</L><L to="/returns" className={a}>Delivery, Return &amp; Refund Policy</L>
          <h3 className={`${h} mt-6`}>Get to Know Us</h3>
          <L to="/about" className={a}>About Us</L><L to="/career" className={a}>Career</L><L to="/blog" className={a}>Blog</L>
        </div>
        <div>
          <h3 className={h}>Shop By</h3>
          {rootCategories.map((c) => <L key={c.slug} to={`/products?category=${c.slug}`} className={a}>{c.name}</L>)}
          <h3 className={`${h} mt-6`}>Browse By</h3>
          <L to="/authors" className={a}>{t('authors')}</L><L to="/publishers" className={a}>{t('publishers')}</L><L to="/brands" className={a}>{t('brands')}</L>
        </div>
        <div>
          <h3 className={h}>Stay Connected</h3>
          <p className="mb-3 text-sm">Subscribe to get updates on new arrivals and special offers.</p>
          <NewsletterForm />
          <p className="mb-2 mt-6 text-sm">Download our app</p>
          <div className="flex gap-3">
            <div className="flex h-[84px] w-[84px] items-center justify-center rounded bg-white text-gray-900" aria-label="QR code placeholder"><QrCode size={64} strokeWidth={1.2} /></div>
            <div className="flex flex-col gap-2">
              <a href="#app" className="flex items-center gap-2 rounded-md border border-gray-600 bg-black/40 px-3 py-1.5 text-white hover:border-accent"><Social name="apple" size={18} /><span className="leading-none"><span className="block text-[9px]">Download on the</span><span className="text-sm font-semibold">App Store</span></span></a>
              <a href="#app" className="flex items-center gap-2 rounded-md border border-gray-600 bg-black/40 px-3 py-1.5 text-white hover:border-accent"><Social name="play" size={18} /><span className="leading-none"><span className="block text-[9px]">GET IT ON</span><span className="text-sm font-semibold">Google Play</span></span></a>
            </div>
          </div>
          <p className="mb-2 mt-6 text-sm">Follow Us</p>
          <div className="flex gap-2">
            {(['facebook', 'x', 'linkedin', 'instagram', 'youtube'] as const).map((s) => (
              <a key={s} href={`#${s}`} aria-label={s} className="flex h-9 w-9 items-center justify-center rounded border border-gray-600 hover:border-accent hover:text-accent"><Social name={s} /></a>
            ))}
          </div>
          <p className="mt-6 text-sm font-semibold text-white">Trade License Number</p>
          <p className="text-sm">TRAD/DSCC/030067/2021</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-mb flex flex-col items-center gap-3">
          <div className="flex w-full flex-wrap items-center justify-center gap-1.5 rounded-md bg-white px-3 py-2">
            <span className="mr-1 text-xs font-semibold text-gray-500">Pay With:</span>
            {PAYMENTS.map((p) => <span key={p} className="rounded border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-700">{p}</span>)}
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Mamun Book. All rights reserved. Demo frontend with sample catalog data.</p>
        </div>
      </div>
    </footer>
  )
}
