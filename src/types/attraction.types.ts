export interface TouristAttractionCardItem {
  id: string;
  name: string;
  address: string;
  tagId: string;
  likes: number;
  imageUrl: string;
}

export interface TouristAttractionsSectionData {
  items: TouristAttractionCardItem[];
}