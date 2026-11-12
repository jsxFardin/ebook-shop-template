# Reference Website Audit — mamunbooks.com/en

Captured 2026-11-12 with headless Chrome (Playwright) at 1920 / 1440 / 1024 / 768 / 390 px.
Screenshots live in [`docs/reference/`](reference/).

## 1. Platform observations

- Next.js (App Router) SSR, Tailwind CSS with semantic tokens (`bg-surface`, `text-foreground`,
  `border-border`, `border-border-strong`, `text-price`, `text-link`, `text-on-accent`).
- Locale prefix in every URL: `/en/...` and `/bn/...` (`x-default` → `/`).
- Light/dark theme toggle (sun icon pill in header).
- The visual language is deliberately Amazon-like: navy bars, yellow "Add to Cart", orange accent,
  teal links, deep red prices.

## 2. URL structure (actual)

| Purpose | URL |
|---|---|
| Home | `/en` |
| Category listing | `/en/products?category=<slug>` |
| Sorting presets | `/en/products?sort_by=latest_upload \| featured \| sold_count&category_type=book\|general` |
| Search results | `/en/products?search=<q>` (header search submits here; `/en/search` is a 404) |
| Product details | `/en/products/<slug>` |
| Authors index / author | `/en/authors`, `/en/authors/<slug>` |
| Publishers index / publisher | `/en/publishers`, `/en/publishers/<slug>` |
| Brands index / brand | `/en/brands`, `/en/brands/<slug>` |
| Deals | `/en/deals` (empty-state "No Active Deals") |
| Cart | `/en/cart` |
| Checkout | `/en/checkout` (redirects to `/en/login?redirect=/checkout` when signed out) |
| Login / Register | `/en/login`, `/en/register` |
| Account / Wishlist | `/en/account`, `/en/account/wishlist` (auth-guarded) |
| Static | `/en/about`, `/en/contact`, `/en/faq`, `/en/privacy`, `/en/terms`, `/en/returns`, `/en/delete-account` |
| Portals (out of scope) | `/en/portal/publisher/login`, `/en/portal/brand/login` |

## 3. Design system

### Colour
| Token | Value | Use |
|---|---|---|
| accent / announcement | `#FF9900` | Announcement bar, Buy Now, active chips, primary orange CTA |
| accent-dark | `#C45500` | hover on orange |
| navy-1 | `#232F3E` → `#2A3A4A` gradient | Utility top bar |
| navy-2 | `#37475A` → `#3F5166` gradient | Main category nav |
| navy-3 | `#131921` | Mobile search strip, sidebar drawer head |
| footer | `#131A22` | Footer background |
| cart yellow | `#FFD814` (hover `#F7CA00`, border `#FCD200`) | Add to Cart button |
| price | `#B12704` | Selling price |
| link | `#007185` | Author/brand links, "See more" |
| sale badge | Tailwind `red-600` | `-NN%` badge |
| foreground | `#111827` (gray-900) | Body text |
| muted | `#374151`, `#4B5563`, `#596273` | Secondary text |
| border | `#E5E7EB`; strong `#D1D5DB` | Cards, inputs |
| page | `#FFFFFF`; alt section `#F9FAFB` | Alternating home sections |
| WhatsApp / Messenger | `#25D366` / `#0084FF` gradient | Floating buttons |

### Typography
- Family: **Noto Sans Bengali**, Kalpurush, Noto Sans, system-ui. One family for Bangla + Latin.
- Body 16px/400; section headings 18–20px/600–700; card title 12–14px/500 (1 line clamp);
  card author 11–12px link colour; price 18px/600 (12px mobile); strike price 12px gray;
  badge 12px/700 (9px mobile); buttons 14px/500.

### Layout
- Container: `max-width: 1400px; padding-inline: 16px` (content 1368px at ≥1400).
- Product grid: 5 columns ≥768 px (gap 16px); 3 columns on phones (compact type).
  Listing page: 4 columns beside a 256px filter sidebar.
- Radius: 4px (cards, buttons, badges); 8px (panels, category boxes); full (chips, floating btns).
- Shadows: none at rest on cards, `shadow-lg` on hover; panels flat with 1px border.

### Breakpoints (Tailwind defaults)
`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`. Desktop nav row and utility links hidden < md;
mobile shows a bottom tab bar and a second header row with the full-width search.

## 4. Global chrome

**Header (desktop, ~200px total)**
1. Announcement marquee (30px, orange): "LATEST" pill + scrolling messages.
2. Utility bar (37px, navy gradient): phone + email left; Publisher Login | Brand Login | Wholesale Login right.
3. Main bar (80px, white): logo, language switch (globe + BN), theme toggle pill, search input
   (orange focus border, square corners) with orange search button, "Deliver to", "Hello, Sign in /
   Account & Lists ▾" dropdown, wishlist heart, cart with count.
4. Category nav (53px, slate gradient): "☰ All Categories" (opens left drawer), 6 book categories,
   outlined orange "Bulk Order" chip; right side Authors · Brands · Publishers.

**All Categories drawer**: 300px left panel, navy head with close ×, category search input,
accordion of top-level categories with product counts and chevrons, then New Arrivals / Bestsellers.

**Search suggestions**: dropdown under input listing thumbnail, title, category, price + strike price; clear ×.

**Floating elements**: right-edge vertical "CART" tab (opens mini-cart), WhatsApp + Messenger round buttons bottom-right.

**Mobile (< 768)**: utility bar shows Login | Register | Wholesale; header row hamburger + logo + theme +
language + wishlist; dark strip with full-width search; fixed bottom nav: Home, Categories, raised
circular Cart, Wishlist, Account.

**Footer** (`#131A22`): 4 columns — contact (Customer Care, Wholesale, Address, Email with orange icons),
Customer Service / Policy / Get to Know Us, Shop By / Browse By, Stay Connected (newsletter input +
orange Subscribe, QR + App Store/Google Play, social icon squares, trade licence). Bottom white strip of payment logos.

## 5. Homepage sections (in order)

1. Hero slider (full-bleed, ~420px) with side promo card (smart watch) on the right, arrows + pill dots.
2. Four "category boxes" overlapping the hero bottom: Books / Stationery / Gadget / Life Style,
   each 2×2 sub-category thumbnails + "See more …" link.
3. **New Arrivals** (clock icon chip) — 10 products, 5×2 grid, "See more".
4. **Featured Products** (award icon) — 10 products.
5. Three promotional banners in a row.
6. **📚 Bestselling Books** + red "HOT" pill.
7. Tabbed strip: Browse by Publisher | Browse by Author | Top Brands — 9 logo tiles + "See All".
8. **📦 Bestselling Products** (non-book).
9. **BCS বই**, **এডমিশন বই** — category product rails (10 each).
10. Per-root-category sections (alternating white / gray-50 bg): Books, Stationery, Gadget, Sunnah
    Store, Life Style, Super Shop, Home Decorations, Electronics — each with "See all →".
11. Footer.

## 6. Product card

White, 1px gray-200 border, 4px radius, hover shadow. Square image area (object-contain), red
`-NN%` badge top-right, gray overlay + red "OUT OF STOCK" label when unavailable. Title 1-line clamp,
"by Author(bn) , Author(en)" in link colour (2 lines max), price row: red price, strike original,
heart icon on the right. Full-width yellow "🛒 Add to Cart" (disabled gray "Out of Stock").

## 7. Product listing (`/products?category=`)

- Left sidebar card "Filters / Clear all": Category tree with search + expandable children,
  Price Range radios (Under ৳1,000; ৳1,000–10,000; ৳10,000–50,000; Over ৳50,000), Product Type checkbox.
- Toolbar card: "Sort by" select (Newest Arrivals, Price ↑/↓, Bestselling, Featured…), grid/list toggle,
  "Active Filters" chips (orange tint) + Clear all.
- 4-column grid, pagination at the bottom.

## 8. Product details

- Breadcrumb (home icon / Products / Books / category / sub).
- 3-column: gallery (main image with zoom hint "Hover to zoom – click to enlarge 1/9", wishlist
  heart, thumbnail strip) · info · "You May Also Like" side list (5 items).
- Info: title (24px/700), SKU with copy button, category, Author links; "Book Details" panel with
  publisher row (logo + View Books →) and spec tiles (Language, Pages, Size, Cover Type, Weight);
  price `৳410` + strike + "Save ৳202"; "In Stock" green; delivery info box; quantity stepper;
  yellow Add to Cart + orange Buy Now.
- Tabs: Description · Authors · Specification (orange underline active).
- "Featured Books" rail, then "More from <publisher>" rail.
- Non-book variant swaps "Book Details" for "Product Details" (Brand, Grade, Origin).

## 9. Other pages

- **Authors index**: title, search input, A–Z + Bangla alphabet filter chips (orange active), promo
  card "Book Sale", "Showing 1–36 of N authors", 6-column photo tiles (book icon fallback).
- **Publisher page**: soft blue banner, logo tile + name + "Publisher" chip, in-publisher search +
  sort, product grid, pagination ("Showing 1 - 1 of 1 results").
- **Cart (empty)**: orange cart icon circle, "Your Cart is Empty", Start Shopping / Browse
  Categories, "You might like" quick links.
- **Login**: minimal page (no full header), centred card: Mobile or Email, Password with eye toggle,
  "Forgot Password?", orange Login, "Create your Mamun Book account" outline button.
- **Register**: card form (Full Name, Email optional, Mobile, Password, Confirm, terms note, "Send OTP &
  Continue") + right column of benefits and dark "Are you a Publisher?" card.
- **Contact**: form (Name, Phone optional, Email, Subject select, Message with 0/5000 counter) +
  contact info card + Quick Links card.
- **FAQ**: centred title, filter chips (All / Ordering / Delivery / General), orange group headers
  with accordions, "Still have questions?" orange CTA strip.
- **About**: single bordered article card with H2 sections.
- **Deals**: title + empty-state card.

## 10. Interactions inventory

Marquee, hero autoplay slider, drawer menu, account dropdown, search suggestions, theme toggle,
language toggle, add to cart / wishlist toggles, mini-cart side tab, quantity stepper, gallery
thumbnails + zoom + lightbox, tabs, FAQ accordion, filters (category tree, price radios, type),
sort select, grid/list toggle, pagination, password visibility, form validation, bottom nav.

## 11. Content & licensing decision

Product titles, cover images, banners and publisher logos on the reference are third-party
copyrighted material. The recreation therefore uses **original demo content**: fictional titles and
authors, mock prices, and procedurally generated SVG covers/banners. Category names and structure
mirror the reference so navigation behaves the same.
