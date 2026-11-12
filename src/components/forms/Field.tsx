import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

type Props = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: ReactNode; optional?: boolean; icon?: ReactNode; aside?: ReactNode }

export default function Field({ label, error, hint, optional, icon, aside, type, className = '', ...rest }: Props) {
  const id = useId()
  const [show, setShow] = useState(false)
  const isPw = type === 'password'
  return (
    <div className={className}>
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">
          {label}{optional ? <span className="ml-1 text-xs font-normal text-subtle">(optional)</span> : <span className="text-sale"> *</span>}
        </label>
        {aside}
      </div>
      <div className="relative">
        {icon && <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle">{icon}</span>}
        <input
          id={id} type={isPw && show ? 'text' : type} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
          className={`input ${icon ? 'pl-9' : ''} ${isPw ? 'pr-10' : ''} ${error ? 'input-error' : ''}`} {...rest}
        />
        {isPw && (
          <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-subtle hover:text-foreground">
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error ? <p id={`${id}-e`} className="mt-1 text-xs text-red-600">{error}</p> : hint && <p className="mt-1 text-xs text-subtle">{hint}</p>}
    </div>
  )
}

/** Runs rule map → error map; returns true when clean. */
export function validate<T extends Record<string, string>>(values: T, rules: Partial<Record<keyof T, (v: string, all: T) => string | false>>) {
  const errors: Partial<Record<keyof T, string>> = {}
  for (const k in rules) { const msg = rules[k]!(values[k] ?? '', values); if (msg) errors[k] = msg }
  return errors
}
