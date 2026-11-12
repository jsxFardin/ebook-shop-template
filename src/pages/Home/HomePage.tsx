import { Award, BookMarked, Clock3, Package, TrendingUp } from 'lucide-react'
import HeroSlider from '../../components/home/HeroSlider'
import CategoryBoxes from '../../components/home/CategoryBoxes'
import ProductSection from '../../components/home/ProductSection'
import PromoBanners from '../../components/home/PromoBanners'
import BrowseTabs from '../../components/home/BrowseTabs'
import { products, homepage, categoryBySlug, catalogCtx } from '../../data'
import { filterProducts, sortProducts } from '../../utils/catalog'
import { useT } from '../../i18n'

const top = (q: Parameters<typeof filterProducts>[1], sort: Parameters<typeof sortProducts>[1], n = 10) =>
  sortProducts(filterProducts(products, q, catalogCtx), sort).slice(0, n)

const newArrivals = top({ type: 'book' }, 'newest')
const featured = sortProducts(products.filter((p) => p.featured), 'featured').slice(0, 10)
const bestBooks = top({ type: 'book' }, 'bestselling')
const bestGeneral = top({ type: 'general' }, 'bestselling')

export default function HomePage() {
  const { t } = useT()
  return (
    <>
      <h1 className="sr-only">Mamun Book — online book shopping in Bangladesh</h1>
      <HeroSlider />
      <CategoryBoxes />
      <div className="mt-6 sm:mt-8">
        <ProductSection title={t('newArrivals')} icon={<Clock3 size={18} />} to="/products?sort_by=newest&type=book" linkLabel={t('seeMore')} items={newArrivals} />
        <ProductSection title={t('featured')} icon={<Award size={18} />} to="/products?sort_by=featured" linkLabel={t('seeMore')} items={featured} />
        <PromoBanners />
        <ProductSection
          title={<>📚 {t('bestsellingBooks')}</>} icon={<TrendingUp size={18} />} to="/products?sort_by=bestselling&type=book" linkLabel={t('seeAll')} items={bestBooks}
          extra={<span className="rounded bg-sale px-1.5 py-0.5 text-[10px] font-bold text-white">{t('hot')}</span>}
        />
        <BrowseTabs />
        <ProductSection title={<>📦 {t('bestsellingProducts')}</>} icon={<Package size={18} />} to="/products?sort_by=bestselling&type=general" linkLabel={t('seeAll')} items={bestGeneral} />
        {homepage.categoryRails.map((slug, i) => (
          <ProductSection key={slug} alt={i % 2 === 0} title={categoryBySlug.get(slug)!.name} icon={<BookMarked size={18} />} to={`/products?category=${slug}`} linkLabel={t('seeMore')} items={top({ category: slug }, 'bestselling')} />
        ))}
        {homepage.rootSections.map((slug, i) => (
          <ProductSection key={slug} alt={i % 2 === 1} title={categoryBySlug.get(slug)!.name} to={`/products?category=${slug}`} linkLabel={`${t('seeAll')} →`} items={top({ category: slug }, 'featured')} />
        ))}
      </div>
    </>
  )
}
