import type {
  VibeTag,
  CraftCardItem,
  CraftSectionData,
  TouristAttractionsSectionData,
  TouristAttractionCardItem,
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

const CURRENT_USER: UserProfile | null = null;

export const apiService = {
  async getVibeTags(): Promise<VibeTag[]> {
    return new Promise((resolve) => setTimeout(() => resolve(CATEGORY_TAGS), 300));
  },
  async getTouristAttractionsCards(): Promise<TouristAttractionsSectionData> {
    return new Promise((resolve) => setTimeout(() => resolve(TOURIST_ATTRACTIONS_SECTION), 500));
  },
  async getCraftSection(): Promise<CraftSectionData> {
    return new Promise((resolve) => setTimeout(() => resolve(CRAFT_SECTION), 400));
  },
  async getCurrentUser(): Promise<UserProfile | null> {
    return new Promise((resolve) => setTimeout(() => resolve(CURRENT_USER), 200));
  },
};