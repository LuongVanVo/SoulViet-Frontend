import apiClient from '@/services/api';
import type { HomeData, HomeProduct, HomeStory } from '@/types/home';

const homeProducts: HomeProduct[] = [
  {
    id: 'product-1',
    title: 'Đèn lồng lụa Hội An',
    description: 'Được chế tác thủ công bởi các nghệ nhân bậc thầy tại Hội An bằng kỹ thuật dệt truyền thống.',
    price: '$45',
    location: 'Hội An',
    tag: 'Quà lưu niệm',
    imageUrl: 'https://images.unsplash.com/photo-1771659753568-f3720e0e81e8?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ctaLabel: 'THÊM VÀO GIỎ'
  },
  {
    id: 'product-2',
    title: "Trekking bản làng H'Mông",
    description: 'Tour du lịch sinh thái nhóm nhỏ băng qua những thung lũng núi non và ruộng bậc thang hùng vĩ.',
    price: '$120 / người',
    location: 'Sa Pa',
    tag: 'Tour sinh thái',
    imageUrl: 'https://images.unsplash.com/photo-1677853918896-a47126ed778d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ctaLabel: 'ĐẶT NGAY'
  },
  {
    id: 'product-3',
    title: 'Bộ ấm trà gốm sứ',
    description: 'Bộ ấm trà bằng đất sét tinh xảo lấy cảm hứng từ truyền thống gốm sứ làng quê miền Bắc.',
    price: '$38',
    location: 'Bát Tràng',
    tag: 'Thủ công',
    imageUrl: 'https://images.unsplash.com/photo-1515823662972-da6a2eac0007?auto=format&fit=crop&w=1200&q=80',
    ctaLabel: 'XEM CHI TIẾT'
  }
];

const homeStories: HomeStory[] = [
  {
    id: 'story-1',
    authorName: 'Bao Nguyen',
    authorLocation: 'Đà Nẵng',
    avatarUrl: '',
    content: 'Tìm thấy một quán phở ẩn mình trong con ngõ nhỏ hẹp tại Đà Nẵng. Nước dùng thực sự đậm đà và mang hương vị rất riêng.',
    likes: 248,
    comments: 12,
    imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'story-2',
    authorName: 'Vo Luong',
    authorLocation: 'Huế',
    avatarUrl: '',
    content: 'Cố đô Huế bình yên đến lạ thường lúc bình minh. Thực sự khuyên bạn nên trải nghiệm cảm giác chèo thuyền trên sông Hương vào sáng sớm.',
    likes: 152,
    comments: 45,
    imageUrl: 'https://images.unsplash.com/photo-1705823637026-92c0ef6d6222?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'story-3',
    authorName: 'Hoang Oanh',
    authorLocation: 'Hội An',
    avatarUrl: '',
    content: 'Hội An nhớ nyc',
    likes: 109,
    comments: 8,
    imageUrl: 'https://images.unsplash.com/photo-1652731011413-93d4c5aa5c7c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
];

const fallbackHomeData: HomeData = {
  products: homeProducts,
  stories: homeStories
};

export const homeService = {
  async getHomeData(): Promise<HomeData> {
    try {
      const response = await apiClient.get<HomeData>('/home');
      return response.data;
    } catch {
      return fallbackHomeData;
    }
  }
};