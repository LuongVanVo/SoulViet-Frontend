export type SearchTab = 'stays' | 'tours' | 'souvenirs';

export type BottomNavTab = 'home' | 'map' | 'aiPlan' | 'social' | 'marketplace';

export interface HomeProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  tag: string;
  imageUrl: string;
  ctaLabel: string;
}

export interface HomeStory {
  id: string;
  authorName: string;
  authorLocation: string;
  avatarUrl: string;
  content: string;
  likes: number;
  comments: number;
  imageUrl: string;
}

export interface HomeData {
  products: HomeProduct[];
  stories: HomeStory[];
}