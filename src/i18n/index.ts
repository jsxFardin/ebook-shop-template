import { useParams } from 'react-router'
import type { Lang } from '../types'

const en = {
  latest: 'LATEST',
  publisherLogin: 'Publisher Login', brandLogin: 'Brand Login', wholesaleLogin: 'Wholesale Login',
  login: 'Login', register: 'Register', logout: 'Sign out',
  searchPlaceholder: 'Search by title, author, brand, publisher, ISBN...',
  deliverTo: 'Deliver to', hello: 'Hello, Sign in', helloUser: 'Hello,', accountLists: 'Account & Lists',
  cart: 'Cart', wishlist: 'Wishlist', account: 'Account', home: 'Home', categories: 'Categories',
  allCategories: 'All Categories', bulkOrder: 'Bulk Order', authors: 'Authors', brands: 'Brands', publishers: 'Publishers',
  searchCategories: 'Search categories...', newArrivals: 'New Arrivals', bestsellers: 'Bestsellers',
  featured: 'Featured Products', bestsellingBooks: 'Bestselling Books', bestsellingProducts: 'Bestselling Products',
  seeMore: 'See more', seeAll: 'See all', addToCart: 'Add to Cart', outOfStock: 'Out of Stock', buyNow: 'Buy Now',
  by: 'by', inStock: 'In Stock', onlyLeft: 'Only {n} left', quantity: 'Quantity', save: 'Save',
  browsePublisher: 'Browse by Publisher', browseAuthor: 'Browse by Author', topBrands: 'Top Brands',
  myAccount: 'My Account', myOrders: 'My Orders', myProfile: 'Profile', yourWishlist: 'Your Wishlist',
  addedToCart: 'Added to cart', addedToWishlist: 'Added to wishlist', removedFromWishlist: 'Removed from wishlist',
  hot: 'HOT', subscribe: 'Subscribe', yourEmail: 'Your email',
}
type Key = keyof typeof en
const bn: Record<Key, string> = {
  latest: 'সর্বশেষ',
  publisherLogin: 'প্রকাশক লগইন', brandLogin: 'ব্র্যান্ড লগইন', wholesaleLogin: 'পাইকারি লগইন',
  login: 'লগইন', register: 'রেজিস্টার', logout: 'সাইন আউট',
  searchPlaceholder: 'বইয়ের নাম, লেখক, ব্র্যান্ড, প্রকাশক, ISBN দিয়ে খুঁজুন...',
  deliverTo: 'ডেলিভারি', hello: 'হ্যালো, সাইন ইন', helloUser: 'হ্যালো,', accountLists: 'অ্যাকাউন্ট ও তালিকা',
  cart: 'কার্ট', wishlist: 'উইশলিস্ট', account: 'অ্যাকাউন্ট', home: 'হোম', categories: 'ক্যাটাগরি',
  allCategories: 'সকল ক্যাটাগরি', bulkOrder: 'বাল্ক অর্ডার', authors: 'লেখক', brands: 'ব্র্যান্ড', publishers: 'প্রকাশনী',
  searchCategories: 'ক্যাটাগরি খুঁজুন...', newArrivals: 'নতুন বই', bestsellers: 'বেস্টসেলার',
  featured: 'ফিচার্ড পণ্য', bestsellingBooks: 'বেস্টসেলিং বই', bestsellingProducts: 'বেস্টসেলিং পণ্য',
  seeMore: 'আরও দেখুন', seeAll: 'সব দেখুন', addToCart: 'কার্টে যোগ করুন', outOfStock: 'স্টক নেই', buyNow: 'এখনই কিনুন',
  by: 'লেখক', inStock: 'স্টকে আছে', onlyLeft: 'মাত্র {n}টি বাকি', quantity: 'পরিমাণ', save: 'সাশ্রয়',
  browsePublisher: 'প্রকাশনী অনুযায়ী', browseAuthor: 'লেখক অনুযায়ী', topBrands: 'সেরা ব্র্যান্ড',
  myAccount: 'আমার অ্যাকাউন্ট', myOrders: 'আমার অর্ডার', myProfile: 'প্রোফাইল', yourWishlist: 'আপনার উইশলিস্ট',
  addedToCart: 'কার্টে যোগ হয়েছে', addedToWishlist: 'উইশলিস্টে যোগ হয়েছে', removedFromWishlist: 'উইশলিস্ট থেকে সরানো হয়েছে',
  hot: 'হট', subscribe: 'সাবস্ক্রাইব', yourEmail: 'আপনার ইমেইল',
}

export const useLang = (): Lang => (useParams().lang === 'bn' ? 'bn' : 'en')

/** Translation + locale-prefixed path helper. */
export function useT() {
  const lang = useLang()
  const dict = lang === 'bn' ? bn : en
  const t = (k: Key, vars?: Record<string, string | number>) =>
    vars ? dict[k].replace(/\{(\w+)\}/g, (_, v) => String(vars[v])) : dict[k]
  const to = (path: string) => `/${lang}${path === '/' ? '' : path}`
  return { t, lang, to }
}
