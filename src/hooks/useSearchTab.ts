import { useState } from 'react';
import type { SearchTab } from '@/types/home';

const defaultSearchTab: SearchTab = 'stays';

export const useSearchTab = () => {
  const [activeTab, setActiveTab] = useState<SearchTab>(defaultSearchTab);

  return {
    activeTab,
    setActiveTab
  };
};