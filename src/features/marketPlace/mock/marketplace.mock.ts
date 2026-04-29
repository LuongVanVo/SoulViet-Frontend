import type { MarketplaceCategory, MarketplaceItem } from '@/types'

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'tours', label: 'Tours' },
  { id: 'products', label: 'Products' },
  { id: 'eco', label: 'Eco-Tour' },
  { id: 'culinary', label: 'Culinary' },
  { id: 'traditional', label: 'Traditional' },
]

export const MARKETPLACE_LOCATIONS = [
  'Any Location',
  'Hoi An',
  'Da Nang',
  'Hue',
  'Da Lat',
  'Ha Noi',
  'Ho Chi Minh',
]

const items: MarketplaceItem[] = [
  {
    id: 'tour-emerald-waters',
    kind: 'tour',
    badgeLabel: 'TOUR',
    title: 'Emerald Waters Cruise & Cave Exploration',
    description: 'Discover the hidden gems of Halong Bay on a private cruise.',
    priceText: '$89.00',
    priceValue: 89,
    location: 'Ha Long',
    imageUrl:
      'https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=1400&q=80',
    likes: 2847,
    categoryId: 'eco',
  },
  {
    id: 'product-bat-trang',
    kind: 'product',
    badgeLabel: 'PRODUCT',
    title: 'Bat Trang Artisan Ceramic Set',
    description: 'Hand-painted bowls and tableware inspired by Bat Trang.',
    priceText: '$45.00',
    priceValue: 45,
    location: 'Bat Trang',
    imageUrl:
      'https://images.unsplash.com/photo-1523413651479-597eb2da0ad6?auto=format&fit=crop&w=1400&q=80',
    likes: 980,
    categoryId: 'traditional',
  },
  {
    id: 'tour-old-quarter',
    kind: 'tour',
    badgeLabel: 'TOUR',
    title: 'Old Quarter Culinary Night Safari',
    description: 'Taste local favorites guided through the historic streets.',
    priceText: '$49.00',
    priceValue: 49,
    location: 'Hanoi',
    imageUrl:
      'https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1400&q=80',
    likes: 1200,
    categoryId: 'culinary',
  },
  {
    id: 'product-van-phuc-scarf',
    kind: 'product',
    badgeLabel: 'PRODUCT',
    title: 'Van Phuc Silk Scarf',
    description: 'Luxury 100% natural silk with woven craft details.',
    priceText: '$35.00',
    priceValue: 35,
    location: 'Hanoi',
    imageUrl:
      'https://images.unsplash.com/photo-1520975958225-7c6e3c1c7c1c?auto=format&fit=crop&w=1400&q=80',
    likes: 620,
    categoryId: 'products',
  },

  // Wide tile như ảnh: 1 card chiếm 2 cột ở desktop
  {
    id: 'tour-hoi-an-lantern',
    kind: 'tour',
    badgeLabel: 'TOUR',
    title: 'Hoi An Ancient Town & Lanterns Night',
    description:
      'Immerse yourself in the magical atmosphere of Hoi An. Take a guided walk through the historic streets.',
    priceText: '$55.00',
    priceValue: 55,
    location: 'Hoi An',
    imageUrl:
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
    likes: 1900,
    featured: true,
    categoryId: 'traditional',
    ctaLabel: 'Book Experience',
  } as any, // (repo UI-first: không cần ép strict CTA label ở type hiện tại)
  {
    id: 'product-robusta-phin',
    kind: 'product',
    badgeLabel: 'PRODUCT',
    title: 'Premium Robusta Phin Kit',
    description: 'Bring the authentic taste of Vietnamese coffee to your home.',
    priceText: '$28.00',
    priceValue: 28,
    location: 'Da Nang',
    imageUrl:
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80',
    likes: 540,
    categoryId: 'products',
  },
]

export const MARKETPLACE_ITEMS: MarketplaceItem[] = items.map((x) => {
  // hack nhỏ: mock wide tile có thể kèm ctaLabel (không thuộc type cứng)
  // UI sẽ quyết định CTA theo kind (tour/product) nên không ảnh hưởng.
  return x
})