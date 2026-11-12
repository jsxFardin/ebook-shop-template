# Implementation Progress

Status as of 2026-11-12. Stack: React 19 · Vite 6 · TypeScript · Tailwind CSS 4 · React Router 7 · Zustand 5 · Swiper 14 · lucide-react.
The repository was empty, so React (Option A) was chosen.

| Phase | Status | Notes |
|---|---|---|
| 1. Reference audit | ✅ | `docs/REFERENCE_WEBSITE_AUDIT.md`, screenshots in `docs/reference/` |
| 2. Project setup | ✅ | Vite React-TS, Tailwind v4 plugin, vendor/swiper/catalog chunks |
| 3. Design system | ✅ | Tokens in `src/styles/index.css` (CSS vars → Tailwind `@theme`), light + dark |
| 4. Homepage | ✅ | All reference sections in order (see audit §5) |
| 5. Product catalog | ✅ | Card, grid, list row, quick view, gallery with zoom + lightbox, reviews |
| 6. Routes | ✅ | Reference URL scheme with `/en` · `/bn` prefix; brief aliases redirect |
| 7. Interactions | ✅ | Search suggestions, cart, wishlist, filters, drawer, mini cart, i18n, theme, forms |
| 8. Mock data | ✅ | `scripts/generate-data.mjs` → `src/data/*.json` (fictional catalog) |
| 9. Responsive | ✅ | Checked at 1920 / 1440 / 1366 / 1024 / 768 / 430 / 390 / 375 / 360 |
| 10. QA | ✅ | See below |

## Routes

`/` → `/en`. Under `/:lang` (`en` | `bn`):
`/`, `/products` (`?category= search= sort_by= type= price= min= max= author= publisher= brand= stock= page= view=`),
`/products/:slug`, `/authors`, `/authors/:slug`, `/publishers`, `/publishers/:slug`, `/brands`, `/brands/:slug`,
`/deals`, `/cart`, `/wishlist`, `/account/wishlist`, `/checkout`*, `/account`*, `/account/orders`*, `/account/orders/:id`*,
`/account/profile`*, `/login`, `/register`, `/forgot-password`, `/about`, `/contact`, `/faq`, `/privacy`, `/terms`,
`/returns`, `/career`, `/blog`, `/delete-account`, 404 catch-all.
Aliases: `/categories/:slug` → `/products?category=`, `/search?q=` → `/products?search=`. (* = mock-auth guarded → `/login?redirect=`)

## State (localStorage)

`mb-cart` (items, coupon), `mb-wishlist`, `mb-auth` (mock user + orders), `mb-ui` (theme, delivery district, recently viewed).
Coupons for demo: `MAMUN10` (10%, cap ৳200), `BOOKFAIR` (15%, cap ৳300). Delivery ৳60 inside Dhaka (free ≥ ৳1,500), ৳120 outside.

## QA performed

- `npm test` — catalog/cart logic assertions (filtering, sorting, pagination window, totals, coupons, phone validation, Bangla digits).
- Playwright sweep of 32 routes at 9 widths: no console errors, no page errors, no horizontal overflow, no broken images.
- Playwright flow: search suggestions → submit, add to cart, toast, header count, wishlist persistence across reload,
  mini cart qty, category drawer accordion, quick view, price filter + sort order, dark mode, language switch,
  checkout guard → login validation → redirect → checkout validation → order placed → cart cleared → cancel order,
  newsletter validation, mobile bottom-nav drawer. All passing.
- `npm run build` and `eslint` clean (only react-refresh dev warnings for co-located helpers).

## Deliberate differences from the reference

- Catalog content is original demo data with generated SVG covers/product art and initials logos — no third-party
  titles, cover images, logos or prices are copied (audit §11). Swap in licensed data by replacing `src/data/*.json`;
  `ProductArt` already uses a product `image` URL when present and falls back to generated art on error.
- Deals page lists products ≥ 30% off instead of the reference's empty state.
- Publisher/Brand/Wholesale portal links open the shared login with a portal label (portals are backend features).
- Payment options are mock (COD, bKash, Nagad); no payment service is contacted.

## Not done / follow-ups

- No real product photography; hero/promo banners are CSS/SVG compositions rather than photo banners.
- Bangla translation covers UI chrome; long-form page copy is English.
