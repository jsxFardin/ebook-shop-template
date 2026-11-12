import L from './L'

export default function Logo({ light = false }: { light?: boolean }) {
  return (
    <L to="/" aria-label="Mamun Book home" className="flex shrink-0 items-center gap-1.5">
      <svg viewBox="0 0 40 40" className="h-8 w-8 sm:h-9 sm:w-9" aria-hidden>
        <circle cx="20" cy="20" r="19" fill="#232f3e" />
        <path d="M9 13c4-2 7.5-2 11 .5 3.5-2.5 7-2.5 11-.5v15c-4-2-7.5-2-11 .5-3.5-2.5-7-2.5-11-.5z" fill="#ff9900" />
        <path d="M20 13.5v15" stroke="#232f3e" strokeWidth="1.6" />
        <path d="M11 30c6 3 12 3 18 0" stroke="#ffd814" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className={`block text-[15px] font-extrabold sm:text-[17px] tracking-tight ${light ? 'text-white' : 'text-navy dark:text-white'}`}>MAMUN<span className="text-accent">BOOKS</span></span>
        <span className={`block text-[8.5px] ${light ? 'text-gray-300' : 'text-subtle'}`}>বইয়ের সাথে প্রতিদিন</span>
      </span>
    </L>
  )
}
