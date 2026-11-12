// Generates the demo catalog in src/data/*.json.
// All titles, people, publishers and brands are fictional demo content (see docs/REFERENCE_WEBSITE_AUDIT.md §11).
// Run: node scripts/generate-data.mjs
import { writeFileSync } from 'node:fs'

let seed = 20261112
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296)
const pick = (a) => a[Math.floor(rnd() * a.length)]
const int = (a, b) => a + Math.floor(rnd() * (b - a + 1))
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// ---------- categories (names + slugs mirror the reference navigation) ----------
const C = (slug, name, parent, type, icon, hue) => ({ slug, name, parent, type, icon, hue })
const categories = [
  C('boi-books', 'বই/Books', null, 'book', 'BookOpen', 28),
  C('bcs-special', 'BCS Special', 'boi-books', 'book', 'BookOpen', 200),
  C('admission-books', 'এডমিশন বই', 'boi-books', 'book', 'BookOpen', 160),
  C('bcs-chakri', 'বিসিএস/চাকরি', 'boi-books', 'book', 'BookOpen', 140),
  C('medical', 'মেডিকেল/Medical', 'boi-books', 'book', 'BookOpen', 0),
  C('ssc-hsc', 'SSC/দাখিল/কারিগরি', 'boi-books', 'book', 'BookOpen', 220),
  C('academic', 'একাডেমিক', 'boi-books', 'book', 'BookOpen', 260),
  C('golpo-kobita-uponnash', 'গল্প/কবিতা/উপন্যাস', 'boi-books', 'book', 'BookOpen', 320),
  C('islamic-boi', 'ইসলামিক বই', 'boi-books', 'book', 'BookOpen', 120),
  C('english-learning', 'English Learning', 'boi-books', 'book', 'BookOpen', 40),
  C('stationary-1', 'স্টেশনারি/Stationary', null, 'general', 'PencilLine', 45),
  C('pencil', 'Pencil', 'stationary-1', 'general', 'Pencil', 45),
  C('pen-1', 'Pen', 'stationary-1', 'general', 'PenTool', 210),
  C('painting-drawing-art-supplies', 'Painting, Drawing & Art Supplies', 'stationary-1', 'general', 'Palette', 300),
  C('calculator', 'Calculator', 'stationary-1', 'general', 'Calculator', 180),
  C('paper-files', 'Paper & Files', 'stationary-1', 'general', 'FileText', 30),
  C('gadget', 'গ্যাজেট/Gadget', null, 'general', 'Smartphone', 230),
  C('smartwatch', 'Smartwatch', 'gadget', 'general', 'Watch', 230),
  C('earbuds', 'Earbuds', 'gadget', 'general', 'Bluetooth', 250),
  C('earphone', 'Earphone', 'gadget', 'general', 'Cable', 240),
  C('headphone', 'Headphone', 'gadget', 'general', 'Headphones', 260),
  C('power-bank', 'Power Bank', 'gadget', 'general', 'BatteryCharging', 150),
  C('sunnah-store', 'সুন্নাহ স্টোর/Sunnah Store', null, 'general', 'Moon', 140),
  C('jaynamaz', 'Jaynamaz', 'sunnah-store', 'general', 'MoonStar', 20),
  C('miswak', 'Miswak', 'sunnah-store', 'general', 'Leaf', 100),
  C('life-style', 'লাইফ স্টাইল/Life Style', null, 'general', 'ShoppingBag', 340),
  C('bags', 'Bags', 'life-style', 'general', 'Briefcase', 25),
  C('belt', 'Belt', 'life-style', 'general', 'RectangleEllipsis', 15),
  C('t-shirt', 'টি-শার্ট / T-shirt', 'life-style', 'general', 'Shirt', 210),
  C('attar', 'Attar', 'life-style', 'general', 'Droplet', 45),
  C('super-shop', 'সুপার শপ/Super Shop', null, 'general', 'ShoppingBasket', 90),
  C('coffee-snacks', 'Coffee & Snacks', 'super-shop', 'general', 'Coffee', 25),
  C('cutter-tools', 'Cutter & Tools', 'super-shop', 'general', 'Scissors', 50),
  C('home-decorations', 'Home Decorations', null, 'general', 'Lamp', 35),
  C('electronics', 'ইলেক্ট্রনিক্স/Electronics', null, 'general', 'Cpu', 200),
  C('keyboard', 'Keyboard', 'electronics', 'general', 'Keyboard', 270),
  C('mouse', 'Mouse', 'electronics', 'general', 'Mouse', 190),
]

// ---------- people & companies (fictional) ----------
const authorNames = [
  ['Rafiqul Hasan', 'রফিকুল হাসান'], ['Nusrat Jahan Mitu', 'নুসরাত জাহান মিতু'], ['Tanvir Ahmed', 'তানভীর আহমেদ'],
  ['Farhana Akter', 'ফারহানা আক্তার'], ['Mahbub Alam', 'মাহবুব আলম'], ['Sabrina Karim', 'সাবরিনা করিম'],
  ['Arif Hossain', 'আরিফ হোসেন'], ['Shirin Sultana', 'শিরিন সুলতানা'], ['Kamrul Islam', 'কামরুল ইসলাম'],
  ['Dr. Jahid Hasan', 'ডা. জাহিদ হাসান'], ['Mehedi Rahman', 'মেহেদী রহমান'], ['Ayesha Siddika', 'আয়েশা সিদ্দিকা'],
  ['Sajjad Hossain', 'সাজ্জাদ হোসেন'], ['Tahmina Begum', 'তাহমিনা বেগম'], ['Imran Kabir', 'ইমরান কবির'],
  ['Nazmul Huda', 'নাজমুল হুদা'], ['Rumana Ferdous', 'রুমানা ফেরদৌস'], ['Shafiq Uddin', 'শফিক উদ্দিন'],
  ['Mostafa Kamal', 'মোস্তফা কামাল'], ['Lubna Yasmin', 'লুবনা ইয়াসমিন'], ['Habibur Rahman', 'হাবিবুর রহমান'],
  ['Selina Parvin', 'সেলিনা পারভীন'], ['Anisur Rahman', 'আনিসুর রহমান'], ['Joynal Abedin', 'জয়নাল আবেদীন'],
  ['Editorial Board', 'সম্পাদনা পর্ষদ'], ['Moinul Ahsan', 'মঈনুল আহসান'], ['Priya Saha', 'প্রিয়া সাহা'],
  ['Ziaul Hoque', 'জিয়াউল হক'], ['Nadia Islam', 'নাদিয়া ইসলাম'], ['Abdullah Al Noman', 'আবদুল্লাহ আল নোমান'],
]
const bios = [
  'Educator and author of exam preparation guides used by students across Bangladesh.',
  'Writes fiction and essays about everyday life in Dhaka and the river towns of the south.',
  'Former university lecturer focusing on clear, practice-led study material.',
  'Poet and translator whose work explores memory, language and home.',
  'Physician and medical educator who simplifies complex topics for entrance candidates.',
  'Career mentor known for structured question banks and model tests.',
]
const authors = authorNames.map(([name, nameBn], i) => ({
  slug: slugify(name), name, nameBn, bio: bios[i % bios.length], hue: (i * 37) % 360,
  initials: name.replace('Dr. ', '').split(' ').map((w) => w[0]).slice(0, 2).join(''),
}))

const publisherNames = [
  ['Alokbortika Prokashoni', 'আলোকবর্তিকা প্রকাশনী'], ['Shikkha Path Publications', 'শিক্ষা পথ পাবলিকেশন্স'],
  ['Nodi Prokash', 'নদী প্রকাশ'], ['Medi Prep Press', 'মেডি প্রেপ প্রেস'], ['Career Ladder Publications', 'ক্যারিয়ার ল্যাডার'],
  ['Kagoj Kolom', 'কাগজ কলম'], ['Shobuj Pata', 'সবুজ পাতা'], ['Lighthouse Academic', 'লাইটহাউস একাডেমিক'],
  ['Nur Library', 'নূর লাইব্রেরি'], ['Ekushey Prokashon', 'একুশে প্রকাশন'], ['Pathshala Press', 'পাঠশালা প্রেস'],
  ['Bornomala Books', 'বর্ণমালা বুকস'],
]
const companyBlurb = (n) => `${n} publishes study guides, literature and reference titles for readers across Bangladesh.`
const publishers = publisherNames.map(([name, nameBn], i) => ({
  slug: slugify(name), name, nameBn, bio: companyBlurb(name), hue: (i * 53 + 10) % 360,
  initials: name.split(' ').map((w) => w[0]).slice(0, 2).join(''),
}))

const brandNames = ['Nibha', 'Kolomdani', 'Ronger Haat', 'SoundLeaf', 'Pixon', 'Voltkin', 'Tasbeeh', 'Chamra Craft', 'Bagan Foods', 'Gharowa', 'Keynest', 'Orbit Gear']
const brands = brandNames.map((name, i) => ({
  slug: slugify(name), name, bio: `${name} — everyday products curated for the Mamun Book store.`,
  hue: (i * 41 + 200) % 360, initials: name.split(' ').map((w) => w[0]).slice(0, 2).join(''),
}))

// ---------- product title pools (fictional) ----------
const bookTitles = {
  'bcs-special': ['বিসিএস প্রিলিমিনারি গাইড', 'BCS Written Masterplan', 'বিসিএস সাধারণ জ্ঞান সমগ্র', 'BCS Math Shortcuts', 'বিসিএস বাংলা প্রস্তুতি', 'BCS Model Test Bank', 'বিসিএস ভাইভা কৌশল', 'BCS Mental Ability Workbook'],
  'admission-books': ['ভর্তি সহায়িকা: বিজ্ঞান ইউনিট', 'University Admission Guide: Arts', 'মেডিকেল ভর্তি প্রশ্ন ব্যাংক', 'Engineering Admission Physics', 'ভর্তি সহায়িকা: ব্যবসায় শিক্ষা', 'GST Admission Question Bank', 'কৃষি গুচ্ছ ভর্তি গাইড', 'Admission English Grammar'],
  'bcs-chakri': ['ব্যাংক জব সলিউশন', 'Primary Teacher Recruitment Guide', 'নবম–দশম গ্রেড জব প্রস্তুতি', 'NTRCA Shikkhok Nibondhon Guide', 'চাকরির বাংলা ব্যাকরণ', 'Job Math Made Easy', 'সরকারি চাকরির সাধারণ জ্ঞান', 'Bank Written Analytical'],
  medical: ['Basic Human Anatomy Notes', 'মেডিকেল ফিজিওলজি সহায়িকা', 'Pharmacology at a Glance', 'Clinical Medicine Pocket Guide', 'মেডিকেল বায়োকেমিস্ট্রি', 'Pathology Review Workbook'],
  'ssc-hsc': ['এসএসসি টেস্ট পেপার', 'HSC Physics 1st Paper Guide', 'এসএসসি গণিত সমাধান', 'HSC English Grammar Practice', 'দাখিল সাজেশন', 'HSC ICT Made Simple'],
  academic: ['উচ্চতর গণিত পরিচিতি', 'Introduction to Economics', 'বাংলাদেশের ইতিহাস ও সংস্কৃতি', 'Principles of Accounting', 'সমাজবিজ্ঞানের মূলকথা', 'Business Communication Basics'],
  'golpo-kobita-uponnash': ['নদীর ওপারে আলো', 'শহরের শেষ বিকেল', 'মেঘলা দিনের চিঠি', 'The Lantern Seller', 'জোনাকির গান', 'বৃষ্টিভেজা পথ', 'A House by the River', 'নীল খামের কবিতা', 'ভোরের ট্রেন', 'Salt and Monsoon'],
  'islamic-boi': ['সহজ নামাজ শিক্ষা', 'Daily Duas Collection', 'নবীজির জীবনকথা', 'রমজানের প্রস্তুতি', 'Stories of the Prophets for Kids', 'হাদিসের আলো'],
  'english-learning': ['Everyday English Idioms', 'Spoken English in 30 Days', 'Vocabulary Builder 3000', 'English Grammar Workbook', 'Writing Clear Paragraphs', 'Phrasal Verbs in Context'],
}
const generalTitles = {
  pencil: ['HB Graphite Pencil 12 pcs', '2B Drawing Pencil Set', 'Mechanical Pencil 0.5mm', 'Colour Pencil 24 Shades'],
  'pen-1': ['Gel Pen Blue 10 pcs', 'Ball Pen Black Box', 'Fountain Pen Classic', 'Whiteboard Marker Set'],
  'painting-drawing-art-supplies': ['Watercolour Cake Set 18', 'Acrylic Paint 12 Tubes', 'Sketch Book A4 120gsm', 'Mini Wooden Easel', 'Brush Set 10 pcs'],
  calculator: ['Scientific Calculator 991', 'Desktop Calculator 12 Digit', 'Pocket Calculator'],
  'paper-files': ['Brown Envelope Pack 50', 'Clear Document Bag', 'Spiral Notebook 200 Pages', 'MDF Clip Board A4'],
  smartwatch: ['Fit Pro Smart Watch 1.9"', 'Smart Band Lite', 'Sport Smart Watch AMOLED'],
  earbuds: ['TWS Earbuds Pro ANC', 'Mini Wireless Earbuds', 'Gaming Earbuds Low Latency'],
  earphone: ['Wired Earphone with Mic', 'Type-C Earphone Bass', 'In-Ear Earphone Classic'],
  headphone: ['Over-Ear Wireless Headphone', 'RGB Gaming Headset', 'Foldable Bluetooth Headphone', 'Studio Monitor Headphone'],
  'power-bank': ['20000mAh Fast Charge Power Bank', '10000mAh Slim Power Bank', '30000mAh Multi-Port Power Bank'],
  jaynamaz: ['Soft Velvet Jaynamaz', 'Travel Jaynamaz Foldable', 'Kids Jaynamaz'],
  miswak: ['Natural Miswak 2 pcs', 'Miswak with Case'],
  bags: ['Leather Travel Duffel', 'Canvas School Backpack', 'Laptop Office Bag', 'Portfolio Art Folder A3'],
  belt: ['Classic Leather Belt Brown', 'Reversible Formal Belt', 'Casual Canvas Belt'],
  't-shirt': ['Cotton Crew T-shirt Navy', 'Printed Book Lover Tee', 'Polo T-shirt White'],
  attar: ['Oud Attar 6ml', 'Rose Attar 3ml', 'Musk Attar 6ml'],
  'coffee-snacks': ['Instant Coffee Mix 20g x 10', 'Cappuccino Sachet Pack', 'Roasted Peanuts 250g', 'Honey 500g'],
  'cutter-tools': ['Utility Cutter Knife', 'Cutter Blades 18mm 10 pcs', 'Steel Scissors 8"'],
  'home-decorations': ['Retro TV Tissue Box', 'Slanted Storage Box', 'LED Lantern Candle Light', 'Frog Tissue Box', 'Desk Organizer Wood', 'Ceramic Flower Vase'],
  keyboard: ['Mechanical Keyboard 75%', 'Wireless Keyboard Slim', 'RGB Gaming Keyboard'],
  mouse: ['Wireless Mouse Silent', 'Lightweight Gaming Mouse', 'Ergonomic Vertical Mouse'],
}

const bookBlurbs = [
  'Organised chapter by chapter with worked examples, quick revision notes and practice questions after every unit.',
  'Written in simple language so that readers can follow the ideas without a tutor, with summaries at the end of each section.',
  'Includes recent-year question analysis and model tests that mirror the real exam format.',
  'A carefully edited edition with improved layout, clearer diagrams and an index for quick lookup.',
]
const storyBlurbs = [
  'A quiet, moving story about family, distance and the small decisions that shape a life.',
  'Told across one monsoon season, the book follows three friends as their town begins to change.',
  'Short pieces that move between city streets and village evenings, full of humour and tenderness.',
]
const generalBlurbs = [
  'Built for daily use with durable materials and a clean, practical design.',
  'A reliable everyday pick — compact, easy to carry and simple to maintain.',
  'Good value for students and offices alike, tested for consistent quality.',
]
const reviewers = ['Sakib', 'Mim', 'Rakib', 'Tania', 'Jubayer', 'Nabila', 'Fahim', 'Sumaiya', 'Hasib', 'Orin']
const reviewTexts = ['Exactly as described, delivery was quick.', 'Good print quality and paper.', 'Very helpful for my preparation.', 'Packaging was neat. Recommended.', 'Price is fair for the quality.', 'Would buy again from Mamun Book.']

const products = []
let n = 0
const mk = (cat, title, type) => {
  n++
  const c = categories.find((x) => x.slug === cat)
  const isBook = type === 'book'
  const base = isBook ? int(8, 70) * 10 : pick([int(4, 30) * 10, int(30, 250) * 10, int(250, 1200) * 10])
  const hasDisc = rnd() < (isBook ? 0.85 : 0.5)
  const originalPrice = hasDisc ? Math.round(base / (1 - int(5, 50) / 100) / 10) * 10 : undefined
  const stock = rnd() < 0.1 ? 0 : int(2, 80)
  const auth = isBook ? [pick(authors).slug, ...(rnd() < 0.3 ? [pick(authors).slug] : [])] : []
  const reviewCount = int(0, 4)
  const reviews = Array.from({ length: reviewCount }, (_, i) => ({
    id: `r${n}-${i}`, name: pick(reviewers), rating: int(3, 5),
    date: `2026-${String(int(1, 10)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`, text: pick(reviewTexts),
  }))
  const latin = /[a-z]/i.test(title)
  const slugBase = latin ? slugify(title) : `book-${n}`
  const p = {
    id: `p${n}`,
    slug: `${slugBase}-${n}`,
    title,
    type,
    category: cat,
    authors: [...new Set(auth)],
    ...(isBook ? { publisher: pick(publishers).slug } : { brand: pick(brands).slug }),
    price: base,
    ...(originalPrice && originalPrice > base ? { originalPrice } : {}),
    stock,
    sku: `MB${String(100000 + n * 7919).slice(-6)}`,
    ...(isBook
      ? {
          isbn: `978-984-${int(10, 99)}-${int(1000, 9999)}-${int(0, 9)}`,
          language: /[a-z]/i.test(title) ? pick(['English', 'Bengali, English']) : 'Bengali',
          pages: int(96, 720),
          coverType: pick(['Paperback', 'Hardcover']),
          size: pick(['8.5x11', '5.5x8.5', '7x10']),
          weight: int(150, 1200),
          edition: `${pick(['1st', '2nd', '3rd', '5th'])} edition, ${int(2023, 2026)}`,
        }
      : { grade: pick(['A', 'A+', 'Standard']), origin: pick(['Bangladesh', 'China', 'International']), weight: int(20, 900) }),
    description: isBook
      ? cat === 'golpo-kobita-uponnash' ? [pick(storyBlurbs), pick(bookBlurbs.slice(3))] : [pick(bookBlurbs), pick(bookBlurbs)]
      : [pick(generalBlurbs), `Category: ${c.name}. Demo listing for the Mamun Book frontend.`],
    highlights: isBook
      ? ['Updated syllabus coverage', 'Practice questions with answers', 'Clear print on quality paper']
      : ['Quality checked before dispatch', '7-day replacement on defects', 'Cash on delivery available'],
    images: isBook ? int(2, 5) : int(1, 3),
    hue: (c.hue + int(-25, 25) + 360) % 360,
    featured: rnd() < 0.25,
    soldCount: int(0, 900),
    createdAt: `2026-${String(int(1, 11)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`,
    rating: reviews.length ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : 0,
    reviews,
  }
  products.push(p)
}
for (const [cat, list] of Object.entries(bookTitles)) for (const t of list) mk(cat, t, 'book')
for (const [cat, list] of Object.entries(generalTitles)) for (const t of list) mk(cat, t, 'general')

// ---------- banners & home config ----------
const banners = {
  hero: [
    { id: 'h1', title: 'ভর্তি প্রস্তুতির সব বই', subtitle: 'এক জায়গায়, সেরা দামে', badge: 'Up to 40% off', cta: 'Shop admission books', to: '/products?category=admission-books', from: '#0f3d56', to2: '#1b6f8a', accent: '#ffd814', art: 'books' },
    { id: 'h2', title: 'চাকরির প্রস্তুতি শুরু হোক আজই', subtitle: 'BCS, ব্যাংক ও শিক্ষক নিবন্ধনের বই', badge: 'New editions', cta: 'Browse job prep', to: '/products?category=bcs-chakri', from: '#5b1a1a', to2: '#a23b1f', accent: '#ffb84d', art: 'books' },
    { id: 'h3', title: 'Back to class essentials', subtitle: 'Pens, sketchbooks, calculators and more', badge: 'Stationery week', cta: 'Shop stationery', to: '/products?category=stationary-1', from: '#2d2a6e', to2: '#5b4fc4', accent: '#ffd814', art: 'stationery' },
    { id: 'h4', title: 'গল্প, কবিতা, উপন্যাস', subtitle: 'নতুন লেখকদের নতুন বই', badge: 'Fresh arrivals', cta: 'Explore fiction', to: '/products?category=golpo-kobita-uponnash', from: '#1f4d2e', to2: '#3f8a52', accent: '#ffe08a', art: 'books' },
  ],
  side: { title: 'Fit Pro Smart Watch', subtitle: '1.9" display · 7-day battery', cta: 'Shop now', to: '/products?category=smartwatch', from: '#0e3b3a', to2: '#14706b' },
  promos: [
    { id: 'pr1', title: 'Power that lasts', subtitle: '30000mAh multi-port power banks', cta: 'New arrival', to: '/products?category=power-bank', from: '#0b2447', to2: '#19376d', icon: 'BatteryCharging' },
    { id: 'pr2', title: 'স্টেশনারি পণ্যে আকর্ষণীয় ছাড়', subtitle: 'Pens, paints and paper', cta: 'Shop now', to: '/products?category=stationary-1', from: '#00796b', to2: '#26a69a', icon: 'Palette' },
    { id: 'pr3', title: 'BCS BOOK', subtitle: 'Save up to 50%', cta: 'Order now', to: '/products?category=bcs-special', from: '#8e1b1b', to2: '#d32f2f', icon: 'BookOpen' },
  ],
}
const announcements = ['New arrivals every week - explore the latest titles', 'Limited-time offers on bestsellers', 'Cash on delivery available', 'Free delivery inside Dhaka on orders over ৳1,500']
const navigation = {
  main: [
    { label: 'এডমিশন বই', to: '/products?category=admission-books' },
    { label: 'বিসিএস/চাকরি', to: '/products?category=bcs-chakri' },
    { label: 'মেডিকেল/Medical', to: '/products?category=medical' },
    { label: 'একাডেমিক', to: '/products?category=academic' },
    { label: 'গল্প/কবিতা/উপন্যাস', to: '/products?category=golpo-kobita-uponnash' },
    { label: 'ইসলামিক বই', to: '/products?category=islamic-boi' },
  ],
  announcements,
}
const homepage = {
  categoryBoxes: [
    { category: 'boi-books', items: ['bcs-special', 'admission-books', 'bcs-chakri', 'medical'] },
    { category: 'stationary-1', items: ['pencil', 'painting-drawing-art-supplies', 'calculator', 'pen-1'] },
    { category: 'gadget', items: ['smartwatch', 'earbuds', 'earphone', 'headphone'] },
    { category: 'life-style', items: ['bags', 'belt', 't-shirt', 'attar'] },
  ],
  categoryRails: ['bcs-chakri', 'admission-books'],
  rootSections: ['boi-books', 'stationary-1', 'gadget', 'sunnah-store', 'life-style', 'super-shop', 'home-decorations', 'electronics'],
}

const out = (f, d) => writeFileSync(new URL(`../src/data/${f}`, import.meta.url), JSON.stringify(d, null, 1))
out('categories.json', categories)
out('authors.json', authors)
out('publishers.json', publishers)
out('brands.json', brands)
out('products.json', products)
out('banners.json', banners)
out('navigation.json', navigation)
out('homepage-sections.json', homepage)
console.log(`products ${products.length}, categories ${categories.length}, authors ${authors.length}`)
