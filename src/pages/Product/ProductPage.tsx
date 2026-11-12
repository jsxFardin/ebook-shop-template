import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BookOpen, Check, Copy, PenLine, ShoppingCart, Tag, Truck, CircleCheck } from 'lucide-react'
import type { Product, Review } from '../../types'
import L from '../../components/common/L'
import Avatar from '../../components/common/Avatar'
import ProductArt from '../../components/common/ProductArt'
import Gallery from '../../components/product/Gallery'
import ProductGrid from '../../components/product/ProductGrid'
import { Breadcrumbs, Price, QtyStepper, Stars } from '../../components/common/ui'
import NotFoundPage from '../Static/NotFoundPage'
import { productBySlug, products, categoryTrail, categoryBySlug, authorBySlug, publisherBySlug, brandBySlug, catalogCtx } from '../../data'
import { discountPct, filterProducts, formatPrice, sortProducts } from '../../utils/catalog'
import { useAddToCart } from '../../hooks/useShop'
import { useCart } from '../../stores/shop'
import { useUi } from '../../stores/ui'
import { useT } from '../../i18n'

export default function ProductPage() {
  const { slug = '' } = useParams()
  const p = productBySlug.get(decodeURIComponent(slug))
  const viewed = useUi((s) => s.viewed)
  useEffect(() => { if (p) { viewed(p.id); document.title = `${p.title} | Mamun Book` } }, [p, viewed])
  if (!p) return <NotFoundPage />
  return <Detail key={p.id} p={p} />
}

function Detail({ p }: { p: Product }) {
  const { t, lang, to } = useT()
  const nav = useNavigate()
  const add = useAddToCart()
  const cartAdd = useCart((s) => s.add)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState<'desc' | 'people' | 'spec' | 'reviews'>('desc')
  const [copied, setCopied] = useState(false)
  const out = p.stock <= 0
  const off = discountPct(p)
  const isBook = p.type === 'book'
  const trail = categoryTrail(p.category)
  const pub = p.publisher ? publisherBySlug.get(p.publisher) : undefined
  const brand = p.brand ? brandBySlug.get(p.brand) : undefined
  const people = p.authors.map((a) => authorBySlug.get(a)!).filter(Boolean)
  const similar = sortProducts(filterProducts(products, { category: p.category }, catalogCtx).filter((x) => x.id !== p.id), 'bestselling')
  const alsoLike = similar.slice(0, 5)
  const featuredRail = sortProducts(products.filter((x) => x.featured && x.type === p.type && x.id !== p.id), 'featured').slice(0, 5)
  const fromSame = products.filter((x) => x.id !== p.id && (pub ? x.publisher === pub.slug : x.brand === p.brand)).slice(0, 5)

  const copySku = () => { navigator.clipboard?.writeText(p.sku).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const buyNow = () => { cartAdd(p.id, qty, p.stock); nav(to('/checkout')) }

  const specs: [string, string | number | undefined][] = isBook
    ? [['Language', p.language], ['Pages', p.pages], ['Size', p.size], ['Cover Type', p.coverType], ['Weight (g)', p.weight && `${p.weight} g`], ['Edition', p.edition], ['ISBN', p.isbn]]
    : [['Grade', p.grade], ['Origin', p.origin], ['Weight (g)', p.weight && `${p.weight} g`]]

  return (
    <div className="pb-6">
      <div className="container-mb">
        <Breadcrumbs items={[{ label: 'Products', to: '/products' }, ...trail.map((c) => ({ label: c.name, to: `/products?category=${c.slug}` })), { label: p.title }]} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,360px)_minmax(0,1fr)_300px]">
          <div className="mx-auto w-full max-w-sm lg:max-w-none"><Gallery p={p} /></div>

          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-snug sm:text-2xl">{p.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted">
              <span className="flex items-center gap-1">SKU: <code className="font-mono text-foreground">{p.sku}</code>
                <button onClick={copySku} aria-label="Copy SKU" className="p-0.5 hover:text-accent-dark">{copied ? <Check size={14} className="text-instock" /> : <Copy size={14} />}</button>
              </span>
              <span>Category: <L to={`/products?category=${p.category}`} className="text-foreground hover:text-accent-dark">{categoryBySlug.get(p.category)?.name}</L></span>
              {p.rating > 0 && <button onClick={() => { setTab('reviews'); document.getElementById('tabs')?.scrollIntoView({ behavior: 'smooth' }) }} className="flex items-center gap-1"><Stars value={p.rating} />({p.reviews.length})</button>}
            </div>
            <p className="mt-2 text-sm sm:text-base">
              {isBook ? 'Author: ' : 'Brand: '}
              {isBook
                ? people.map((a, i) => <span key={a.slug}>{i > 0 && ' , '}<L to={`/authors/${a.slug}`} className="text-link hover:underline">{a.nameBn} , {a.name}</L></span>)
                : brand && <L to={`/brands/${brand.slug}`} className="text-link hover:underline">{brand.name}</L>}
            </p>

            <div className="panel mt-4 p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">{isBook ? <BookOpen size={16} className="text-accent" /> : <Tag size={16} className="text-accent" />}{isBook ? 'Book Details' : 'Product Details'}</h2>
              {(pub || brand) && (
                <div className="mb-3 flex items-center gap-3 rounded-md border border-border p-3">
                  <Avatar person={(pub ?? brand)!} className="h-11 w-11 shrink-0 text-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase text-subtle">{pub ? 'Publisher' : 'Brand'}</p>
                    <p className="truncate text-sm font-semibold text-link">{pub ? `${pub.nameBn}, ${pub.name}` : brand!.name}</p>
                  </div>
                  <L to={pub ? `/publishers/${pub.slug}` : `/brands/${brand!.slug}`} className="shrink-0 text-xs font-medium text-link hover:underline">View {pub ? 'Books' : 'Products'} →</L>
                </div>
              )}
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {specs.filter(([, v]) => v).slice(0, isBook ? 5 : 3).map(([k, v]) => (
                  <div key={k} className="rounded bg-surface-2 px-3 py-2"><dt className="text-[10px] uppercase text-subtle">{k}</dt><dd className="text-sm">{v}</dd></div>
                ))}
              </dl>
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex flex-wrap items-baseline gap-3">
                <Price price={p.price} original={p.originalPrice} size="lg" />
                {off > 0 && <span className="text-base font-medium text-price">{t('save')} {formatPrice(p.originalPrice! - p.price, lang)}</span>}
              </div>
              <p className={`mt-1 text-sm font-semibold ${out ? 'text-sale' : 'text-instock'}`}>{out ? t('outOfStock') : p.stock < 10 ? t('onlyLeft', { n: p.stock }) : t('inStock')}</p>
            </div>

            <div className="panel mt-4 flex gap-3 p-3">
              <Truck size={20} className="mt-0.5 shrink-0 text-accent" />
              <div><p className="font-semibold">Delivery charge varies by location &amp; weight</p><p className="text-xs text-muted">Inside Dhaka ৳60 · Outside Dhaka ৳120 · Estimated delivery: 2-3 Days</p></div>
            </div>

            {!out && (
              <>
                <div className="mt-4 flex items-center gap-3"><span className="text-sm font-semibold">{t('quantity')}</span><QtyStepper value={qty} onChange={setQty} max={Math.min(p.stock, 20)} /></div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button onClick={() => add(p, qty)} className="btn-cart py-3 text-base"><ShoppingCart size={18} />{t('addToCart')}</button>
                  <button onClick={buyNow} className="btn-accent py-3 text-base">{t('buyNow')}</button>
                </div>
              </>
            )}
            {out && <button disabled className="btn-cart mt-4 w-full py-3">{t('outOfStock')}</button>}
            <ul className="mt-4 space-y-1 text-sm text-muted">{p.highlights.map((h) => <li key={h} className="flex items-center gap-2"><CircleCheck size={15} className="text-instock" />{h}</li>)}</ul>
          </div>

          <aside className="panel h-fit p-4">
            <h2 className="mb-3 font-semibold">You May Also Like</h2>
            <ul className="space-y-4">
              {alsoLike.map((x) => (
                <li key={x.id}>
                  <L to={`/products/${x.slug}`} className="group flex gap-3">
                    <span className="h-[60px] w-12 shrink-0 rounded border border-border p-0.5"><ProductArt product={x} /></span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm group-hover:text-accent-dark">{x.title}</span>
                      <Price price={x.price} original={x.originalPrice} size="sm" />
                    </span>
                  </L>
                </li>
              ))}
            </ul>
          </aside>
        </div>

        <section id="tabs" className="panel mt-8 overflow-hidden">
          <div role="tablist" className="scrollbar-none flex overflow-x-auto border-b border-border">
            {([['desc', 'Description'], ['people', isBook ? 'Authors' : 'Brand'], ['spec', 'Specification'], ['reviews', `Reviews (${p.reviews.length})`]] as const).map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={`flex-1 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium ${tab === k ? 'border-accent bg-accent-tint text-accent-dark' : 'border-transparent text-muted hover:text-foreground'}`}>{label}</button>
            ))}
          </div>
          <div className="p-4 sm:p-6" role="tabpanel">
            {tab === 'desc' && (
              <article className="max-w-3xl space-y-3 leading-relaxed">
                <h2 className="text-xl font-bold">{p.title}</h2>
                {p.description.map((d, i) => <p key={i} className="text-muted">{d}</p>)}
                <h3 className="pt-2 font-semibold">Highlights</h3>
                <ul className="list-disc space-y-1 pl-5 text-muted">{p.highlights.map((h) => <li key={h}>{h}</li>)}</ul>
              </article>
            )}
            {tab === 'people' && (
              <div className="grid gap-4 sm:grid-cols-2">
                {(isBook ? people : brand ? [brand] : []).map((a) => (
                  <L key={a.slug} to={`/${isBook ? 'authors' : 'brands'}/${a.slug}`} className="flex gap-4 rounded-lg border border-border p-4 hover:shadow-md">
                    <Avatar person={a} round={isBook} className="h-16 w-16 shrink-0 text-lg" />
                    <div><p className="font-semibold">{a.nameBn ? `${a.nameBn} , ${a.name}` : a.name}</p><p className="mt-1 text-sm text-muted">{a.bio}</p></div>
                  </L>
                ))}
              </div>
            )}
            {tab === 'spec' && (
              <table className="w-full max-w-2xl text-sm">
                <tbody>
                  {[['Title', p.title], ...(isBook ? [['Author', people.map((a) => a.name).join(', ')], ['Publisher', pub?.name]] : [['Brand', brand?.name]]), ...specs, ['SKU', p.sku]]
                    .filter(([, v]) => v).map(([k, v]) => (
                      <tr key={k as string} className="border-b border-border last:border-0"><th className="w-40 bg-surface-2 px-3 py-2 text-left font-medium">{k}</th><td className="px-3 py-2">{v}</td></tr>
                    ))}
                </tbody>
              </table>
            )}
            {tab === 'reviews' && <Reviews p={p} />}
          </div>
        </section>
      </div>
      {[[isBook ? 'Featured Books' : 'Featured Products', featuredRail], [pub ? `${pub.nameBn}, ${pub.name}` : brand ? `More from ${brand.name}` : '', fromSame], ['Similar Products', similar.slice(5, 10)]].map(([title, items]) =>
        (items as Product[]).length > 0 && title ? (
          <section key={title as string} className="container-mb mt-8">
            <h2 className="mb-4 text-lg font-bold">{title as string}</h2>
            <ProductGrid items={items as Product[]} />
          </section>
        ) : null,
      )}
    </div>
  )
}

function Reviews({ p }: { p: Product }) {
  const [list, setList] = useState<Review[]>(p.reviews)
  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rating) return setErr('Choose a star rating.')
    if (text.trim().length < 10) return setErr('Write at least 10 characters about the product.')
    setList([{ id: `new${Date.now()}`, name: name.trim() || 'Guest', rating, date: new Date().toISOString().slice(0, 10), text: text.trim() }, ...list])
    setRating(0); setText(''); setErr('')
  }
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <div>
        <p className="text-4xl font-bold">{avg ? avg.toFixed(1) : '–'}<span className="text-base font-normal text-subtle"> / 5</span></p>
        <Stars value={avg} size={18} />
        <p className="mt-1 text-sm text-muted">{list.length} review{list.length === 1 ? '' : 's'}</p>
        {[5, 4, 3, 2, 1].map((s) => {
          const n = list.filter((r) => r.rating === s).length
          return <div key={s} className="mt-1.5 flex items-center gap-2 text-xs"><span className="w-3">{s}</span><span className="h-2 flex-1 rounded bg-surface-2"><span className="block h-2 rounded bg-accent" style={{ width: `${list.length ? (n / list.length) * 100 : 0}%` }} /></span><span className="w-4 text-right text-subtle">{n}</span></div>
        })}
      </div>
      <div>
        <form onSubmit={submit} noValidate className="mb-6 rounded-lg border border-border p-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold"><PenLine size={16} />Write a review</h3>
          <div className="mb-2 flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((s) => (
              <button type="button" key={s} role="radio" aria-checked={rating === s} aria-label={`${s} star`} onClick={() => setRating(s)} className={`text-2xl leading-none ${s <= rating ? 'text-accent' : 'text-border-strong'}`}>★</button>
            ))}
          </div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)" className="input mb-2" />
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="What did you like or dislike?" className={`input ${err && text.trim().length < 10 ? 'input-error' : ''}`} />
          {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
          <button className="btn-accent mt-3">Submit review</button>
        </form>
        {list.length ? (
          <ul className="divide-y divide-border">
            {list.map((r) => (
              <li key={r.id} className="py-4">
                <div className="flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-sm font-semibold">{r.name[0]}</span><span className="font-medium">{r.name}</span><span className="ml-auto text-xs text-subtle">{r.date}</span></div>
                <div className="mt-1"><Stars value={r.rating} size={13} /></div>
                <p className="mt-1 text-sm text-muted">{r.text}</p>
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">No reviews yet. Be the first to share your thoughts.</p>}
      </div>
    </div>
  )
}
