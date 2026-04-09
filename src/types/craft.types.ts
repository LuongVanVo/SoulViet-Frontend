export interface CraftCardItem {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
}

export interface CraftSectionData {
  items: CraftCardItem[];
}