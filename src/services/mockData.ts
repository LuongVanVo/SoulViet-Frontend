import type {
  VibeTag,
  CraftCardItem,
  CraftSectionData,
  TouristAttractionsSectionData,
  TouristAttractionCardItem,
  SocialPost,
  UserProfile,
} from '../types';

const CATEGORY_TAGS: VibeTag[] = [
  { id: 1, name: 'Chữa lành & Yên bình' },
  { id: 2, name: 'Năng động & Phiêu lưu' },
  { id: 3, name: 'Sang trọng & Đẳng cấp' },
  { id: 4, name: 'Sáng tạo & Truyền cảm hứng' },
  { id: 5, name: 'Trải nghiệm đa dạng' },
  { id: 6, name: 'Đậm văn hóa & Bản địa' },
];

const TOURIST_ATTRACTIONS_CARDS: TouristAttractionCardItem[] = [
  {
    id: 's1',
    name: 'Làng Gốm Thanh Hà',
    address: 'Hội An, Quảng Nam',
    tagId: 'peaceful',
    likes: 2847,
    imageUrl: '',
  },
  {
    id: 's2',
    name: 'Hoàng Cung Huế Cổ Kính',
    address: 'Huế, Thừa Thiên Huế',
    tagId: 'peaceful',
    likes: 2847,
    imageUrl: '',
  },
  {
    id: 's3',
    name: 'Bãi Biển Mỹ Khê Huyền Ảo',
    address: 'Đà Nẵng',
    tagId: 'adventure',
    likes: 1520,
    imageUrl: '',
  },
  {
    id: 's4',
    name: 'Làng Gốm Bát Tràng',
    address: 'Bát Tràng, Hà Nội',
    tagId: 'healing',
    likes: 3210,
    imageUrl: '',
  },
];

const CRAFT_CARDS: CraftCardItem[] = [
  {
    id: 'silk-village',
    name: 'Dệt Lụa',
    location: 'Mã Châu',
    imageUrl: '',
  },
  {
    id: 'silk-village',
    name: 'Dệt Lụa',
    location: 'Mã Châu',
    imageUrl: '',
  },
  {
    id: 'silk-village',
    name: 'Dệt Lụa',
    location: 'Mã Châu',
    imageUrl: '',
  },
  {
    id: 'conical-hat',
    name: 'Nón Lá',
    location: 'Huế',
    imageUrl: '',
  },
  {
    id: 'lacquerware',
    name: 'Sơn Mài',
    location: 'Hà Thái',
    imageUrl: '',
  },
];

const TOURIST_ATTRACTIONS_SECTION: TouristAttractionsSectionData = {
  items: TOURIST_ATTRACTIONS_CARDS,
};

const CRAFT_SECTION: CraftSectionData = {
  items: CRAFT_CARDS,
};

const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    userId: 'user-1',
    author: 'Nguyen',
    avatar: 'User',
    timeAgo: '2 giờ trước',
    location: 'Hội An',
    vibe: 'social.feed.post.vibes.calm',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    caption: 'Một buổi chiều rất yên ở Hội An, ánh đèn bắt đầu lên và mọi thứ chậm lại.',
    likes: 234,
    comments: 18,
    rewardCoins: 25,
  },
  {
    id: 'post-2',
    userId: 'user-1',
    author: 'Nguyen',
    avatar: 'User',
    timeAgo: '1 ngày trước',
    location: 'Huế',
    vibe: 'social.feed.post.vibes.calm',
    image: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=1200&q=80',
    caption: 'Ghé Huế đúng lúc trời dịu nắng, ăn chén chè rồi đi bộ quanh Đại Nội.',
    likes: 98,
    comments: 7,
    rewardCoins: 18,
  },
  {
    id: 'post-3',
    userId: 'user-2',
    author: 'Mai Linh',
    avatar: 'User',
    timeAgo: '3 ngày trước',
    location: 'Đà Nẵng',
    vibe: 'social.feed.post.vibes.calm',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80',
    caption: 'Sáng biển rất nhẹ, thích hợp để nạp năng lượng trước một tuần mới.',
    likes: 176,
    comments: 13,
    rewardCoins: 22,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const CURRENT_USER: UserProfile | null = null;

export const apiService = {
  async getVibeTags(): Promise<VibeTag[]> {
    await delay(300);
    return CATEGORY_TAGS;
  },
  async getTouristAttractionsCards(): Promise<TouristAttractionsSectionData> {
    await delay(500);
    return TOURIST_ATTRACTIONS_SECTION;
  },
  async getCraftSection(): Promise<CraftSectionData> {
    await delay(400);
    return CRAFT_SECTION;
  },
  async getCurrentUser(): Promise<UserProfile | null> {
    await delay(200);
    return CURRENT_USER;
  },
  async getSocialPosts(): Promise<SocialPost[]> {
    await delay(250);
    return SOCIAL_POSTS;
  },
  async getUserSocialPosts(userId: string): Promise<SocialPost[]> {
    await delay(250);
    return SOCIAL_POSTS.filter((post) => post.userId === userId);
  },
};