import L from '../common/L'
import { iconFor } from '../common/CategoryIcon'
import { categoryBySlug, homepage } from '../../data'
import { useT } from '../../i18n'

export default function CategoryBoxes() {
  const { t } = useT()
  return (
    <section className="relative z-10 -mt-8 sm:-mt-12 lg:-mt-[90px]">
      <div className="container-mb">
        <div className="scrollbar-none -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {homepage.categoryBoxes.map((box) => {
            const root = categoryBySlug.get(box.category)!
            return (
              <div key={box.category} className="w-[82%] shrink-0 snap-start rounded-lg border border-border bg-surface p-4 shadow-sm sm:w-auto">
                <h2 className="mb-3 text-lg font-bold">{root.name}</h2>
                <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                  {box.items.map((slug) => {
                    const c = categoryBySlug.get(slug)!
                    const Icon = iconFor(c.icon)
                    return (
                      <L key={slug} to={`/products?category=${slug}`} className="group text-center">
                        <span className="mx-auto flex aspect-square w-full max-w-[110px] items-center justify-center overflow-hidden rounded transition-transform group-hover:scale-[1.03]" style={{ background: `hsl(${c.hue} 75% 90%)` }}>
                          {c.image
                            ? <img src={c.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                            : <Icon size={44} strokeWidth={1.3} style={{ color: `hsl(${c.hue} 55% 32%)` }} />}
                        </span>
                        <span className="mt-1.5 line-clamp-2 block text-xs text-muted group-hover:text-accent-dark">{c.name}</span>
                      </L>
                    )
                  })}
                </div>
                <L to={`/products?category=${root.slug}`} className="mt-3 block text-sm font-medium text-link hover:text-accent-dark">{t('seeMore')} {root.name}</L>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
