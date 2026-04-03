export interface VibeTag {
  id: string;
  name: string;
}

export interface TouristAttractionCardItem {
  id: string;
  name: string;
  address: string;
  tagId: string;
  likes: number;
  imageUrl: string;
}

export interface CraftCardItem {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
}

export interface TouristAttractionsSectionData {
  items: TouristAttractionCardItem[];
}

export interface CraftSectionData {
  items: CraftCardItem[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
}
