import { useEffect, useState } from 'react';
import type { BottomNavTab } from '@/types/home';

const STORAGE_KEY = 'soulviet-bottom-nav-tab';
const defaultTab: BottomNavTab = 'home';

const isBottomNavTab = (value: string | null): value is BottomNavTab => {
  return value === 'home' || value === 'map' || value === 'aiPlan' || value === 'social' || value === 'marketplace';
};

export const useBottomNav = () => {
  const [activeTab, setActiveTab] = useState<BottomNavTab>(defaultTab);

  useEffect(() => {
    const storedTab = sessionStorage.getItem(STORAGE_KEY);

    if (isBottomNavTab(storedTab)) {
      setActiveTab(storedTab);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, activeTab);
  }, [activeTab]);

  return {
    activeTab,
    setActiveTab
  };
};