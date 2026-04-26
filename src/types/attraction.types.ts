export interface TouristAttractionCardItem {
  id: string;
  name: string;
  address: string;
  tagId: string;
  likes: number;
  imageUrl: string;
  latitude?: number;
  longitude?: number;
}

export interface TouristAttractionsSectionData {
  items: TouristAttractionCardItem[];
}