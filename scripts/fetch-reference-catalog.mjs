// Pulls real product data + images from the public pages of mamunbooks.com into src/data and public/images.
// Run it yourself (it is not run by the AI assistant):
//   node scripts/fetch-reference-catalog.mjs            # 8 products per category
//   node scripts/fetch-reference-catalog.mjs --per 4    # fewer
//   node scripts/fetch-reference-catalog.mjs --extras   # keep products; only category tiles, authors/brands, logos (~6 min)
//   node scripts/fetch-reference-catalog.mjs --dry      # fetch one category + one product, print what was parsed
//   node scripts/fetch-reference-catalog.mjs --selftest # offline parser check
// Only public HTML pages are requested (never /api/), one request per second.
// You are responsible for having permission to use the downloaded content.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import assert from 'node:assert/strict'

const ORIGIN = 'https://mamunbooks.com'
const arg = (name, dflt) => { const i = process.argv.indexOf(`--${name}`); return i < 0 ? dflt : process.argv[i + 1] ?? true }
const PER = Number(arg('per', 8))
const DRY = process.argv.includes('--dry')
const dataUrl = (f) => new URL(`../src/data/${f}`, import.meta.url)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x' + [...s].reduce((h, c) => (h * 31 + c.codePointAt(0)) % 1e6, 7)

// ---------- parsers (pure; covered by --selftest) ----------
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
const meta = (html, key) => {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]*content=["']([^"']*)["']`, 'i'))
    ?? html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${key}["']`, 'i'))
  return m ? decode(m[1]).trim() : undefined
}
/** Product slugs linked from a listing page, in page order, de-duplicated. */
export function productSlugs(html) {
  const out = []
  for (const m of html.matchAll(/href="\/(?:en|bn)\/products\/([^"?#]+)/g)) {
    const s = decodeURIComponent(m[1])
    if (!out.includes(s)) out.push(s)
  }
  return out
}
/** First schema.org Product object found in JSON-LD blocks (handles @graph and arrays). */
export function jsonLdProduct(html) {
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const flat = [JSON.parse(m[1])].flat().flatMap((x) => x?.['@graph'] ?? x)
      const p = flat.find((x) => [x?.['@type']].flat().some((t) => t === 'Product' || t === 'Book'))
      if (p) return p
    } catch { /* malformed block: try the next one */ }
  }
}
const nameOf = (x) => (typeof x === 'string' ? x : x?.name)
const num = (s) => Number(String(s ?? '').replace(/[^\d.]/g, '')) || 0
/** Unwraps Next.js image-optimizer URLs and makes relative URLs absolute. */
export function imageUrl(src) {
  if (!src) return
  const u = new URL(decode(src), ORIGIN)
  return u.pathname === '/_next/image' && u.searchParams.get('url') ? new URL(u.searchParams.get('url'), ORIGIN).href : u.href
}
/** Author names from the "Author:" links between the title and the price (later author links belong to related products). */
export function pageAuthors(html) {
  const start = html.indexOf('<h1')
  const end = html.indexOf('৳', start)
  const zone = html.slice(Math.max(start, 0), end > start ? end : start + 8000)
  const names = [...zone.matchAll(/href="\/(?:en|bn)\/authors\/[^"]+"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => decode(m[1].replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim())
  return [...new Set(names.filter(Boolean))]
}
/** "বাংলা নাম , English Name" → { nameBn, name }; single-script names stay as name. */
export function splitName(raw) {
  const parts = raw.split(/\s*,\s*/).filter(Boolean)
  const latin = parts.find((x) => /^[\x20-\x7e]+$/.test(x))
  const other = parts.find((x) => x !== latin)
  return parts.length === 2 && latin && other ? { name: latin, nameBn: other } : { name: raw.trim() }
}
const text = (inner) => decode(inner.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()
/** Best image URL of an <img> tag: src, else first srcset entry; inline data: placeholders are ignored. */
export function imgSrc(tag) {
  const attr = (n) => tag.match(new RegExp(`\\s${n}="([^"]*)"`, 'i'))?.[1]
  const cand = [attr('src'), attr('srcset')?.split(',')[0].trim().split(/\s+/)[0], attr('data-src')].find((u) => u && !u.startsWith('data:'))
  return imageUrl(cand)
}
/** Link tiles: every <a> whose href matches hrefRe (group 1 = slug) → { slug, text, img }. */
export function tiles(html, hrefRe) {
  const out = []
  for (const m of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)) {
    const slug = m[1].match(hrefRe)?.[1]
    if (slug) out.push({ slug: decodeURIComponent(decode(slug)), text: text(m[2]), img: imgSrc(m[2].match(/<img\b[^>]*>/)?.[0] ?? '') })
  }
  return out
}
/** Listing cards: the author/brand links that follow a product's links belong to that product. → Map(productSlug → [{kind, slug, name}]) */
export function cardPeople(html) {
  const map = new Map()
  let cur
  for (const t of tiles(html, /href="\/(?:en|bn)\/((?:products|authors|brands)\/[^"?#]+)/)) {
    const [kind, ...rest] = t.slug.split('/')
    const slug = rest.join('/')
    if (kind === 'products') { cur = slug; if (!map.has(cur)) map.set(cur, []) }
    else if (cur && t.text && t.text !== 'N/A' && !map.get(cur).some((x) => x.slug === slug)) map.get(cur).push({ kind, slug, name: t.text })
  }
  return map
}
/** Logo/photo on an entity page: the <img> whose alt carries the entity's name, else og:image. */
export function entityImage(html, names) {
  const tag = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]).find((t) => {
    const alt = decode(t.match(/\salt="([^"]*)"/)?.[1] ?? '').toLowerCase()
    return alt && names.some((n) => n && alt.includes(n.toLowerCase()))
  })
  return (tag && imgSrc(tag)) || imageUrl(meta(html, 'og:image'))
}
export function parseProduct(html) {
  const ld = jsonLdProduct(html) ?? {}
  const offer = [ld.offers].flat()[0] ?? {}
  // heuristic: page prices in reading order; the selling price is usually first, the struck price right after
  const taka = [...html.matchAll(/৳\s*([\d,]+)/g)].map((m) => num(m[1])).filter(Boolean)
  const price = num(offer.price ?? offer.lowPrice) || num(meta(html, 'product:price:amount')) || taka[0] || 0
  const struck = taka.slice(0, 4).find((n) => n > price)
  const title = (nameOf(ld) ?? meta(html, 'og:title') ?? html.match(/<h1[^>]*>([^<]+)</)?.[1] ?? '').replace(/\s*[|–-]\s*Mamun ?Books?.*$/i, '').trim()
  return {
    title: decode(title),
    image: imageUrl([ld.image].flat().map((i) => (typeof i === 'string' ? i : i?.url))[0] ?? meta(html, 'og:image')),
    description: decode(String(ld.description ?? meta(html, 'og:description') ?? meta(html, 'description') ?? '')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    price,
    originalPrice: struck && struck <= price * 5 ? struck : undefined,
    inStock: offer.availability ? /InStock/i.test(offer.availability) : !/out of stock/i.test(html.slice(0, html.indexOf('</h1>') + 6000)),
    sku: ld.sku ? String(ld.sku) : undefined,
    isbn: ld.isbn ? String(ld.isbn) : undefined,
    authors: [ld.author].flat().map(nameOf).filter(Boolean).length ? [ld.author].flat().map(nameOf).filter(Boolean) : pageAuthors(html),
    publisher: nameOf(ld.publisher),
    brand: nameOf(ld.brand),
  }
}

if (process.argv.includes('--selftest')) {
  const html = `<meta property="og:title" content="Aspect Grammar | Mamun Book"><meta content="/_next/image?url=%2Fuploads%2Fa.jpg&amp;w=640" property="og:image">
    <script type="application/ld+json">{"@graph":[{"@type":"Product","name":"Aspect Grammar","sku":"R1","author":[{"name":"A B"}],"publisher":{"name":"Net"},"offers":{"price":"410","availability":"https://schema.org/InStock"}}]}</script>
    <h1>Aspect Grammar</h1><a href="/en/products/aspect-grammar">x</a><a href="/en/products/aspect-grammar">y</a><a href="/en/products/%E0%A6%85?x=1">z</a> ৳410 ৳612`
  assert.deepEqual(productSlugs(html), ['aspect-grammar', 'অ'])
  const p = parseProduct(html)
  assert.deepEqual([p.title, p.price, p.originalPrice, p.inStock, p.sku, p.authors, p.publisher], ['Aspect Grammar', 410, 612, true, 'R1', ['A B'], 'Net'])
  assert.equal(p.image, `${ORIGIN}/uploads/a.jpg`)
  const bare = parseProduct('<meta property="og:title" content="Pen"><h1>Pen</h1> ৳ 1,200 Out of Stock')
  assert.deepEqual([bare.title, bare.price, bare.originalPrice, bare.inStock, bare.image], ['Pen', 1200, undefined, false, undefined])
  const pdp = '<h1>T</h1><a class="x" href="/en/authors/a-b">আ ব <!-- -->, <span>A B</span></a><a href="/en/authors/a-b">আ ব , A B</a> ৳10 <a href="/en/authors/other">Other</a>'
  assert.deepEqual(parseProduct(pdp).authors, ['আ ব , A B'])
  assert.deepEqual(splitName('ভিউ পাবলিকেশন্স, View publications'), { name: 'View publications', nameBn: 'ভিউ পাবলিকেশন্স' })
  assert.deepEqual(splitName('Petra Mira'), { name: 'Petra Mira' })
  const list = '<a href="/en/products/x"><img src="/_next/image?url=%2Fu%2Fx.webp&amp;w=3"></a><a href="/en/products/x">X</a> by <a href="/en/authors/a-1">আ <!-- -->, A</a> , <a href="/en/authors/b-2">B</a><a href="/en/products/y">Y</a>by <a href="/en/brands/n-a">N/A</a><a href="/en/products/z?v=1">Z</a><a class="l" href="/en/brands/faymas">Faymas</a>'
  assert.deepEqual([...cardPeople(list)], [['x', [{ kind: 'authors', slug: 'a-1', name: 'আ , A' }, { kind: 'authors', slug: 'b-2', name: 'B' }]], ['y', []], ['z', [{ kind: 'brands', slug: 'faymas', name: 'Faymas' }]]])
  const home = '<a href="https://mamunbooks.com/en/products?category=bcs"><img alt="Banner" src="/b.jpg"></a><a class="g" href="/en/products?category=pencil"><img alt="" src="data:image/gif;base64,AA" srcset="/_next/image?url=https%3A%2F%2Fcdn.x%2Fp.webp&amp;w=128 1x, /big 2x"><span>Pencil</span></a>'
  assert.deepEqual(tiles(home, /href="[^"]*[?&](?:amp;)?category=([^"&]+)/), [{ slug: 'bcs', text: '', img: `${ORIGIN}/b.jpg` }, { slug: 'pencil', text: 'Pencil', img: 'https://cdn.x/p.webp' }])
  assert.equal(entityImage('<meta property="og:image" content="/site.png"><img alt="Book 1" src="/b1.jpg"><img src="/logo.png" alt="থিম, Thieme">', ['Thieme']), `${ORIGIN}/logo.png`)
  assert.equal(entityImage('<meta property="og:image" content="/site.png"><img alt="Book 1" src="/b1.jpg">', ['Thieme']), `${ORIGIN}/site.png`)
  console.log('selftest passed')
  process.exit(0)
}

// ---------- network ----------
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
let last = 0
async function get(url) {
  await sleep(Math.max(0, 1000 - (Date.now() - last))) // 1 request per second
  last = Date.now()
  const res = await fetch(url, { headers: { 'user-agent': UA, 'accept-language': 'en' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res
}
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif' }

const categories = JSON.parse(readFileSync(dataUrl('categories.json'), 'utf8'))
// leaves, plus roots that have no children (e.g. home-decorations)
const leaves = categories.filter((c) => !categories.some((k) => k.parent === c.slug))
const imgDir = new URL('../public/images/products/', import.meta.url)
mkdirSync(imgDir, { recursive: true })

const people = { authors: new Map(), publishers: new Map(), brands: new Map() }
const person = (kind, raw) => {
  const { name, nameBn } = splitName(raw)
  const slug = slugify(name)
  if (!people[kind].has(slug)) {
    const hue = [...name].reduce((h, c) => (h * 31 + c.codePointAt(0)) % 360, 0)
    people[kind].set(slug, { slug, name, ...(nameBn ? { nameBn } : {}), bio: '', hue, initials: name.split(/\s+/).map((w) => [...w][0]).slice(0, 2).join('').toUpperCase() })
  }
  return slug
}

async function crawl() {
const products = []
const seen = new Set()
for (const cat of DRY ? leaves.slice(0, 1) : leaves) {
  let slugs = []
  try {
    slugs = productSlugs(await (await get(`${ORIGIN}/en/products?category=${cat.slug}`)).text())
  } catch (e) { console.warn(`skip category ${cat.slug}: ${e.message}`); continue }
  console.log(`${cat.slug}: ${slugs.length} product links`)
  if (DRY) console.log(slugs.slice(0, 5))
  let rank = 0
  for (const slug of slugs.filter((s) => !seen.has(s)).slice(0, DRY ? 1 : PER)) {
    seen.add(slug)
    try {
      const d = parseProduct(await (await get(`${ORIGIN}/en/products/${encodeURIComponent(slug)}`)).text())
      if (DRY) { console.log(d); continue }
      if (!d.title || !d.price) { console.warn(`  skip ${slug}: no title/price parsed`); continue }
      const n = products.length + 1
      let image
      if (d.image) {
        try {
          const res = await get(d.image)
          const ext = EXT[(res.headers.get('content-type') ?? '').split(';')[0]]
          if (ext) { writeFileSync(new URL(`p${n}.${ext}`, imgDir), Buffer.from(await res.arrayBuffer())); image = `/images/products/p${n}.${ext}` }
        } catch (e) { console.warn(`  image failed for ${slug}: ${e.message}`) }
      }
      const isBook = cat.type === 'book'
      products.push({
        id: `p${n}`, slug, title: d.title, type: cat.type, category: cat.slug,
        authors: isBook ? d.authors.map((a) => person('authors', a)) : [],
        ...(isBook && d.publisher ? { publisher: person('publishers', d.publisher) } : {}),
        ...(!isBook && d.brand ? { brand: person('brands', d.brand) } : {}),
        price: d.price, ...(d.originalPrice ? { originalPrice: d.originalPrice } : {}),
        stock: d.inStock ? 20 : 0, sku: d.sku ?? `MB${100000 + n}`, ...(d.isbn ? { isbn: d.isbn } : {}),
        description: [d.description || d.title], highlights: ['Cash on delivery available'],
        images: 1, hue: cat.hue, featured: rank < 2, soldCount: 500 - rank * 10 - n, // listing order stands in for popularity
        createdAt: new Date(Date.now() - n * 864e5).toISOString().slice(0, 10), rating: 0, reviews: [],
        ...(image ? { image } : {}),
      })
      rank++
      console.log(`  ${n}. ${d.title} — ৳${d.price}${image ? '' : ' (no image)'}`)
    } catch (e) { console.warn(`  skip ${slug}: ${e.message}`) }
  }
}

if (DRY) process.exit(0)
// never replace the working catalog with an empty or near-empty one
if (products.length < 10) {
  console.error(`Only ${products.length} products parsed — existing data left untouched. Run with --dry and check the output.`)
  process.exit(1)
}
const out = (f, d) => writeFileSync(dataUrl(f), JSON.stringify(d, null, 1))
out('products.json', products)
for (const kind of ['authors', 'publishers', 'brands']) out(`${kind}.json`, [...people[kind].values()])
console.log(`\nWrote ${products.length} products (${products.filter((p) => p.image).length} with images), ${people.authors.size} authors, ${people.publishers.size} publishers, ${people.brands.size} brands.`)
console.log('Previous demo data is recoverable with: node scripts/generate-data.mjs  (or git checkout src/data)')
}

/** Saves one image under public/images/<dir>/ and returns its public path (undefined when it is not an image). */
async function saveImage(url, dir, base) {
  const res = await get(url)
  const ext = EXT[(res.headers.get('content-type') ?? '').split(';')[0]]
  if (!ext) return
  const folder = new URL(`../public/images/${dir}/`, import.meta.url)
  mkdirSync(folder, { recursive: true })
  const file = `${base.replace(/[^a-z0-9-]+/gi, '_').slice(0, 80)}.${ext}`
  writeFileSync(new URL(file, folder), Buffer.from(await res.arrayBuffer()))
  return `/images/${dir}/${file}`
}

/**
 * Second pass over the catalog already in src/data: category tile images (home page), authors/brands per
 * product (listing cards), and logos/photos for publishers, brands and authors (their own pages).
 */
async function extras() {
  const read = (f) => JSON.parse(readFileSync(dataUrl(f), 'utf8'))
  const write = (f, d) => writeFileSync(dataUrl(f), JSON.stringify(d, null, 1))
  const products = read('products.json')
  const cats = read('categories.json')
  const mk = (slug, raw) => {
    const { name, nameBn } = splitName(raw)
    const hue = [...name].reduce((h, c) => (h * 31 + c.codePointAt(0)) % 360, 0)
    return { slug, name, ...(nameBn ? { nameBn } : {}), bio: '', hue, initials: name.split(/\s+/).map((w) => [...w][0]).slice(0, 2).join('').toUpperCase() }
  }

  // 1. category tiles on the home page (banner links have no label text, so they are skipped)
  const home = await (await get(`${ORIGIN}/en`)).text()
  let nCat = 0
  for (const t of tiles(home, /href="[^"]*[?&](?:amp;)?category=([^"&]+)/)) {
    const c = cats.find((x) => x.slug === t.slug)
    if (!c || c.image || !t.img || !t.text) continue
    try { c.image = await saveImage(t.img, 'categories', c.slug); if (c.image) nCat++ } catch (e) { console.warn(`category image ${c.slug}: ${e.message}`) }
  }
  write('categories.json', cats)
  console.log(`category images: ${nCat}`)

  // 2. authors + brands from listing cards
  const authors = new Map(), brands = new Map()
  const bySlug = new Map(products.map((p) => [p.slug, p]))
  for (const c of cats.filter((x) => !cats.some((k) => k.parent === x.slug))) {
    try {
      for (const [slug, ppl] of cardPeople(await (await get(`${ORIGIN}/en/products?category=${c.slug}`)).text())) {
        const p = bySlug.get(slug)
        if (!p) continue
        const a = ppl.filter((x) => x.kind === 'authors'), b = ppl.find((x) => x.kind === 'brands')
        a.forEach((x) => authors.set(x.slug, mk(x.slug, x.name)))
        if (p.type === 'book' && a.length) p.authors = a.map((x) => x.slug)
        if (p.type !== 'book' && b) { p.brand = b.slug; brands.set(b.slug, mk(b.slug, b.name)) }
      }
    } catch (e) { console.warn(`listing ${c.slug}: ${e.message}`) }
  }
  // brands that only came from the first pass keep their entry, except the site's literal "N/A" brand
  for (const old of read('brands.json')) if (old.name !== 'N/A' && !brands.has(old.slug)) brands.set(old.slug, old)
  for (const p of products) if (p.brand && !brands.has(p.brand)) delete p.brand
  for (const k of [...brands.keys()]) if (!products.some((p) => p.brand === k)) brands.delete(k)
  console.log(`authors: ${authors.size}, brands: ${brands.size}, books with authors: ${products.filter((p) => p.authors.length).length}`)

  // 3. logos / photos. Publisher page slugs are only linked from product pages, so one product page per publisher.
  const publishers = read('publishers.json')
  const todo = [] // { kind, siteSlug, entity }
  for (const pub of publishers) {
    const p = products.find((x) => x.publisher === pub.slug)
    if (!p) continue
    try {
      const html = await (await get(`${ORIGIN}/en/products/${encodeURIComponent(p.slug)}`)).text()
      const site = html.slice(Math.max(html.indexOf('<h1'), 0)).match(/href="\/(?:en|bn)\/publishers\/([^"?#]+)/)?.[1]
      if (site) todo.push({ kind: 'publishers', siteSlug: decodeURIComponent(site), entity: pub })
    } catch (e) { console.warn(`publisher lookup ${pub.slug}: ${e.message}`) }
  }
  for (const [slug, e] of authors) todo.push({ kind: 'authors', siteSlug: slug, entity: e })
  for (const [slug, e] of brands) todo.push({ kind: 'brands', siteSlug: slug, entity: e })
  const found = []
  for (const t of todo) {
    try {
      const html = await (await get(`${ORIGIN}/en/${t.kind}/${encodeURIComponent(t.siteSlug)}`)).text()
      const url = entityImage(html, [t.entity.name, t.entity.nameBn])
      if (url) found.push({ ...t, url })
    } catch (e) { console.warn(`${t.kind}/${t.siteSlug}: ${e.message}`) }
  }
  // an image shared by several entities is the site's default share image, not a logo
  const uses = found.reduce((m, f) => m.set(f.url, (m.get(f.url) ?? 0) + 1), new Map())
  let nImg = 0
  for (const f of found.filter((x) => uses.get(x.url) <= 2)) {
    try { f.entity.image = await saveImage(f.url, f.kind, f.entity.slug); if (f.entity.image) nImg++ } catch (e) { console.warn(`image ${f.kind}/${f.entity.slug}: ${e.message}`) }
  }
  console.log(`entity images: ${nImg} of ${todo.length} (${found.length - found.filter((x) => uses.get(x.url) <= 2).length} skipped as site default)`)

  write('products.json', products)
  write('authors.json', [...authors.values()])
  write('brands.json', [...brands.values()])
  write('publishers.json', publishers)
}

if (!process.argv.includes('--extras')) await crawl()
await extras()
