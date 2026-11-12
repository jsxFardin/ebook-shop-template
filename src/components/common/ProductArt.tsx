import { useState } from 'react'
import type { Product } from '../../types'
import { categoryBySlug, authorBySlug, brandBySlug, publisherBySlug } from '../../data'
import { iconFor } from './CategoryIcon'

/**
 * Generated product imagery. The demo catalog ships without third-party photos, so every product gets a
 * deterministic SVG "cover" (books) or studio-style shot (general goods). If a product ever carries an
 * `image` URL, it is used and this art becomes the fallback when the image fails to load.
 */
export default function ProductArt({ product, variant = 0, className = '' }: { product: Product & { image?: string }; variant?: number; className?: string }) {
  const [broken, setBroken] = useState(false)
  if (product.image && !broken && variant === 0)
    return <img src={product.image} alt={product.title} loading="lazy" onError={() => setBroken(true)} className={`h-full w-full object-contain ${className}`} />
  return product.type === 'book' ? <BookCover p={product} variant={variant} className={className} /> : <Goods p={product} variant={variant} className={className} />
}

function wrap(text: string, max: number) {
  const lines: string[] = []
  let cur = ''
  for (const w of text.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max && cur) { lines.push(cur); cur = w } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines.slice(0, 4)
}

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`

function BookCover({ p, variant, className }: { p: Product; variant: number; className: string }) {
  const h = p.hue
  const style = Number(p.id.slice(1)) % 4
  const author = p.authors[0] ? authorBySlug.get(p.authors[0]) : undefined
  const pub = p.publisher ? publisherBySlug.get(p.publisher) : undefined
  const lines = wrap(p.title, 13)
  const fs = lines.length > 2 ? 24 : 30
  const gid = `g${p.id}v${variant}`
  if (variant > 0) {
    // back cover / inside page previews for the gallery
    return (
      <svg viewBox="0 0 300 400" className={`h-full w-full ${className}`} role="img" aria-label={`${p.title} preview ${variant + 1}`}>
        <rect x="35" y="10" width="230" height="380" rx="4" fill={variant === 1 ? hsl(h, 45, 30) : '#fbfaf7'} stroke="#ddd" />
        {variant === 1 ? (
          <>
            {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x="60" y={60 + i * 18} width={180 - (i % 3) * 30} height="6" rx="3" fill="#ffffff55" />)}
            <rect x="150" y="300" width="95" height="60" fill="#fff" />
            {Array.from({ length: 22 }, (_, i) => <rect key={i} x={156 + i * 4} y="306" width={i % 3 ? 1.5 : 2.5} height="38" fill="#111" />)}
            <text x="197" y="355" fontSize="7" textAnchor="middle" fill="#111">{p.isbn}</text>
          </>
        ) : (
          <>
            <text x="60" y="50" fontSize="13" fontWeight="700" fill="#333">{variant === 2 ? 'সূচিপত্র / Contents' : `Chapter ${variant - 1}`}</text>
            {Array.from({ length: 16 }, (_, i) => <rect key={i} x="60" y={70 + i * 19} width={i % 5 === 4 ? 110 : 180} height="5" rx="2" fill="#d6d3cc" />)}
          </>
        )}
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 300 400" className={`h-full w-full ${className}`} role="img" aria-label={p.title}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hsl(h, 60, style === 2 ? 92 : 42)} />
          <stop offset="1" stopColor={hsl((h + 30) % 360, 65, style === 2 ? 80 : 26)} />
        </linearGradient>
      </defs>
      <rect x="45" y="8" width="210" height="384" rx="3" fill={`url(#${gid})`} />
      <rect x="45" y="8" width="10" height="384" fill="#00000030" />
      {style === 0 && <circle cx="150" cy="250" r="70" fill={hsl((h + 180) % 360, 70, 60)} opacity=".35" />}
      {style === 1 && [0, 1, 2, 3].map((i) => <rect key={i} x="55" y={230 + i * 22} width="200" height="10" fill="#ffffff22" />)}
      {style === 2 && <path d="M55 300 Q150 220 255 300 L255 392 L55 392Z" fill={hsl(h, 55, 45)} opacity=".55" />}
      {style === 3 && <polygon points="150,190 215,320 85,320" fill="#ffffff26" />}
      <rect x="70" y="40" width="160" height="4" fill={style === 2 ? hsl(h, 60, 30) : '#ffd814'} />
      {lines.map((l, i) => (
        <text key={i} x="150" y={95 + i * (fs + 8)} textAnchor="middle" fontSize={fs} fontWeight="700" fill={style === 2 ? hsl(h, 60, 18) : '#fff'}>{l}</text>
      ))}
      {author && <text x="150" y="360" textAnchor="middle" fontSize="15" fill={style === 2 ? hsl(h, 50, 20) : '#ffffffd9'}>{author.nameBn ?? author.name}</text>}
      {pub && <text x="150" y="380" textAnchor="middle" fontSize="10" fill={style === 2 ? hsl(h, 40, 30) : '#ffffffa0'}>{pub.name}</text>}
    </svg>
  )
}

function Goods({ p, variant, className }: { p: Product; variant: number; className: string }) {
  const Icon = iconFor(categoryBySlug.get(p.category)?.icon ?? '')
  const brand = p.brand ? brandBySlug.get(p.brand)?.name : undefined
  const h = p.hue
  return (
    <div className={`relative flex h-full w-full items-center justify-center ${className}`} role="img" aria-label={`${p.title}${variant ? ` view ${variant + 1}` : ''}`}>
      <div className="absolute inset-[12%] rounded-full blur-2xl" style={{ background: hsl(h, 70, 85), opacity: 0.7 }} />
      <Icon
        strokeWidth={1.25}
        className="relative h-[58%] w-[58%] drop-shadow-[0_10px_12px_rgba(0,0,0,.18)]"
        style={{ color: hsl(h, 55, variant === 1 ? 55 : 32), transform: variant === 2 ? 'rotate(-14deg) scale(.9)' : variant === 1 ? 'scaleX(-1)' : undefined }}
      />
      {brand && <span className="absolute left-2 top-2 rounded-sm bg-white/80 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-700">{brand}</span>}
    </div>
  )
}
