import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { CircleCheck, Mail, MapPin, Phone, Send } from 'lucide-react'
import L from '../../components/common/L'
import Field, { validate } from '../../components/forms/Field'
import { isBdPhone, isEmail } from '../../utils/catalog'

const SUBJECTS = [['order', 'Order inquiry'], ['delivery', 'Delivery issue'], ['return', 'Return or refund'], ['bulk', 'Bulk / wholesale order'], ['other', 'Something else']]
const MAX = 5000

export default function ContactPage() {
  const [sp] = useSearchParams()
  const [v, setV] = useState({ name: '', phone: '', email: '', subject: SUBJECTS.some(([k]) => k === sp.get('subject')) ? sp.get('subject')! : '', message: '' })
  const [errors, setErrors] = useState<Partial<typeof v>>({})
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => { setV({ ...v, [k]: e.target.value.slice(0, k === 'message' ? MAX : 200) }); setErrors({ ...errors, [k]: undefined }) }
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(v, {
      name: (s) => s.trim().length < 3 && 'Enter your full name.',
      phone: (s) => !!s && !isBdPhone(s) && 'Enter a valid mobile number or leave it empty.',
      email: (s) => !isEmail(s) && 'Enter a valid email address.',
      subject: (s) => !s && 'Choose a subject.',
      message: (s) => s.trim().length < 20 && 'Tell us a bit more (at least 20 characters).',
    })
    setErrors(errs)
    if (!Object.keys(errs).length) setSent(true)
  }
  return (
    <div className="container-mb max-w-6xl py-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Contact Us</h1>
      <p className="mt-1 text-muted">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="panel p-5 sm:p-6">
          {sent ? (
            <div className="py-10 text-center">
              <CircleCheck size={48} className="mx-auto text-instock" />
              <h2 className="mt-3 text-xl font-bold">Message sent</h2>
              <p className="mt-1 text-sm text-muted">Thanks, {v.name.split(' ')[0]}. Our team will reply to {v.email} within one working day.</p>
              <button onClick={() => { setSent(false); setV({ ...v, message: '', subject: '' }) }} className="btn-outline mt-5">Send another message</button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
              <h2 className="text-lg font-bold sm:col-span-2">Send us a Message</h2>
              <Field label="Full Name" value={v.name} onChange={set('name')} error={errors.name} placeholder="Enter your full name" />
              <Field label="Phone Number" optional value={v.phone} onChange={set('phone')} error={errors.phone} placeholder="+880 1700-000000" inputMode="tel" />
              <Field label="Email Address" type="email" value={v.email} onChange={set('email')} error={errors.email} placeholder="your.email@example.com" className="sm:col-span-2" />
              <div className="sm:col-span-2">
                <label htmlFor="subject" className="mb-1 block text-sm font-medium">Subject <span className="text-sale">*</span></label>
                <select id="subject" value={v.subject} onChange={set('subject')} aria-invalid={!!errors.subject} className={`input ${errors.subject ? 'input-error' : ''}`}>
                  <option value="">Select a subject</option>
                  {SUBJECTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject}</p>}
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="msg" className="mb-1 block text-sm font-medium">Message <span className="text-sale">*</span></label>
                <textarea id="msg" rows={5} value={v.message} onChange={set('message')} aria-invalid={!!errors.message} placeholder="Please describe your inquiry in detail..." className={`input ${errors.message ? 'input-error' : ''}`} />
                <div className="mt-1 flex justify-between text-xs">
                  {errors.message ? <span className="text-red-600">{errors.message}</span> : <span className="text-subtle">Please provide as much detail as possible so we can assist you better.</span>}
                  <span className="text-subtle">{v.message.length}/{MAX}</span>
                </div>
              </div>
              <button className="btn-accent py-2.5 sm:col-span-2"><Send size={16} />Send Message</button>
            </form>
          )}
        </section>
        <aside className="space-y-5">
          <div className="panel p-5">
            <h2 className="mb-4 font-bold">Contact Information</h2>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3"><MapPin size={18} className="mt-0.5 text-accent" /><span><b className="block">Address</b>19, New Palton Line, Azimpur, Lalbagh, Dhaka-1205</span></li>
              <li className="flex gap-3"><Phone size={18} className="mt-0.5 text-accent" /><span><b className="block">Phone Number</b><a href="tel:+8801914950420" className="link">+8801914950420</a></span></li>
              <li className="flex gap-3"><Mail size={18} className="mt-0.5 text-accent" /><span><b className="block">Email Address</b><a href="mailto:support@mamunbooks.com" className="link">support@mamunbooks.com</a></span></li>
            </ul>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-5 dark:border-sky-900 dark:bg-sky-950">
            <h2 className="mb-2 font-bold">Quick Links</h2>
            <L to="/faq" className="block py-1 text-sm text-link hover:underline">Frequently Asked Questions</L>
            <L to="/returns" className="block py-1 text-sm text-link hover:underline">Delivery &amp; Return Policy</L>
            <L to="/account/orders" className="block py-1 text-sm text-link hover:underline">Track my order</L>
          </div>
        </aside>
      </div>
    </div>
  )
}
