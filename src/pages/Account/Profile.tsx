import { useState } from 'react'
import Field, { validate } from '../../components/forms/Field'
import { useAuth } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { isBdPhone, isEmail } from '../../utils/catalog'

export default function Profile() {
  const user = useAuth((s) => s.user)!
  const update = useAuth((s) => s.update)
  const toast = useUi((s) => s.toast)
  const [v, setV] = useState({ name: user.name, phone: user.phone, email: user.email ?? '' })
  const [errors, setErrors] = useState<Partial<typeof v>>({})
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => { setV({ ...v, [k]: e.target.value }); setErrors({ ...errors, [k]: undefined }) }
  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(v, {
      name: (s) => s.trim().length < 3 && 'Enter your full name.',
      phone: (s) => !isBdPhone(s) && 'Enter a valid Bangladeshi mobile number.',
      email: (s) => !!s && !isEmail(s) && 'Enter a valid email or leave it empty.',
    })
    setErrors(errs)
    if (Object.keys(errs).length) return
    update({ name: v.name.trim(), phone: v.phone.trim(), email: v.email.trim() || undefined })
    toast('Profile saved')
  }
  return (
    <section className="panel p-5">
      <h1 className="mb-4 text-xl font-bold">Profile</h1>
      <form onSubmit={save} noValidate className="grid max-w-2xl gap-4 sm:grid-cols-2">
        <Field label="Full Name" value={v.name} onChange={set('name')} error={errors.name} className="sm:col-span-2" />
        <Field label="Mobile Number" value={v.phone} onChange={set('phone')} error={errors.phone} inputMode="tel" />
        <Field label="Email" optional type="email" value={v.email} onChange={set('email')} error={errors.email} />
        <div className="sm:col-span-2"><button className="btn-accent px-6">Save changes</button></div>
      </form>
    </section>
  )
}
