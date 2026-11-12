import L from '../common/L'
import { iconFor } from '../common/CategoryIcon'
import { banners } from '../../data'

export default function PromoBanners() {
  return (
    <section className="border-t border-border py-6">
      <div className="container-mb grid gap-3 sm:grid-cols-3 sm:gap-4">
        {banners.promos.map((b) => {
          const Icon = iconFor(b.icon)
          return (
            <L key={b.id} to={b.to} className="group relative flex h-28 items-center overflow-hidden rounded-lg p-5 text-white sm:h-32 lg:h-[132px]" style={{ background: `linear-gradient(120deg, ${b.from}, ${b.to2})` }}>
              <div className="relative z-10 max-w-[65%]">
                <p className="text-lg font-extrabold leading-tight lg:text-2xl">{b.title}</p>
                <p className="mt-1 text-xs text-white/85 lg:text-sm">{b.subtitle}</p>
                <span className="mt-2 inline-block rounded-full bg-white px-3 py-0.5 text-[11px] font-bold text-gray-900">{b.cta}</span>
              </div>
              <Icon size={110} strokeWidth={1} className="absolute -right-2 bottom-0 text-white/30 transition-transform duration-300 group-hover:scale-110" />
            </L>
          )
        })}
      </div>
    </section>
  )
}
