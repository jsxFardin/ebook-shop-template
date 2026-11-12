# Mamun Books — frontend recreation

Frontend-only recreation of mamunbooks.com built with React, Vite, TypeScript, Tailwind CSS 4, React Router 7, Zustand and Swiper.
All data is local mock JSON; cart, wishlist, mock auth and orders persist in localStorage.

```bash
npm install
npm run dev        # http://localhost:5173/en
npm run build      # production build in dist/
npm test           # catalog + cart logic checks
node scripts/generate-data.mjs   # regenerate src/data/*.json
```

For static hosting, serve `index.html` for unknown paths (SPA fallback).

Docs: [reference audit](docs/REFERENCE_WEBSITE_AUDIT.md) · [implementation progress](docs/IMPLEMENTATION_PROGRESS.md)
