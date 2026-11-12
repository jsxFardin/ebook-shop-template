import { useState } from 'react'
import { ArrowLeft, MailCheck } from 'lucide-react'
import L from '../../components/common/L'
import Field from '../../components/forms/Field'
import { isBdPhone, isEmail } from '../../utils/catalog'

export default function ForgotPage() {
  const [id, setId] = useState('')
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className="mx-auto max-w-md px-4">
      <div className="panel p-6 shadow-sm">
        {sent ? (
          <div className="text-center">
            <MailCheck size={44} className="mx-auto text-instock" />
            <h1 className="mt-3 text-xl font-bold">Check your messages</h1>
            <p className="mt-2 text-sm text-muted">If an account exists for <b>{id}</b>, we've sent a reset link. (Demo — nothing is actually sent.)</p>
            <L to="/login" className="btn-accent mt-5 w-full">Back to Login</L>
          </div>
        ) : (
          <form noValidate onSubmit={(e) => { e.preventDefault(); if (isBdPhone(id) || isEmail(id)) setSent(true); else setErr('Enter the mobile number or email you registered with.') }} className="space-y-4">
            <h1 className="text-xl font-bold">Reset your password</h1>
            <p className="text-sm text-muted">Enter your mobile number or email and we'll send you a reset code.</p>
            <Field label="Mobile or Email" value={id} onChange={(e) => { setId(e.target.value); setErr('') }} error={err} placeholder="01XXXXXXXXX or email@example.com" />
            <button className="btn-accent w-full py-2.5">Send reset code</button>
          </form>
        )}
      </div>
      <L to="/login" className="mt-5 flex items-center justify-center gap-1 text-sm text-link hover:underline"><ArrowLeft size={15} />Back to Login</L>
    </div>
  )
}
