export type Lang = 'en' | 'bn'

export interface Category {
  slug: string
  name: string
  parent: string | null
  type: 'book' | 'general'
  /** lucide icon name used for generated product art in this category */
  icon: string
  /** hue used for generated art + category box tint */
  hue: number
  image?: string
}

export interface Person {
  slug: string
  name: string
  nameBn?: string
  bio: string
  hue: number
  initials: string
  image?: string
}

export interface Review {
  id: string
  name: string
  rating: number
  date: string
  text: string
}

export interface Product {
  id: string
  slug: string
  title: string
  subtitle?: string
  type: 'book' | 'general'
  category: string
  authors: string[]
  publisher?: string
  brand?: string
  price: number
  originalPrice?: number
  stock: number
  sku: string
  isbn?: string
  language?: string
  pages?: number
  coverType?: string
  size?: string
  weight?: number
  edition?: string
  grade?: string
  origin?: string
  description: string[]
  highlights: string[]
  images: number
  hue: number
  featured: boolean
  soldCount: number
  createdAt: string
  rating: number
  reviews: Review[]
  image?: string
}

export interface CartItem {
  id: string
  qty: number
}

export interface Address {
  name: string
  phone: string
  email?: string
  district: string
  area: string
  address: string
}

export interface Order {
  id: string
  date: string
  items: { id: string; title: string; price: number; qty: number }[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  payment: 'cod' | 'bkash' | 'nagad' | 'card'
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  address: Address
}

export interface User {
  name: string
  phone: string
  email?: string
}
