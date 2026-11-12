import type { Person } from '../../types'

/** Initials tile used for author photos, publisher and brand logos (demo data has no third-party images). */
export default function Avatar({ person, round = false, className = '' }: { person: Person; round?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center font-bold text-white ${round ? 'rounded-full' : 'rounded-md'} ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${person.hue} 55% 42%), hsl(${(person.hue + 40) % 360} 60% 28%))` }}
    >
      <span className="tracking-wide">{person.initials}</span>
    </div>
  )
}
