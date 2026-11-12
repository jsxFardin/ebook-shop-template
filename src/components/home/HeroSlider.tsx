import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination, A11y } from 'swiper/modules'
import { ChevronLeft, ChevronRight, Watch } from 'lucide-react'
import 'swiper/css'
import 'swiper/css/pagination'
import L from '../common/L'
import ProductArt from '../common/ProductArt'
import { banners, products, catalogCtx } from '../../data'
import { filterProducts } from '../../utils/catalog'

const coversFor = (to: string) => {
  const cat = new URLSearchParams(to.split('?')[1]).get('category') ?? ''
  return filterProducts(products, { category: cat }, catalogCtx).slice(0, 3)
}

export default function HeroSlider() {
  const side = banners.side
  return (
    <section className="relative" aria-label="Promotions">
      <Swiper
        className="hero-swiper"
        modules={[Autoplay, Navigation, Pagination, A11y]}
        loop autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        navigation={{ prevEl: '.hero-prev', nextEl: '.hero-next' }}
        pagination={{ clickable: true }}
      >
        {banners.hero.map((b) => {
          const covers = coversFor(b.to)
          return (
            <SwiperSlide key={b.id}>
              <div className="h-[200px] sm:h-[300px] lg:h-[420px]" style={{ background: `linear-gradient(115deg, ${b.from}, ${b.to2})` }}>
                <div className="container-mb flex h-full items-center pb-6 lg:pb-20 lg:pr-[320px]">
                  <div className="z-10 max-w-[58%] text-white sm:max-w-[55%]">
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-bold text-gray-900 sm:text-sm" style={{ background: b.accent }}>{b.badge}</span>
                    <h2 className="mt-2 text-xl font-extrabold leading-tight sm:mt-3 sm:text-4xl lg:text-5xl">{b.title}</h2>
                    <p className="mt-1 text-xs text-white/85 sm:mt-3 sm:text-lg">{b.subtitle}</p>
                    <L to={b.to} className="mt-3 inline-block rounded bg-cart px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-cart-hover sm:mt-5 sm:px-5 sm:py-2.5 sm:text-sm">{b.cta}</L>
                  </div>
                  <div className="relative ml-auto flex h-[78%] flex-1 items-center justify-center" aria-hidden>
                    {covers.map((p, i) => (
                      <div key={p.id} className="absolute h-full w-[38%] max-w-[170px] drop-shadow-2xl" style={{ transform: `translateX(${(i - 1) * 62}%) rotate(${(i - 1) * 8}deg) translateY(${i === 1 ? -4 : 6}%)`, zIndex: i === 1 ? 2 : 1 }}>
                        <ProductArt product={p} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>
      <button className="hero-prev absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white sm:flex lg:left-4" aria-label="Previous slide"><ChevronLeft /></button>
      <button className="hero-next absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow hover:bg-white sm:flex lg:right-4" aria-label="Next slide"><ChevronRight /></button>
      <div className="pointer-events-none absolute inset-0 z-[5] hidden lg:block">
        <div className="container-mb flex h-full justify-end pb-[110px] pt-5">
          <L to={side.to} className="pointer-events-auto flex w-[300px] flex-col items-center justify-between rounded-lg p-5 text-center text-white shadow-xl ring-1 ring-white/10" style={{ background: `linear-gradient(160deg, ${side.from}, ${side.to2})` }}>
            <div>
              <p className="text-2xl font-extrabold text-cart">{side.title}</p>
              <p className="mt-1 text-sm text-white/80">{side.subtitle}</p>
            </div>
            <Watch size={110} strokeWidth={1} className="text-white/90" />
            <span className="rounded bg-accent px-5 py-1.5 text-sm font-bold text-gray-900">{side.cta}</span>
          </L>
        </div>
      </div>
    </section>
  )
}
