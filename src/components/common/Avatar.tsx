import { useState } from 'react'
import type { Person } from '../../types'

/** Author photo / publisher / brand logo. Falls back to an initials tile when there is no image or it fails to load. */
export default function Avatar({ person, round = false, className = '' }: { person: Person; round?: boolean; className?: string }) {
  const [broken, setBroken] = useState(false)
  const shape = round ? 'rounded-full' : 'rounded-md'
  if (person.image && !broken)
    return <img src={person.image} alt="" loading="lazy" onError={() => setBroken(true)} className={`bg-white object-contain ${shape} ${className}`} />
  return (
    <div
      aria-hidden
      className={`flex items-center justify-center font-bold text-white ${shape} ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${person.hue} 55% 42%), hsl(${(person.hue + 40) % 360} 60% 28%))` }}
    >
      <span className="tracking-wide">{person.initials}</span>
    </div>
  )
}
